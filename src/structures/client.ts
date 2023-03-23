import {
  Client as DiscordClient,
  ClientOptions as DiscordClientOptions,
  Collection,
  Events,
  GuildMember,
  Interaction,
} from 'discord.js';

import { loadCommands } from '../handlers/commands';
import { loadEvents } from '../handlers/events';
import { createErrorEmbed } from '../utils/embeds';
import Command from './command';

export interface ClientOptions extends DiscordClientOptions {
  eventsDir?: string;
  commandsDir?: string;
}

export default class Client extends DiscordClient {
  eventsDir: string;
  commandsDir: string;

  commands: Collection<string, Command> = new Collection();

  constructor(options: ClientOptions) {
    const { eventsDir, commandsDir, ...rest } = options;

    super(rest);

    this.eventsDir = eventsDir ?? 'events';
    this.commandsDir = commandsDir ?? 'commands';

    this.once(Events.ClientReady, async () => {
      await this.deployCommands();
    });

    this.on(Events.InteractionCreate, async (interaction: Interaction) => {
      await this.handleCommandInteractions(interaction);
    });
  }

  async initialize(token: string): Promise<void> {
    await Promise.all([loadEvents(this), loadCommands(this)]);

    await this.login(token);
  }

  private async deployCommands(): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Client is not ready.');
    }

    await this.application.commands.set(
      this.commands.map((command) => command.data)
    );
  }

  private async handleCommandInteractions(
    interaction: Interaction
  ): Promise<void> {
    if (
      !interaction.isChatInputCommand() &&
      !interaction.isContextMenuCommand() &&
      !interaction.isMessageContextMenuCommand() &&
      !interaction.isUserContextMenuCommand()
    ) {
      return;
    }

    const commandName = interaction.commandName.toLowerCase();
    const command = this.commands.get(commandName);

    if (!command) {
      console.error(`No command matching ${commandName} was found.`);

      return;
    }

    if (command.requiredPermissions) {
      const memberPermissions = (interaction.member as GuildMember)
        ?.permissions;

      if (!memberPermissions) {
        await interaction.reply({
          embeds: [createErrorEmbed('Failed to fetch member permissions.')],
        });

        return;
      }

      const missingPermissions = memberPermissions.missing(
        command.requiredPermissions
      );

      if (missingPermissions.length > 0) {
        await interaction.reply({
          embeds: [
            createErrorEmbed(
              `Missing member permissions: ${missingPermissions.join(', ')}`
            ),
          ],
        });

        return;
      }
    }

    if (command.requiredBotPermissions) {
      const botPermissions = interaction.guild?.members.me?.permissions;

      if (!botPermissions) {
        await interaction.reply({
          embeds: [createErrorEmbed('Failed to fetch bot permissions.')],
        });

        return;
      }

      const missingPermissions = botPermissions.missing(
        command.requiredBotPermissions
      );

      if (missingPermissions.length > 0) {
        await interaction.reply({
          embeds: [
            createErrorEmbed(
              `Missing bot permissions: ${missingPermissions.join(', ')}`
            ),
          ],
        });

        return;
      }
    }

    try {
      await command.execute(interaction, this);
    } catch (err) {
      console.error(err);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          embeds: [createErrorEmbed('Unknown error.')],
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          embeds: [createErrorEmbed('Unknown error.')],
          ephemeral: true,
        });
      }
    }
  }
}

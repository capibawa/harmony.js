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

export interface ModuleLoaderOptions {
  eventsDir?: string;
  commandsDir?: string;
}

export interface ClientOptions extends DiscordClientOptions {
  moduleLoader?: ModuleLoaderOptions;
}

export default class Client extends DiscordClient {
  moduleLoader: Required<ModuleLoaderOptions> = {
    eventsDir: 'events',
    commandsDir: 'commands',
  };

  commands: Collection<string, Command> = new Collection();

  constructor(options: ClientOptions) {
    const { moduleLoader: moduleLoaderOptions, ...clientOptions } = options;

    super(clientOptions);

    if (moduleLoaderOptions) {
      this.moduleLoader = { ...this.moduleLoader, ...moduleLoaderOptions };
    }

    this.once(Events.ClientReady, async () => {
      await this.deployCommands();
    });

    this.on(Events.InteractionCreate, async (interaction: Interaction) => {
      await this.handleCommandInteraction(interaction);
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

  private async handleCommandInteraction(
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

    if (command.userPermissions) {
      const permissions = (interaction.member as GuildMember)?.permissions;

      if (!permissions) {
        await interaction.reply({
          embeds: [createErrorEmbed('Failed to fetch user permissions.')],
        });

        return;
      }

      const missingPermissions = permissions.missing(command.userPermissions);

      if (missingPermissions.length > 0) {
        await interaction.reply({
          embeds: [
            createErrorEmbed(
              `Missing user permissions: ${missingPermissions.join(', ')}`
            ),
          ],
        });

        return;
      }
    }

    if (command.botPermissions) {
      const permissions = interaction.guild?.members.me?.permissions;

      if (!permissions) {
        await interaction.reply({
          embeds: [createErrorEmbed('Failed to fetch bot permissions.')],
        });

        return;
      }

      const missingPermissions = permissions.missing(command.botPermissions);

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

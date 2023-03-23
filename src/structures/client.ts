import {
  Client as DiscordClient,
  ClientOptions as DiscordClientOptions,
  Collection,
  Colors,
  EmbedBuilder,
  Events,
  Interaction,
} from 'discord.js';

import { loadCommands } from '../handlers/commands';
import { loadEvents } from '../handlers/events';
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

    try {
      await command.execute(interaction, this);
    } catch (err) {
      console.error(err);

      const embed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setDescription('An error occurred while executing this command.');

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          embeds: [embed],
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      }
    }
  }
}

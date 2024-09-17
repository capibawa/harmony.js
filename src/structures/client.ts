import {
  Collection,
  Client as DiscordClient,
  Events,
  type ClientOptions as DiscordClientOptions,
  type Interaction,
} from 'discord.js';
import { RateLimiterMemory } from 'rate-limiter-flexible';

import Command from '@/structures/command.js';
import Validation from '@/structures/validation.js';
import {
  deployCommands,
  loadCommands,
  loadValidations,
} from '@/handlers/commands/index.js';
import { loadEvents } from '@/handlers/events/index.js';
import { createErrorEmbed } from '@/utils/embeds.js';
import logger from '@/utils/logger.js';

export interface HarmonyOptions {
  eventsDir?: string;
  commandsDir?: string;
  validationsDir?: string;
}

export interface ClientOptions extends DiscordClientOptions {
  harmony?: HarmonyOptions;
}

export default class Client extends DiscordClient {
  harmony: Required<HarmonyOptions> = {
    eventsDir: 'events',
    commandsDir: 'commands',
    validationsDir: 'validations',
  };

  commands: Collection<string, Command> = new Collection();
  limiters: Collection<string, RateLimiterMemory> = new Collection();
  validations: Array<Validation> = [];

  constructor(options: ClientOptions) {
    const { harmony: harmonyOptions, ...clientOptions } = options;

    super(clientOptions);

    if (harmonyOptions) {
      this.harmony = { ...this.harmony, ...harmonyOptions };
    }

    this.once(Events.ClientReady, async () => {
      await deployCommands(this);
    });

    this.on(Events.InteractionCreate, async (interaction: Interaction) => {
      await this.handleCommandInteraction(interaction);
    });
  }

  async initialize(token: string): Promise<void> {
    await Promise.all([
      loadEvents(this),
      loadCommands(this),
      loadValidations(this),
    ]);

    await this.login(token);
  }

  private async handleCommandInteraction(
    interaction: Interaction,
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
      logger.error('No command matching %s was found.', commandName);
      return;
    }

    let isValid = true;

    for (const validation of this.validations) {
      isValid = await validation.execute(command, interaction, this);

      if (!isValid) {
        break;
      }
    }

    if (!isValid) {
      const embed = createErrorEmbed('This command cannot be executed.');

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else if (interaction.deferred) {
        await interaction.editReply({ embeds: [embed] });
      }

      return;
    }

    try {
      await command.execute(interaction, this);
    } catch (err) {
      logger.error(err);

      const embed = createErrorEmbed('Unknown error.');

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
  }
}

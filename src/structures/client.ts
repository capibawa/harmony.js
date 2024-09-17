import {
  Collection,
  Client as DiscordClient,
  Events,
  type ClientOptions as DiscordClientOptions,
} from 'discord.js';
import { RateLimiterMemory } from 'rate-limiter-flexible';

import Command from '@/structures/command.js';
import Validation from '@/structures/validation.js';
import {
  deployCommands,
  executeCommand,
  loadCommands,
} from '@/handlers/commands/index.js';
import { loadValidations } from '@/handlers/commands/validations/index.js';
import { loadEvents } from '@/handlers/events/index.js';

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
  validations: Validation[] = [];

  constructor(options: ClientOptions) {
    const { harmony: harmonyOptions, ...clientOptions } = options;

    super(clientOptions);

    if (harmonyOptions) {
      this.harmony = { ...this.harmony, ...harmonyOptions };
    }

    this.once(Events.ClientReady, async () => {
      await deployCommands(this);
    });

    this.on(Events.InteractionCreate, async (interaction) => {
      await executeCommand(this, interaction);
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
}

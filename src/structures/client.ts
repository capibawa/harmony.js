import {
  Collection,
  Client as DiscordClient,
  Events,
  type ClientOptions as DiscordClientOptions,
} from 'discord.js';

import Command from '@/structures/command.js';
import Validation from '@/structures/validation.js';
import {
  deployCommands,
  executeCommand,
  loadCommands,
} from '@/handlers/commands/index.js';
import { loadValidations } from '@/handlers/commands/validations/index.js';
import { loadEvents } from '@/handlers/events/index.js';

export interface HarmonyClientOptions {
  /**
   * The directory where event files are located.
   * @default 'events'
   */
  eventsDir?: string;

  /**
   * The directory where command files are located.
   * @default 'commands'
   */
  commandsDir?: string;

  /**
   * The directory where validation files are located.
   * @default 'validations'
   */
  validationsDir?: string;
}

export interface ClientOptions extends DiscordClientOptions {
  /**
   * Options specific to the harmony.js client.
   */
  harmony?: HarmonyClientOptions;
}

export default class Client extends DiscordClient {
  /**
   * Default options for the harmony.js client.
   */
  harmony: Required<HarmonyClientOptions> = {
    eventsDir: 'events',
    commandsDir: 'commands',
    validationsDir: 'validations',
  };

  /**
   * A collection of registered commands.
   */
  commands: Collection<string, Command> = new Collection();

  /**
   * An array of registered validations.
   */
  validations: Validation[] = [];

  /**
   * A collection of cooldowns for commands.
   */
  cooldowns: Collection<string, Collection<string, number>> = new Collection();

  /**
   * Creates a new instance of the Client class.
   */
  constructor(options: ClientOptions) {
    const { harmony: harmonyClientOptions, ...clientOptions } = options;

    super(clientOptions);

    if (harmonyClientOptions) {
      this.harmony = { ...this.harmony, ...harmonyClientOptions };
    }

    /**
     * Event listener for the 'ready' event.
     * Deploys the commands when the client is ready.
     */
    this.once(Events.ClientReady, async () => {
      await deployCommands(this);
    });

    /**
     * Event listener for the 'interactionCreate' event.
     * Executes the corresponding command when an interaction is received.
     */
    this.on(Events.InteractionCreate, async (interaction) => {
      await executeCommand(this, interaction);
    });
  }
  /**
   * Initializes the harmony.js client by loading events, commands, and validations, and then logging in.
   * @param token - The bot token used to log into Discord.
   */
  async initialize(token: string): Promise<void> {
    await Promise.all([
      loadEvents(this),
      loadCommands(this),
      loadValidations(this),
    ]);

    await this.login(token);
  }
}

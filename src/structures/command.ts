import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import type { IRateLimiterOptions } from 'rate-limiter-flexible';

import Client from '@/structures/client.js';

export interface CommandArgs {
  client: Client;
  interaction: ChatInputCommandInteraction;
}

export default class Command {
  /**
   * Indicates whether the command is disabled or not.
   * If set to true, the command will not be registered or executed.
   */
  disabled?: boolean;

  /**
   * The rate limiter options for the command.
   * If set, the member can only execute the command again after the specified number of actions.
   */
  rateLimiter?: IRateLimiterOptions;

  /**
   * The command definition object used to register the command with Discord.
   * It defines the command's name, description, options, and other properties.
   */
  data:
    | Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>
    | SlashCommandSubcommandsOnlyBuilder;

  /**
   * The function that gets executed whenever the command is invoked by a member.
   * It receives the client instance and the interaction object as parameters.
   */
  execute: (args: CommandArgs) => Promise<void>;

  /**
   * Creates a new instance of the Command class.
   */
  constructor(options: Command) {
    this.disabled = options.disabled;
    this.rateLimiter = options.rateLimiter;
    this.data = options.data;
    this.execute = options.execute;
  }
}

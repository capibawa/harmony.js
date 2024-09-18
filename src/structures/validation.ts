import type { ChatInputCommandInteraction } from 'discord.js';

import Client from '@/structures/client.js';
import Command from '@/structures/command.js';

export interface ValidationArgs {
  client: Client;
  command: Command;
  interaction: ChatInputCommandInteraction;
}

export default class Validation {
  /**
   * The function that gets executed whenever a command is invoked.
   * It receives the client instance, the command instance, and the interaction object as parameters.
   * The function should return a boolean value indicating whether the command will be executed or not.
   */
  execute: (args: ValidationArgs) => Promise<boolean>;

  /**
   * Creates a new instance of the Validation class.
   */
  constructor(options: Validation) {
    this.execute = options.execute;
  }
}

import type { ChatInputCommandInteraction } from 'discord.js';

import Client from '@/structures/client.js';
import Command from '@/structures/command.js';

export interface ValidationOptions {
  execute(
    command: Command,
    interaction: ChatInputCommandInteraction,
    client: Client,
  ): Promise<boolean>;
}

export default class Validation {
  execute: ValidationOptions['execute'];

  constructor(options: ValidationOptions) {
    this.execute = options.execute;
  }
}

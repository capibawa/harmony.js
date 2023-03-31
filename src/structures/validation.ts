import {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
} from 'discord.js';

import Client from './client';
import Command from './command';

export interface ValidationOptions {
  execute(
    command: Command,
    interaction:
      | ChatInputCommandInteraction
      | ContextMenuCommandInteraction
      | MessageContextMenuCommandInteraction
      | UserContextMenuCommandInteraction,
    client: Client
  ): Promise<boolean>;
}

export default class Validation {
  execute: ValidationOptions['execute'];

  constructor(options: ValidationOptions) {
    this.execute = options.execute;
  }
}

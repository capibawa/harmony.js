import {
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  UserContextMenuCommandInteraction,
} from 'discord.js';

import Client from './client';

export interface CommandOptions {
  data:
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
    | SlashCommandSubcommandsOnlyBuilder
    | ContextMenuCommandBuilder;
  execute(
    interaction:
      | ChatInputCommandInteraction
      | ContextMenuCommandInteraction
      | MessageContextMenuCommandInteraction
      | UserContextMenuCommandInteraction,
    client: Client
  ): Promise<void>;
}

export default class Command {
  data: CommandOptions['data'];
  execute: CommandOptions['execute'];

  constructor(options: CommandOptions) {
    this.data = options.data;
    this.execute = options.execute;
  }
}

import {
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  PermissionResolvable,
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
  userPermissions?: PermissionResolvable;
  botPermissions?: PermissionResolvable;
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
  userPermissions: CommandOptions['userPermissions'];
  botPermissions: CommandOptions['botPermissions'];
  execute: CommandOptions['execute'];

  constructor(options: CommandOptions) {
    this.data = options.data;
    this.userPermissions = options.userPermissions;
    this.botPermissions = options.botPermissions;
    this.execute = options.execute;
  }
}

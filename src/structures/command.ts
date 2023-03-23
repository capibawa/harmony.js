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
  requiredPermissions?: PermissionResolvable;
  requiredBotPermissions?: PermissionResolvable;
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
  requiredPermissions: CommandOptions['requiredPermissions'];
  requiredBotPermissions: CommandOptions['requiredBotPermissions'];
  execute: CommandOptions['execute'];

  constructor(options: CommandOptions) {
    this.data = options.data;
    this.requiredPermissions = options.requiredPermissions;
    this.requiredBotPermissions = options.requiredBotPermissions;
    this.execute = options.execute;
  }
}

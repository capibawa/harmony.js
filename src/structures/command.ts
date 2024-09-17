import {
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  SlashCommandBuilder,
  UserContextMenuCommandInteraction,
  type PermissionResolvable,
  type SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

import type { RateLimiterOptions } from '@/types/rate-limiter-options.js';
import Client from '@/structures/client.js';

export interface CommandOptions {
  data:
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
    | SlashCommandSubcommandsOnlyBuilder
    | ContextMenuCommandBuilder;
  userPermissions?: PermissionResolvable;
  botPermissions?: PermissionResolvable;
  rateLimiter?: RateLimiterOptions;
  execute(
    interaction:
      | ChatInputCommandInteraction
      | ContextMenuCommandInteraction
      | MessageContextMenuCommandInteraction
      | UserContextMenuCommandInteraction,
    client: Client,
  ): Promise<void>;
}

export default class Command {
  data: CommandOptions['data'];
  userPermissions: CommandOptions['userPermissions'];
  botPermissions: CommandOptions['botPermissions'];
  rateLimiter: CommandOptions['rateLimiter'];
  execute: CommandOptions['execute'];

  constructor(options: CommandOptions) {
    this.data = options.data;
    this.userPermissions = options.userPermissions;
    this.botPermissions = options.botPermissions;
    this.rateLimiter = options.rateLimiter;
    this.execute = options.execute;
  }
}

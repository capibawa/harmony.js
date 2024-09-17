import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  type PermissionResolvable,
} from 'discord.js';

import type { RateLimiterOptions } from '@/types/rate-limiter-options.js';

export interface CommandOptions {
  data: SlashCommandBuilder;
  userPermissions?: PermissionResolvable;
  botPermissions?: PermissionResolvable;
  rateLimiter?: RateLimiterOptions;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
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

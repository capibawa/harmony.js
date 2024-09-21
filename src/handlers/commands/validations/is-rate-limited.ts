import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';

import Validation from '@/structures/validation.js';

export default new Validation({
  execute: async ({ client, command, interaction }) => {
    if (!command.rateLimiter) {
      return true;
    }

    const { rateLimiters } = client;

    if (!rateLimiters.has(command.data.name)) {
      rateLimiters.set(
        command.data.name,
        new RateLimiterMemory(command.rateLimiter),
      );
    }

    const rateLimiter = rateLimiters.get(command.data.name)!;

    try {
      await rateLimiter.consume(interaction.user.id);
    } catch (err) {
      const { msBeforeNext } = err as RateLimiterRes;

      const expirationTime = interaction.createdTimestamp + msBeforeNext;
      const expiredTimestamp = Math.round(expirationTime / 1000);

      await interaction.reply({
        content: `You are currently being rate limited. Try again <t:${expiredTimestamp}:R>.`,
        ephemeral: true,
      });

      return false;
    }

    return true;
  },
});

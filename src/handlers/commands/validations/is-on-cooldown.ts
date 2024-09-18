import { Collection } from 'discord.js';

import Validation from '@/structures/validation.js';

export default new Validation({
  execute: async ({ client, command, interaction }) => {
    if (!command.cooldown) {
      return true;
    }

    const { cooldowns } = client;

    // Initialize cooldown collection for the command if it doesn't exist
    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name)!;
    const cooldownDuration = command.cooldown * 1000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime =
        timestamps.get(interaction.user.id)! + cooldownDuration;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);

        await interaction.reply({
          content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
          ephemeral: true,
        });

        return false;
      }
    }

    // Set the cooldown timestamp for the user
    timestamps.set(interaction.user.id, now);

    // Remove the cooldown after the specified duration
    setTimeout(() => {
      timestamps.delete(interaction.user.id);
    }, cooldownDuration);

    return true;
  },
});

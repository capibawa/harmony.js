import type { Interaction } from 'discord.js';

import Client from '@/structures/client.js';
import Command from '@/structures/command.js';
import { createErrorEmbed } from '@/utils/embeds.js';
import { getFiles } from '@/utils/helpers.js';
import logger from '@/utils/logger.js';

export async function loadCommands(client: Client): Promise<void> {
  const commands: Command[] = await getFiles(client.harmony.commandsDir);

  if (commands.length === 0) {
    logger.info('No commands found.');
    return;
  }

  for (const command of commands) {
    if (!(command instanceof Command)) {
      logger.warn(
        `Command ${command} is not an instance of Command. Skipping.`,
      );

      continue;
    }

    if (!command.data) {
      logger.warn(
        `Command ${command} does not have a data property. Skipping.`,
      );

      continue;
    }

    const name = command.data.name.toLowerCase();

    if (client.commands.has(name)) {
      logger.warn(`Command ${name} already exists. Skipping.`);

      continue;
    }

    client.commands.set(name, command);
  }

  logger.info(
    'Loaded %d %s: [%s]',
    commands.length,
    commands.length === 1 ? 'command' : 'commands',
    commands.map((command) => command.data.name).join(', '),
  );
}

export async function deployCommands(client: Client): Promise<void> {
  if (!client.isReady()) {
    throw new Error('Client is not ready.');
  }

  try {
    await client.application.commands.set(
      client.commands.map((command) => command.data),
    );

    logger.info(
      'Deployed %d %s.',
      client.commands.size,
      client.commands.size === 1 ? 'command' : 'commands',
    );
  } catch (err) {
    logger.error(err);
  }
}

export async function executeCommand(
  client: Client,
  interaction: Interaction,
): Promise<void> {
  // TODO: Add support for different interaction types.
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const commandName = interaction.commandName.toLowerCase();
  const command = client.commands.get(commandName);

  if (!command) {
    logger.error(`No command matching ${commandName} was found.`);
    return;
  }

  let isValid = true;

  for (const validation of client.validations) {
    isValid = await validation.execute(command, interaction, client);

    if (!isValid) {
      break;
    }
  }

  if (!isValid) {
    const embed = createErrorEmbed('This command cannot be executed.');

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (interaction.deferred) {
      await interaction.editReply({ embeds: [embed] });
    }

    return;
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    logger.error(err);

    const embed = createErrorEmbed('Unknown error.');

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}

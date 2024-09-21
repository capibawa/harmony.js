import type { Interaction } from 'discord.js';

import Client from '@/structures/client.js';
import Command from '@/structures/command.js';
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

    if (command.disabled) {
      logger.warn(`Command ${command} is disabled. Skipping.`);
      continue;
    }

    if (!command.data || !command.execute) {
      logger.warn(
        `Command ${command} is missing a "data" or "execute" property. Skipping.`,
      );

      continue;
    }

    // if (client.commands.has(command.data.name)) {
    //   logger.warn(`Command ${command.data.name} already exists. Skipping.`);
    //   continue;
    // }

    client.commands.set(command.data.name, command);
  }

  logger.info(
    'Loaded %d %s: [%s]',
    client.commands.size,
    client.commands.size === 1 ? 'command' : 'commands',
    client.commands.map((command) => command.data.name).join(', '),
  );
}

export async function deployCommands(client: Client): Promise<void> {
  try {
    await client.application!.commands.set(
      client.commands.map((command) => command.data.toJSON()),
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

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    logger.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  let validated = true;

  for (const validation of client.validations) {
    validated = await validation.execute({ client, command, interaction });

    if (!validated) {
      break;
    }
  }

  if (!validated) {
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'You are not allowed to execute this command.',
        ephemeral: true,
      });
    } else if (interaction.deferred) {
      await interaction.editReply({
        content: 'You are not allowed to execute this command.',
      });
    }

    return;
  }

  try {
    await command.execute({ client, interaction });
  } catch (err) {
    logger.error(err);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  }
}

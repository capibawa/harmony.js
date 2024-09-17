import { join } from 'path';

import Client from '@/structures/client.js';
import Command from '@/structures/command.js';
import Validation from '@/structures/validation.js';
import { getFiles, getFilesFromPath } from '@/utils/helpers.js';
import logger from '@/utils/logger.js';

export async function loadCommands(client: Client): Promise<void> {
  const commands: Array<Command> = await getFiles(client.harmony.commandsDir);

  if (!commands.length) {
    logger.info('No commands found.');
    return;
  }

  for (const command of commands) {
    if (!(command instanceof Command)) {
      throw new Error(`Command ${command} is not an instance of Command.`);
    }

    if (!command.data) {
      throw new Error(`Command ${command} does not have a data property.`);
    }

    const name = command.data.name.toLowerCase();

    if (client.commands.has(name)) {
      throw new Error(`Command ${name} already exists.`);
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

export async function loadValidations(client: Client): Promise<void> {
  await loadDefaultValidations(client);

  const validations: Array<Validation> = await getFiles(
    client.harmony.validationsDir,
  );

  if (validations.length > 0) {
    for (const validation of validations) {
      if (!(validation instanceof Validation)) {
        throw new Error(
          `Validation ${validation} is not an instance of Validation.`,
        );
      }

      client.validations.push(validation);
    }

    logger.info(
      'Loaded %d %s.',
      client.validations.length,
      client.validations.length === 1 ? 'validation' : 'validations',
    );
  } else {
    logger.info('No validations found.');
  }
}

async function loadDefaultValidations(client: Client): Promise<void> {
  const validations: Array<Validation> = await getFilesFromPath(
    join(import.meta.dirname, 'validations'),
  );

  if (validations.length === 0) {
    logger.info('No internal validations found.');
    return;
  }

  let validationCount = 0;

  for (const validation of validations) {
    if (!(validation instanceof Validation)) {
      throw new Error(
        `Validation ${validation} is not an instance of Validation.`,
      );
    }

    client.validations.push(validation);

    validationCount++;
  }

  logger.info(
    'Loaded %d default %s.',
    validationCount,
    validationCount === 1 ? 'validation' : 'validations',
  );
}

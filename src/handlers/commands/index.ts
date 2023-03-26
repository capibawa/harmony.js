import { join } from 'path';

import Client from '../../structures/client';
import Command from '../../structures/command';
import Validation from '../../structures/validation';
import { getFiles, getFilesFromPath } from '../../utils/helpers';

let validationCount = 0;

export async function loadCommands(client: Client): Promise<void> {
  const commandsDir = client.moduleLoader.commandsDir;
  const commands: Array<Command> = await getFiles(commandsDir);

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

  console.log(
    `Loaded ${commands.length} ${
      commands.length === 1 ? `command` : `commands`
    }: ` + client.commands.map((command) => command.data.name).join(', ')
  );
}

export async function deployCommands(client: Client): Promise<void> {
  if (!client.isReady()) {
    throw new Error('Client is not ready.');
  }

  await client.application.commands.set(
    client.commands.map((command) => command.data)
  );

  console.log(`Deployed ${client.commands.size} commands.`);
}

export async function loadInternalValidations(client: Client): Promise<void> {
  const validationsDir = join(__dirname, 'validations');
  const validations: Array<Validation> = await getFilesFromPath(validationsDir);

  for (const validation of validations) {
    if (!(validation instanceof Validation)) {
      throw new Error(
        `Validation ${validation} is not an instance of Validation.`
      );
    }

    client.validations.push(validation);
  }

  validationCount = client.validations.length;
}

export async function loadValidations(client: Client): Promise<void> {
  const validationsDir = client.moduleLoader.validationsDir;
  const validations: Array<Validation> = await getFiles(validationsDir);

  for (const validation of validations) {
    if (!(validation instanceof Validation)) {
      throw new Error(
        `Validation ${validation} is not an instance of Validation.`
      );
    }

    client.validations.push(validation);
  }

  validationCount += client.validations.length;

  console.log(
    `Loaded ${validationCount} ${
      validationCount === 1 ? `validation` : `validations`
    }.`
  );
}

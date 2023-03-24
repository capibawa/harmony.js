import Client from '../structures/client';
import Command from '../structures/command';
import { getFiles } from '../utils/helpers';

export async function loadCommands(client: Client) {
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

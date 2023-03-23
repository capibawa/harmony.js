import Client from '../structures/client';
import Command from '../structures/command';
import { getFiles } from '../utils/helpers';

export async function loadCommands(client: Client) {
  let count = 0;

  const commands = (await getFiles(client.commandsDir)) as Array<Command>;

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

    count++;
  }

  console.log(
    `Loaded ${count} ${count > 1 ? `commands` : `command`}: ` +
      client.commands.map((command) => command.data.name).join(', ')
  );
}

# harmony.js

[![npm](https://img.shields.io/npm/v/@capibawa/harmony.js)](https://www.npmjs.com/package/@capibawa/harmony.js)

## About

harmony.js is a simplistic framework for building Discord bots using discord.js. It provides a simple and easy-to-use API for loading and building events, commands, and validations.

## Installation

```bash
npm install @capibawa/harmony.js
```

## Usage

### Client

harmony.js works by extending the `Client` class from discord.js. You can pass in a `harmony` object to the constructor to configure the directory paths for events, commands, and validations.

```ts
import { Client, GatewayIntentBits } from '@capibawa/harmony.js';

const client = new Client({
  harmony: {
    eventsDir: 'events',
    commandsDir: 'commands',
    validationsDir: 'validations',
  },
  intents: [GatewayIntentBits.Guilds],
});

client.initialize(token); // replaces client.login(token)
```

### Events

Events are loaded from the `events` directory by default. Each file should export a default `Event` object.

```ts
import { Event, Events } from '@capibawa/harmony.js';

export default new Event({
  name: Events.ClientReady,
  once: true,
  execute: ({ client }) => {
    if (!client.user) {
      return;
    }

    console.log(`Ready! Logged in as ${client.user.tag}.`);
  },
});
```

### Commands

Commands are loaded from the `commands` directory by default. Each file should export a default `Command` object.

harmony.js will automatically deploy your commands upon client initialization.

```ts
import { Command, SlashCommandBuilder } from '@capibawa/harmony.js';

export default new Command({
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Measures the bot latency.'),
  execute: async ({ interaction }) => {
    const message = await interaction.reply({
      content: 'Measuring ping...',
      fetchReply: true,
    });

    const ping = message.createdTimestamp - interaction.createdTimestamp;

    await interaction.editReply({ content: `Pong! Took ${ping} ms.` });
  },
});
```

### Validations

Validations are used to determine whether a command can be executed or not. All registered validations are executed in order until one of them returns `false`. If none of the validations return `false`, the command will be executed.

Validations are loaded from the `validations` directory by default. Each file should export a default `Validation` object.

```ts
import { Validation } from '@capibawa/harmony.js';

const WHITELISTED_COMMANDS = ['ping'];
const WHITELISTED_USER_IDS = [
  'EXAMPLE_USER_ID_1',
  'EXAMPLE_USER_ID_2',
  'EXAMPLE_USER_ID_3',
];

export default new Validation({
  execute: async ({ command, interaction }) => {
    const commandName = command.data.name;
    const userId = interaction.member?.user?.id;

    if (
      userId &&
      WHITELISTED_COMMANDS.includes(commandName) &&
      WHITELISTED_USER_IDS.includes(userId)
    ) {
      return true;
    }

    await interaction.reply({
      content: 'You are not allowed to execute this command.',
      ephemeral: true,
    });

    return false;
  },
});
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

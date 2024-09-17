# harmony.js

[![npm](https://img.shields.io/npm/v/@capibawa/harmony.js)](https://www.npmjs.com/package/@capibawa/harmony.js)

Dynamically load events, commands and validations for discord.js. Supports both JavaScript and TypeScript environments.

## Installation

```bash
npm install @capibawa/harmony.js
```

## Usage

### Client

harmony.js works by extending the `Client` class from discord.js. You can pass in a `harmony` object to the constructor to configure the directory paths for events, commands, and validations.

```ts
import { Client } from '@capibawa/harmony.js';

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

Events are loaded from the `events` directory by default. Each file should export a default `Event` object. Upon client initialization, the events will automatically be registered and executed.

```ts
import { Client, Events } from 'discord.js';
import { Event } from '@capibawa/harmony.js';

export default new Event({
  name: Events.ClientReady,
  once: true,
  execute: (client: Client) => {
    if (!client.user) {
      return;
    }

    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
});
```

### Commands

Commands are loaded from the `commands` directory by default. Each file should export a default `Command` object. Upon client initialization, the commands will automatically be registered, deployed and executed.

```ts
import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { Command } from '@capibawa/harmony.js';

export default new Command({
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setTitle('Pong!')
      .setDescription('Measuring ping...');

    const message = await interaction.reply({
      embeds: [embed],
      fetchReply: true,
    });

    const ping = message.createdTimestamp - interaction.createdTimestamp;

    await interaction.editReply({
      embeds: [embed.setDescription(`Took ${ping} ms.`)],
    });
  },
});
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

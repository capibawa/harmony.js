import { Client } from '@biscxit/discord-module-loader';
import { GatewayIntentBits } from 'discord.js';

import 'dotenv/config';

const isDev = process.argv.some((arg) => arg.includes('ts-node'));

const client = new Client({
  moduleLoader: {
    eventsDir: isDev ? 'src/events' : 'dist/events',
    commandsDir: isDev ? 'src/commands' : 'dist/commands',
    validationsDir: isDev ? 'src/validations' : 'dist/validations',
  },
  intents: [GatewayIntentBits.Guilds],
});

client.initialize(process.env.DISCORD_TOKEN as string).catch((err) => {
  console.error(err);
});

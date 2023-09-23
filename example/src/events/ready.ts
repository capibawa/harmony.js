import { Event } from '@biscxit/discord-module-loader';
import { Client, Events } from 'discord.js';

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

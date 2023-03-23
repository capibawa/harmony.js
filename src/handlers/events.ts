import { getFiles } from '../lib/helpers';
import Client from '../structures/client';
import Event from '../structures/event';

export async function loadEvents(client: Client) {
  let count = 0;

  const events = (await getFiles('events')) as Array<Event>;

  for (const event of events) {
    if (!(event instanceof Event)) {
      throw new Error(`Event ${event} is not an instance of Event.`);
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }

    count++;
  }

  console.log(
    `Loaded ${count} ${count > 1 ? `events` : `event`}: ` +
      events.map((event) => event.name).join(', ')
  );
}

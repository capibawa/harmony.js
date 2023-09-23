import Client from '@/structures/client';
import Event from '@/structures/event';
import { getFiles } from '@/utils/helpers';

export async function loadEvents(client: Client): Promise<void> {
  const eventsDir = client.moduleLoader.eventsDir;
  const events: Array<Event> = await getFiles(eventsDir);

  for (const event of events) {
    if (!(event instanceof Event)) {
      throw new Error(`Event ${event} is not an instance of Event.`);
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }

  console.log(
    `Loaded ${events.length} ${events.length === 1 ? `event` : `events`}: ` +
      events.map((event) => event.name).join(', '),
  );
}

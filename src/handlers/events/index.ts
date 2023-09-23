import Client from '@/structures/client';
import Event from '@/structures/event';
import { getFiles } from '@/utils/helpers';
import logger from '@/utils/logger';

export async function loadEvents(client: Client): Promise<void> {
  const events: Array<Event> = await getFiles(client.moduleLoader.eventsDir);

  if (!events.length) {
    logger.info('No events found.');
    return;
  }

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

  logger.info(
    'Loaded %d %s: [%s]',
    events.length,
    events.length === 1 ? 'event' : 'events',
    events.map((event) => event.name).join(', '),
  );
}

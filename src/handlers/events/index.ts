import Client from '@/structures/client.js';
import Event from '@/structures/event.js';
import { getFiles } from '@/utils/helpers.js';
import logger from '@/utils/logger.js';

export async function loadEvents(client: Client): Promise<void> {
  const events: Event[] = await getFiles(client.harmony.eventsDir);

  if (events.length === 0) {
    logger.info('No events found.');
    return;
  }

  for (const event of events) {
    if (!(event instanceof Event)) {
      logger.warn(`Event ${event} is not an instance of Event. Skipping.`);
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute({ client, args }));
    } else {
      client.on(event.name, (...args) => event.execute({ client, args }));
    }
  }

  logger.info(
    'Loaded %d %s: [%s]',
    events.length,
    events.length === 1 ? 'event' : 'events',
    events.map((event) => event.name).join(', '),
  );
}

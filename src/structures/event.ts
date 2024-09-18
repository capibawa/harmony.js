import type { ClientEvents } from 'discord.js';

import Client from '@/structures/client.js';

export interface EventArgs<T extends keyof ClientEvents = keyof ClientEvents> {
  client: Client;
  args: ClientEvents[T];
}

export default class Event<T extends keyof ClientEvents = keyof ClientEvents> {
  /**
   * The name of the event.
   * It corresponds to one of the event names defined in the ClientEvents interface.
   */
  name: T;

  /**
   * Indicates whether the event should be executed only once.
   * If set to true, the event will be automatically removed after its first execution.
   */
  once?: boolean;

  /**
   * The function that gets executed whenever the event is emitted.
   * It receives the client instance and any additional arguments passed by the event.
   */
  execute: (args: EventArgs<T>) => void | Promise<void>;

  /**
   * Creates a new instance of the Event class.
   */
  constructor(options: Event<T>) {
    this.name = options.name;
    this.once = options.once ?? false;
    this.execute = options.execute;
  }
}

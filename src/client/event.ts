import { ClientEvents } from 'discord.js';
import { ExtendedClient } from './client';

export class Event<Key extends keyof ClientEvents> {
	constructor(
		public name: Key,
		public run: (...args: ClientEvents[Key]) => any,
	) {}
}

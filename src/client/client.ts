import {
	ApplicationCommandDataResolvable,
	Client,
	ClientEvents,
	Collection,
} from 'discord.js';

import { CommandType } from '../types/command';
import { Event } from './event';
import { RegisterCommandsOptions } from '../types/client';
import { config } from '../config';
import glob from 'glob';
import { promisify } from 'util';

const globPromose = promisify(glob);
export class ExtendedClient extends Client {
	public commands: Collection<String, CommandType> = new Collection();

	constructor() {
		super({ intents: 32767 });
	}

	start() {
		this.registerModules();
		this.login(config.BOT_TOKEN);
	}

	async importFile(filePath: string) {
		return (await import(filePath))?.default;
	}

	async registerCommands({ guildId, commands }: RegisterCommandsOptions) {
		if (guildId) {
			this.guilds.cache.get(guildId)?.commands.set(commands);
			console.log(`Registering commands to guild id: ${guildId}`);
		} else {
			this.application?.commands.set(commands);
			console.log('Registering global commands');
		}
	}

	async registerModules() {
		//commands
		const slashCommands: ApplicationCommandDataResolvable[] = [];
		const commandFiles = await globPromose(
			`${__dirname}/../commands/*/*{.ts,.js}`,
		);
		console.log({ commandFiles });

		commandFiles.forEach(async (filePath) => {
			const command: CommandType = await this.importFile(filePath);
			if (!command.name) return;

			this.commands.set(command.name, command);
			slashCommands.push(command);
		});

		//events
		const eventFiles = await globPromose(
			`${__dirname}/../events/*{.ts,.js}`,
		);
		console.log({ eventFiles });

		eventFiles.forEach(async (filePath) => {
			const event: Event<keyof ClientEvents> = await this.importFile(
				filePath,
			);
			this.on(event.event, event.run);
		});
	}
}

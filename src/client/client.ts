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
		super({
			intents: [
				'GUILDS',
				'GUILD_MESSAGES',
				'GUILD_BANS',
				'GUILD_MESSAGE_REACTIONS',
				'GUILD_MEMBERS',
				'GUILD_PRESENCES',
				'DIRECT_MESSAGES',
				'GUILD_INTEGRATIONS',
			],
		});
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

		commandFiles.forEach(async (filePath) => {
			const command: CommandType = await this.importFile(filePath);
			if (!command.name) return;

			this.commands.set(command.name, command);
			slashCommands.push(command);
		});

		this.on('ready', () => {
			this.guilds.cache.forEach((guild) => {
				this.registerCommands({
					commands: slashCommands,
					guildId: guild.id,
				});
			});
		});

		this.on('guildCreate', (guild) => {
			this.registerCommands({
				commands: slashCommands,
				guildId: guild.id,
			});
		});

		//events
		const eventFiles = await globPromose(
			`${__dirname}/../events/*{.ts,.js}`,
		);

		eventFiles.forEach(async (filePath) => {
			const event: Event<keyof ClientEvents> = await this.importFile(
				filePath,
			);
			this.on(event.name, event.run);
		});
	}
}

import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CommandInteractionOptionResolver,
	PermissionResolvable,
} from 'discord.js';

import { ExtendedClient } from '../client/Client';

interface RunOptions {
	client: ExtendedClient;
	interaction: CommandInteraction;
	args: CommandInteractionOptionResolver;
}
type RunFunction = (options: RunOptions) => any;

export type CommandType = {
	name: string;
	description: string;
	usage: string;
	userPermisssions?: PermissionResolvable[];
	run: RunOptions;
} & ChatInputApplicationCommandData;

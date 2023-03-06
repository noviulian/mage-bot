import {
	ApplicationCommandOptionType,
	ChatInputApplicationCommandData,
	CommandInteraction,
	CommandInteractionOptionResolver,
	GuildMember,
	PermissionResolvable,
} from 'discord.js';

import { ExtendedClient } from '../client/client';

export interface ExtendedInteraction extends CommandInteraction {
	member: GuildMember;
}

export const CommandOptionType = ApplicationCommandOptionType;

interface RunOptions {
	client: ExtendedClient;
	interaction: ExtendedInteraction;
	args: CommandInteractionOptionResolver;
}

type RunFunction = (options: RunOptions) => any;

export type CommandType = {
	userPermissions?: PermissionResolvable[];
	run: RunFunction;
} & ChatInputApplicationCommandData;

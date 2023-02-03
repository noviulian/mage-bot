import {
	ApplicationCommandOptionType,
	ChatInputApplicationCommandData,
	CommandInteraction,
	CommandInteractionOptionResolver,
	GuildMember,
	PermissionResolvable,
} from 'discord.js';

import { ExtendedClient } from '../client/client';

/**
 * {
 *  name: "commandname",
 * description: "any description",
 * run: async({ interaction }) => {
 *
 * }
 * }
 */
export interface ExtendedInteraction extends CommandInteraction {
	member: GuildMember;
}

export type CommandOptionType = ApplicationCommandOptionType;

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

import { Command } from '../../client/command';
import { CommandOptionType } from '../../types/command';
import { prisma } from '../../lib/prisma';
import { User } from 'discord.js';

export default new Command({
	name: 'clear',
	description: 'Clears current user message record',
	options: [
		{
			name: 'user',
			type: CommandOptionType.User,
			description: 'Choose an user',
			required: true,
		},
	],
	defaultMemberPermissions: ['BanMembers'],
	run: async ({ interaction }) => {
		const user = interaction.options.getUser('user') as User;

		// get user from db
		const dbUser = await prisma.discordMember.findUnique({
			where: {
				discordId: user.id,
			},
		});

		if (dbUser) {
			// clear message in db
			await prisma.discordMember.update({
				where: {
					discordId: user.id,
				},
				data: {
					lastMessage: '',
				},
			});
			await interaction.followUp(
				`Cleared message history for ${user.tag} *(${user.id})*`,
			);
		} else {
			await interaction.followUp(
				`No record found for this user (${user.tag}, *${user.id}*)`,
			);
		}
	},
});

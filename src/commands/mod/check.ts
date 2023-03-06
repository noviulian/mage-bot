import { Command } from '../../client/command';
import { CommandOptionType } from '../../types/command';
import { User } from 'discord.js';
import { prisma } from '../../lib/prisma';

export default new Command({
	name: 'check',
	description:
		'Displays how many times the bot deleted messages from this user',
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
			await interaction.followUp(
				`I deleted messages from ${user.tag} **${dbUser.deletedMessagesCount}** times`,
			);
		} else {
			await interaction.followUp(
				`User ${user.tag} has no deleted messages`,
			);
		}
	},
});

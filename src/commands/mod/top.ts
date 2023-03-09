import { Command } from '../../client/command';
import { config } from '../../config';
import { prisma } from '../../lib/prisma';
export default new Command({
	name: 'top',
	description: 'Displays people with most deleted messages and the amounts',
	defaultMemberPermissions: ['BanMembers'],
	options: [],
	run: async ({ interaction }) => {
		// get top 10 delete counts from prisma
		const results = await prisma.discordMember.findMany({
			orderBy: {
				deletedMessagesCount: 'desc',
			},
			take: 10,
		});

		if (results) {
			let message = `:rotating_light: **Top Spammers** :rotating_light:\n`;
			for (let i = 0; i < results.length; i++) {
				const user = results[i];
				message += `${i + 1}. **${user.username}** *(${
					user.discordId
				})* - ${user.deletedMessagesCount}\n`;
			}
			await interaction.followUp(message);
		} else {
			await interaction.followUp(`Couldn't generate list :(`);
		}
	},
});

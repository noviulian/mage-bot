import { CommandOptionType } from '../../types/command';
import { Command } from '../../client/command';
import { DiscordMember } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { User } from 'discord.js';
export default new Command({
	name: 'whitelist',
	description: 'Add a user to whitelist',
	defaultMemberPermissions: ['BanMembers'],
	options: [
		{
			name: 'action',
			type: CommandOptionType.Number,
			description: 'Choose an user',
			required: true,
			choices: [
				{
					name: 'add',
					value: 1,
				},
				{
					name: 'remove',
					value: 2,
				},
			],
		},
		{
			name: 'user',
			type: CommandOptionType.User,
			description: 'Choose an user',
			required: true,
		},
	],
	run: async ({ interaction }) => {
		const action = interaction.options.get('action')?.value as number;
		const user = interaction.options.getUser('user') as User;

		const message = {
			noRecord: `No record found for this user (${user.tag}, *${user.id}*)`,
			added: `Added ${user.tag} *(${user.id})* to whitelist by ${interaction.user.tag}`,
			removed: `Removed ${user.tag} *(${user.id})* from whitelist by ${interaction.user.tag}`,
		};

		const dbUser = await prisma.discordMember.findUnique({
			where: {
				discordId: user.id,
			},
		});

		const date = new Date();
		const utcDate = date.toUTCString();
		if (!dbUser) {
			await interaction.followUp(message.noRecord);
			return;
		}
		if (action === 1) {
			await prisma.discordMember.update({
				where: {
					discordId: user.id,
				},
				data: {
					whitelisted: true,
				},
			});
			console.log(utcDate, message.added);
			await interaction.followUp(message.added);
			return;
		}
		if (action === 2) {
			await prisma.discordMember.update({
				where: {
					discordId: user.id,
				},
				data: {
					whitelisted: false,
				},
			});
			console.log(utcDate, message.removed);
			await interaction.followUp(message.removed);
			return;
		}
	},
});

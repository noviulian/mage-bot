import { Event } from '../client/event';
import { ChannelType, Role } from 'discord.js';
import { client } from '../client';
import { prisma } from '../lib/prisma';
import { Logger } from '../lib/logger';

export default new Event('messageCreate', async (message) => {
	if (message.author.bot || message.author.id === client.user.id) return;
	if (message.channel.type === ChannelType.DM) return;
	if (!message.guild || !message.content) return;
	const logger = new Logger(client, message, message.content);
	const currentMessage = message.content.toLowerCase();
	const user = await prisma.discordMember.findUnique({
		where: {
			discordId: message.author.id,
		},
	});

	const whitelistedWords = [
		'gm',
		'gm!',
		'gm!!!',
		'gm!!!!',
		'gn',
		'gn!',
		'!rank',
		'!levels',
		'no',
		'yes',
		'yeah',
		'nah',
		'haha',
		'nope',
	];

	//if the user doesn't exist, create them in the database and return
	if (!user) {
		await prisma.discordMember.create({
			data: {
				username: message.author.username,
				discordId: message.author.id,
				lastMessage: message.content,
				deletedMessagesCount: 0,
				tag: `${message.author.username}#${message.author.discriminator}`,
				joinedServer: message.guild.joinedAt,
			},
		});
		return;
	}

	const hasMoralisRole = message.member.roles.cache.some(
		(r: Role) => r.name === 'Moralis Team',
	);
	const wordWhitelisted = whitelistedWords.some(
		(word: string) => word === currentMessage.toLowerCase(), // maybe its GM YES NO
	);

	const canDouble = hasMoralisRole || wordWhitelisted || user.whitelisted;
	if (user.lastMessage === currentMessage && !canDouble) {
		//update the user's deleted messages count
		await prisma.discordMember.update({
			where: {
				discordId: message.author.id,
			},
			data: {
				deletedMessagesCount: {
					increment: 1,
				},
			},
		});
		logger.doubleMessage();
		logger.success().catch((e) => logger.error(e));
	}

	await prisma.discordMember.update({
		where: {
			discordId: message.author.id,
		},
		data: {
			lastMessage: currentMessage,
		},
	});
});

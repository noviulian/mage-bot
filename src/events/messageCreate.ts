import { Event } from '../client/event';
import { DiscordMember } from '@prisma/client';
import { ChannelType, TextChannel, Role } from 'discord.js';
import { client } from '../client';
import { config } from '../config';
import { prisma } from '../lib/prisma';

export default new Event('messageCreate', async (message) => {
	if (message.author.bot || message.author.id === client.user.id) return;
	if (message.channel.type === ChannelType.DM) return;
	if (!message.guild || !message.content) return;

	const currentMessage = message.content.toLowerCase();

	const replies = {
		failMessage: `${message.author.tag}: ${currentMessage} - FAILED TO DELETE in <#${message.channel.id}>`,
		successMessage: `${message.author.tag}: ${currentMessage} - DELETED in <#${message.channel.id}>`,
		warnMessage: `${message.author.tag} please don't send the same message twice`,
	};

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

	//if the user's last message is the same as the current message, send a warning and delete the message
	async function sendLog(message: string) {
		const logChannel = client.channels.cache.get(
			config.LOG_CHANNEL_ID,
		) as TextChannel;
		await logChannel.send(message).catch(async (e) => {
			await logChannel.send(e.message);
		});
	}

	const whitelistedUsers = await prisma.discordMember.findMany({
		where: {
			whitelisted: true,
		},
	});

	const hasMoralisRole = message.member.roles.cache.some(
		(r: Role) => r.name === 'Moralis Team',
	);
	const wordWhitelisted = whitelistedWords.some(
		(word: string) => word === currentMessage.toLowerCase(), // maybe its GM YES NO
	);
	const userWhitelisted = whitelistedUsers.some(
		(user: DiscordMember) => user.discordId === message.author.id,
	);
	const canType = hasMoralisRole || wordWhitelisted || userWhitelisted;
	if (user.lastMessage === currentMessage && !canType) {
		await message.reply(replies.warnMessage).then((botMessage) => {
			async function deleteMessages() {
				await botMessage.delete().catch(() => console.error());
				await message
					.delete()
					.catch(async (e) => sendLog(replies.failMessage));

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
			}
			setTimeout(deleteMessages, 3000);
		});
		await sendLog(replies.successMessage).catch((e) =>
			sendLog(replies.failMessage),
		);
	}

	//update the user's last message
	await prisma.discordMember
		.update({
			where: {
				discordId: message.author.id,
			},
			data: {
				lastMessage: currentMessage,
			},
		})
		.catch((e) => console.log('could not update user', e));
});

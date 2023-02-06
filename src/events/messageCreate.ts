import { Event } from '../client/event';
import { PrismaClient } from '@prisma/client';
import { ChannelType } from 'discord.js';
const prisma = new PrismaClient();

export default new Event('messageCreate', async (message) => {
	if (message.author.bot) return;
	if (message.channel.type === ChannelType.DM) return;
	if (!message.guild) return;
	if (!message.content) return;

	const user = await prisma.user.findUnique({
		where: {
			userId: message.author.id,
		},
	});

	//if the user doesn't exist, create them
	if (!user) {
		await prisma.user.create({
			data: {
				username: message.author.username,
				userId: message.author.id,
				lastMessage: message.content,
				accountCreated: message.author.createdAt,
				joinedServer: message.guild.joinedAt,
				createdAt: new Date(),
			},
		});
		return;
	}

	//if the user's last message is the same as the current message, send a warning and delete the message
	if (user.lastMessage === message.content) {
		message.channel.send({
			content: `Hey ${message.author}, please don't spam the same message!`,
		});
		message.delete();
	}

	//update the user's last message
	const updatedUser = await prisma.user.update({
		where: {
			userId: message.author.id,
		},
		data: {
			lastMessage: message.content,
		},
	});
});

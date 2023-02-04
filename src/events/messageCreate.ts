import { Event } from '../client/event';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default new Event('messageCreate', async (message) => {
	const users = await prisma.user.findMany();

	//create a user if they don't exist
	if (!users.find((user) => user.userId === message.author.id)) {
		const user = await prisma.user.create({
			data: {
				username: message.author.username,
				userId: message.author.id,
				lastMessage: message.content,
				joinedAt: message.guild.joinedAt,
			},
		});
		console.log(user);
	}

	//update the user's last message
	await prisma.user.update({
		where: {
			userId: message.author.id,
		},
		data: {
			lastMessage: message.content,
		},
	});
});

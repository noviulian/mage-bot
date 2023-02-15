import { ExtendedClient } from 'client/client';
import 'colors';
import { Event } from '../client/event';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default new Event('ready', async (client: ExtendedClient) => {
	console.log(
		`${client.user.username}#${client.user.discriminator} is online and ready`
			.green.bold,
	);

	await prisma.$connect().then(() => {
		console.log('Connected to database'.green.bold);
	});
});

import { ExtendedClient } from 'client/client';
import 'colors';
import { Event } from '../client/event';

export default new Event('ready', async (client: ExtendedClient) => {
	console.log(
		`${client.user.username}#${client.user.discriminator} is online and ready`
			.green.bold,
	);
});

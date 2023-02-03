import { ExtendedClient } from 'client/client';
import 'colors';

import { Event } from '../client/event';

export default new Event('ready', (client: ExtendedClient) => {
	console.log(
		`${client.user.username}#${client.user.discriminator} is online and ready`
			.green.bold,
	);
	client.guilds.cache.forEach((guild) => {
		console.log(`Guild: ${guild.name}`.yellow.bold);
	});
});

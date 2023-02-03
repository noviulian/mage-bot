import { Event } from '../client/event';

export default new Event('messageCreate', async (message) => {
	console.log(message);
});

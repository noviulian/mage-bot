import { Command } from '../../client/command';

export default new Command({
	name: 'ping',
	description: 'Pong!',
	defaultMemberPermissions: ['BanMembers'],
	run: async ({ interaction }) => {
		interaction.followUp('Pong!');
	},
});

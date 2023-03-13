import { Command } from '../../client/command';

export default new Command({
	name: 'macros',
	description: 'get a list of macros',
	defaultMemberPermissions: ['BanMembers'],
	run: async ({ interaction }) => {
		interaction.followUp('macros');
	},
});

import { CommandInteractionOptionResolver } from 'discord.js';
import { Event } from '../client/event';
import { ExtendedInteraction } from '../types/command';
import { client } from '../client';

export default new Event('interactionCreate', async (interaction) => {
	if (interaction.isCommand()) {
		await interaction.deferReply();
		const command = client.commands.get(interaction.commandName);
		if (!command)
			return interaction.followUp('You have used a non existent command');

		command.run({
			args: interaction.options as CommandInteractionOptionResolver,
			client,
			interaction: interaction as ExtendedInteraction,
		});
	}
});

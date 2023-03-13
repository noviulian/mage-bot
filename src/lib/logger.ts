import { ExtendedClient } from 'client/client';
import { TextChannel, Message, ReactionUserManager } from 'discord.js';
import { config } from '../config';
export class Logger {
	message: Message;
	client: ExtendedClient;
	logChannel: TextChannel;
	currentMessage: string;
	constructor(
		client: ExtendedClient,
		message: Message,
		currentMessage: string,
	) {
		this.client = client;
		this.logChannel = this.client.channels.cache.get(
			config.LOG_CHANNEL_ID,
		) as TextChannel;
		this.message = message;
		this.currentMessage = currentMessage;
	}

	getDate(): string {
		const date = new Date();
		return date.toUTCString();
	}

	tableLog(logMessage: string): void {
		const data = {
			discordId: this.message.author.id,
			username: this.message.author.tag,
			message: this.currentMessage.slice(0, 40),
			channelId: this.message.channel.id,
			sentAt: this.getDate(),
		};
		console.log(logMessage);
		console.table(data);
	}

	async success(): Promise<void> {
		this.tableLog('Deleted message: ');
		await this.logChannel.send(
			`${this.message.author.tag}: ${this.currentMessage.slice(
				0,
				40,
			)} - DELETED in <#${this.message.channel.id}>`,
		);
	}

	async error(error: Error): Promise<void> {
		this.tableLog('Failed to delete message: ');
		await this.logChannel.send(
			`${this.message.author.tag}: ${this.currentMessage.slice(
				0,
				40,
			)} - FAILED TO DELETE in <#${this.message.channel.id}>`,
		);
		console.error('Error: ', error);
	}

	async doubleMessage(): Promise<void> {
		const botMessage = await this.message.reply(
			`${this.message.author.tag} please don't send the same message twice`,
		);
		setTimeout(async () => {
			try {
				await botMessage.delete();
				await this.message.delete();
			} catch (error) {
				this.error(error);
			}
		}, 3000);
	}

	async sendLog(message: string): Promise<void> {
		this.tableLog('Log message: ');
		await this.logChannel.send(message);
	}
}

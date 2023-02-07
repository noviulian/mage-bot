import { DotenvParseOutput, config as env } from 'dotenv';

interface ProcessEnv extends DotenvParseOutput {
	//discord
	BOT_TOKEN: string;
	CLIENT_ID: string;
	GUILD_ID: string;
	LOG_CHANNEL_ID: string;
}

export const config = env().parsed as ProcessEnv;

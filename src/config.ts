import { DotenvParseOutput, config as env } from 'dotenv';

interface ProcessEnv extends DotenvParseOutput {
	//discord
	BOT_TOKEN: string;
	CLIENT_ID: string;
	GUILD_ID: string;

	//moralis
	MORALIS_API_KEY: string;
	MORALIS_SERVER_URL: string;
	MORALIS_SERVER_APP_ID: string;
}

export const config = env().parsed as ProcessEnv;

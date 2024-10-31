declare namespace NodeJS {
    interface ProcessEnv {
        DATABASE_URL: string;

        SLACK_BOT_TOKEN: string;
        SLACK_SIGNING_SECRET: string;

        HARVEST_ACCOUNT_ID: string;
        HARVEST_CLIENT_ID: string;
        HARVEST_CLIENT_SECRET: string;

        [key: string]: string | undefined;
    }
}
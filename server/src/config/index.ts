import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: parseInt(process.env.PORT ?? '3001', 10),
    rpcUrl: process.env.RPC_URL ?? 'http://localhost:26657',
    wsUrl: process.env.WS_URL ?? 'ws://localhost:26657/websocket',
    restUrl: process.env.REST_URL ?? 'http://localhost:1317',
    databaseUrl: process.env.DATABASE_URL ?? 'file:./dev.db',
    syncRichlistIntervalMs: parseInt(process.env.SYNC_RICHLIST_INTERVAL_MS ?? String(24 * 60 * 60 * 1000), 10),
};

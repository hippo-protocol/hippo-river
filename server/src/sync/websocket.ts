import WebSocket from 'ws';
import { config } from '../config/index.js';
import { indexBlock } from './indexerUtils.js';

let ws: WebSocket | null = null;
let isReconnecting = false;

function connect() {
    if (ws || isReconnecting) return;

    console.log(`[sync:ws] Connecting to ${config.wsUrl}...`);
    ws = new WebSocket(config.wsUrl);

    ws.on('open', () => {
        console.log('[sync:ws] Connected.');
        isReconnecting = false;

        // Subscribe to NewBlock events
        ws?.send(
            JSON.stringify({
                jsonrpc: '2.0',
                method: 'subscribe',
                id: 1,
                params: {
                    query: "tm.event='NewBlock'",
                },
            })
        );
    });

    ws.on('message', async (data: string) => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.result?.data?.value?.block?.header?.height) {
                const height = parseInt(parsed.result.data.value.block.header.height, 10);
                // Process the block immediately
                await indexBlock(height);
            }
        } catch (e) {
            console.error('[sync:ws] Error parsing message:', e);
        }
    });

    ws.on('close', () => {
        console.log('[sync:ws] Disconnected. Reconnecting in 5s...');
        ws = null;
        isReconnecting = true;
        setTimeout(() => {
            isReconnecting = false;
            connect();
        }, 5000);
    });

    ws.on('error', (err) => {
        console.error('[sync:ws] Error:', err.message);
        ws?.close();
    });
}

export function startWebsocket() {
    connect();
}

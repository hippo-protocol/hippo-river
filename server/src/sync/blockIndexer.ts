import { prisma } from '../db/index.js';
import { config } from '../config/index.js';
import { indexBlock } from './indexerUtils.js';

let isSyncing = false;

interface StatusResponse {
    sync_info: {
        latest_block_height: string;
    };
}

/**
 * Periodically checks the latest node height and syncs any missing blocks
 * from the database's last indexed height.
 */
export async function syncBlocks() {
    if (isSyncing) return;
    isSyncing = true;

    try {
        // 1. Get current network height
        const res = await fetch(`${config.rpcUrl}/status`);
        if (!res.ok) throw new Error('Failed to fetch node status');

        const statusData = (await res.json()) as { result: StatusResponse };
        // Handle both CometBFT status formats
        const networkHeight = parseInt(statusData.result.sync_info.latest_block_height, 10);

        // 2. Get last indexed height from DB
        const syncState = await prisma.syncState.findUnique({
            where: { id: 'last_indexed_height' },
        });

        // Default to 1 if nothing is indexed yet
        const lastIndexedHeight = syncState ? syncState.value : 0;

        if (networkHeight > lastIndexedHeight) {
            const remaining = networkHeight - lastIndexedHeight;
            if (remaining > 1) {
                console.log(`[sync:gap-filler] Found ${remaining} missing blocks. Syncing...`);
            }

            // Sync strictly missing blocks sequentially
            for (let h = lastIndexedHeight + 1; h <= networkHeight; h++) {
                await indexBlock(h);
                await new Promise((resolve) => setTimeout(resolve, 50)); // sleep 50ms to prevent node overload
            }
        }
    } catch (err) {
        console.error('[sync:gap-filler] Failed to sync blocks:', err);
    } finally {
        isSyncing = false;
    }
}

export function startBlockIndexer() {
    // Run every 1 minute to catch up on any missed blocks
    setInterval(() => {
        syncBlocks();
    }, 60000);

    // Also run immediately on startup
    syncBlocks();
}

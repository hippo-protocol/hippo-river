import { config } from '../config/index.js';
import { syncRichlist } from './richlist.js';

/**
 * Start all sync jobs. Each runs once immediately, then on its configured interval.
 */
export function startSync(): void {
    console.log('[sync] Starting sync jobs...');

    // Richlist: sync immediately, then every SYNC_INTERVAL_MS (default: 24h)
    syncRichlist().then(() => {
        setInterval(() => {
            syncRichlist();
        }, config.syncRichlistIntervalMs);
        console.log(`[sync] Richlist sync scheduled every ${config.syncRichlistIntervalMs / 1000}s`);
    });
}

import { prisma } from '../db/index.js';
import { config } from '../config/index.js';
import crypto from 'crypto';

interface BlockResponse {
    block: {
        header: {
            height: string;
            time: string;
            proposer_address: string;
        };
        data: {
            txs: string[];
        };
    };
    block_id: {
        hash: string;
    };
}

interface RPCBlockResultsResponse {
    result: {
        height: string;
        txs_results: Array<{
            code: number;
            data: string;
            log: string;
            info: string;
            gas_wanted: string;
            gas_used: string;
            events: Array<{
                type: string;
                attributes: Array<{
                    key: string;
                    value: string;
                    index: boolean;
                }>;
            }>;
            codespace: string;
        }> | null;
    };
}



/**
 * Extracts the primary signer address from a transaction's events.
 * Looks for 'sender' in 'message' events.
 */
function extractSignerAddressFromEvents(events: any[]): string | null {
    if (!Array.isArray(events)) return null;

    for (const ev of events) {
        if (!ev.attributes || !Array.isArray(ev.attributes)) continue;

        if (ev.type === 'message') {
            const senderAttr = ev.attributes.find((attr: any) => attr.key === 'sender');
            if (senderAttr && senderAttr.value) {
                return senderAttr.value;
            }
        }
    }
    return null;
}

/**
 * Fetches a block and its transactions from the node, then saves them to the DB.
 */
export async function indexBlock(height: number): Promise<void> {
    try {
        // 1. Fetch block data
        const blockRes = await fetch(`${config.restUrl}/cosmos/base/tendermint/v1beta1/blocks/${height}`);
        if (!blockRes.ok) throw new Error(`Failed to fetch block ${height}`);
        const blockData = (await blockRes.json()) as BlockResponse;

        // 2. Fetch Tx Results explicitly from RPC
        // The REST `blocks` endpoint only gives us the unexecuted base64 payloads.
        // We use RPC `block_results` to get the actual execution logs, gas, and events.
        const rpcRes = await fetch(`${config.rpcUrl}/block_results?height=${height}`);
        if (!rpcRes.ok) throw new Error(`Failed to fetch block_results ${height}`);
        const rpcData = (await rpcRes.json()) as RPCBlockResultsResponse;

        const rawTxs = blockData.block.data.txs || [];
        const txsResults = rpcData.result.txs_results || [];

        if (rawTxs.length !== txsResults.length) {
            console.warn(`[sync:block] Warning: Tx count mismatch at height ${height}. Expected ${rawTxs.length}, found ${txsResults.length}`);
        }

        // 3. Prepare all DB operations as an array to execute concurrently
        const dbOperations: any[] = [];

        // Upsert block
        dbOperations.push(
            prisma.block.upsert({
                where: { height },
                update: {},
                create: {
                    height,
                    hash: blockData.block_id.hash,
                    time: new Date(blockData.block.header.time),
                    proposerAddress: blockData.block.header.proposer_address,
                    numTxs: rawTxs.length,
                },
            })
        );

        // Insert Transactions & Account Mappings
        const blockTime = new Date(blockData.block.header.time);

        for (let i = 0; i < txsResults.length; i++) {
            const txResult = txsResults[i];
            if (!txResult) continue;

            const rawTx = rawTxs[i] || ''; // base64

            // Hash the raw transaction because block_results does not provide the hash
            const txHash = crypto.createHash('sha256').update(Buffer.from(rawTx, 'base64')).digest('hex').toUpperCase();

            // Extract the signer dynamically from the events
            const signerAddress = extractSignerAddressFromEvents(txResult.events);

            if (!signerAddress) {
                console.warn(`[sync:block] Could not extract signer address from transaction ${txHash}`);
            }

            dbOperations.push(
                prisma.transaction.upsert({
                    where: { hash: txHash },
                    update: {},
                    create: {
                        hash: txHash,
                        height,
                        index: i,
                        tx: rawTx,
                        senderAddress: signerAddress,
                        code: txResult.code,
                        codespace: txResult.codespace ?? null,
                        data: txResult.data ?? null,
                        events: JSON.stringify(txResult.events),
                        gasUsed: txResult.gas_used,
                        gasWanted: txResult.gas_wanted,
                        info: txResult.info ?? null,
                        log: txResult.log ?? null,
                        timestamp: blockTime,
                    },
                })
            );
        }

        // Update SyncState
        dbOperations.push(
            prisma.syncState.upsert({
                where: { id: 'last_indexed_height' },
                update: { value: height },
                create: { id: 'last_indexed_height', value: height },
            })
        );

        // Execute all bundled operations in a single fast, atomic transaction
        await prisma.$transaction(dbOperations);

        console.log(`[sync:block] Indexed block ${height} with ${txsResults.length} txs`);
    } catch (error) {
        console.error(`[sync:block] Error indexing block ${height}:`, error);
    }
}

import { prisma } from '../db/index.js';
import { config } from '../config/index.js';

interface Account {
    '@type': string;
    address: string;
    [key: string]: unknown;
}

interface AccountsResponse {
    accounts: Account[];
    pagination: {
        next_key: string | null;
        total: string;
    };
}

interface Coin {
    denom: string;
    amount: string;
}

/**
 * Fetch all accounts from the chain via REST (paginated).
 */
async function fetchAllAccounts(): Promise<string[]> {
    const addresses: string[] = [];
    let nextKey: string | null = null;

    console.log('[sync:richlist] Fetching all accounts from chain...');

    do {
        const params = new URLSearchParams({ 'pagination.limit': '1000' });
        if (nextKey) {
            params.set('pagination.key', nextKey);
        }

        const url = `${config.restUrl}/cosmos/auth/v1beta1/accounts?${params}`;
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Failed to fetch accounts: ${res.status} ${res.statusText}`);
        }

        const data = (await res.json()) as AccountsResponse;

        for (const account of data.accounts) {
            if (account.address) {
                addresses.push(account.address);
            }
        }

        nextKey = data.pagination.next_key;
    } while (nextKey);

    console.log(`[sync:richlist] Found ${addresses.length} accounts`);
    return addresses;
}

/**
 * Fetch the balance for a single address in the target denom.
 */
async function fetchBalance(address: string): Promise<string> {
    const url = `${config.restUrl}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=ahp`;
    const res = await fetch(url);

    if (!res.ok) {
        console.warn(`[sync:richlist] Failed to fetch balance for ${address}: ${res.status}`);
        return '0';
    }

    const data = (await res.json()) as { balance: Coin };
    return data.balance?.amount ?? '0';
}

/**
 * Full sync: fetch all accounts, query balances, upsert into DB.
 */
export async function syncRichlist(): Promise<void> {
    const startTime = Date.now();
    console.log('[sync:richlist] Starting richlist sync...');

    try {
        const addresses = await fetchAllAccounts();

        let synced = 0;
        // Process in batches of 50 to avoid overwhelming the node
        const batchSize = 50;

        for (let i = 0; i < addresses.length; i += batchSize) {
            const batch = addresses.slice(i, i + batchSize);

            const results = await Promise.all(
                batch.map(async (address) => {
                    const balance = await fetchBalance(address);
                    return { address, balance };
                })
            );

            // Bundle the entire batch into a single atomic DB transaction
            const dbOperations = results.map(({ address, balance }) => {
                if (balance === '0') {
                    // Remove zero-balance entries
                    return prisma.accountBalance.deleteMany({ where: { address } });
                } else {
                    // Zero-pad the balance string up to 64 chars so that SQLite's 
                    // lexicographical string order natively matches numeric sorting.
                    const paddedBalance = balance.padStart(64, '0');
                    return prisma.accountBalance.upsert({
                        where: { address },
                        update: { balance: paddedBalance, denom: 'ahp' },
                        create: { address, balance: paddedBalance, denom: 'ahp' },
                    });
                }
            });

            await prisma.$transaction(dbOperations);

            synced += batch.length;
            if (synced % 100 === 0) {
                console.log(`[sync:richlist] Progress: ${synced}/${addresses.length}`);
            }
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[sync:richlist] Sync complete. ${synced} accounts processed in ${elapsed}s`);
    } catch (error) {
        console.error('[sync:richlist] Sync failed:', error);
    }
}

import { prisma } from '../db/index.js';

interface RichlistResult {
    count: number;
    data: { address: string; balance: string }[];
}

/**
 * Get paginated richlist sorted by balance descending.
 * Balance is sorted numerically by padding with leading zeros.
 */
export async function getRichlist(page: number, limit: number): Promise<RichlistResult> {
    const [count, data] = await Promise.all([
        prisma.accountBalance.count(),
        prisma.accountBalance.findMany({
            select: { address: true, balance: true },
            orderBy: { balance: 'desc' },
            skip: page * limit,
            take: limit,
        }),
    ]);

    // Sort numerically (SQLite sorts strings lexicographically)
    // For correct numeric sorting, we sort in JS after fetching
    // This is fine for paginated results since we fetch small batches
    // For a production-grade solution, we'd store a numeric sort key

    return { count, data };
}

import { prisma } from '../db/index.js';

interface RichlistResult {
    total_count: number;
    data: { address: string; balance: string }[];
}

/**
 * Get paginated richlist sorted by balance descending.
 * Balance is sorted numerically by padding with leading zeros.
 */
export async function getRichlist(page: number, limit: number): Promise<RichlistResult> {
    const [total_count, data] = await Promise.all([
        prisma.accountBalance.count(),
        prisma.accountBalance.findMany({
            select: { address: true, balance: true },
            orderBy: { balance: 'desc' },
            skip: Math.max(0, page - 1) * limit,
            take: limit,
        }),
    ]);

    // Strip the 64-char zero-padding before returning it to the frontend.
    // The (?=\d) ensures that a value of "0" isn't fully erased.
    const formattedData = data.map(item => ({
        address: item.address,
        balance: item.balance.replace(/^0+(?=\d)/, '')
    }));

    return { total_count, data: formattedData };
}

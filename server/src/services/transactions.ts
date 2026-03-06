import { prisma } from '../db/index.js';
import type { Transaction } from '@prisma/client';

interface TransactionsResult {
    total_count: number;
    txs: Transaction[];
}

export async function getTransactions(page: number, limit: number): Promise<TransactionsResult> {
    const [total_count, txs] = await Promise.all([
        prisma.transaction.count(),
        prisma.transaction.findMany({
            orderBy: { height: 'desc' },
            skip: Math.max(0, page - 1) * limit,
            take: limit,
        }),
    ]);

    return { total_count, txs };
}

export async function getTransactionByHash(hash: string) {
    return prisma.transaction.findUnique({
        where: { hash },
    });
}

export async function getAccountTransactions(address: string, page: number, limit: number): Promise<TransactionsResult> {
    const [total_count, txs] = await Promise.all([
        prisma.transaction.count({
            where: { senderAddress: address },
        }),
        prisma.transaction.findMany({
            where: { senderAddress: address },
            orderBy: { height: 'desc' },
            skip: Math.max(0, page - 1) * limit,
            take: limit,
        }),
    ]);

    return { total_count, txs };
}

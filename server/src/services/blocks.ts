import { prisma } from '../db/index.js';
import type { Block } from '@prisma/client';


interface BlocksResult {
    total_count: number;
    blocks: Block[];
}

export async function getBlocks(page: number, limit: number): Promise<BlocksResult> {
    const [total_count, blocks] = await Promise.all([
        prisma.block.count(),
        prisma.block.findMany({
            orderBy: { height: 'desc' },
            skip: Math.max(0, page - 1) * limit,
            take: limit,
        }),
    ]);

    return { total_count, blocks };
}

export async function getBlockByHeight(height: number) {
    return prisma.block.findUnique({
        where: { height },
        include: {
            txs: {
                select: {
                    hash: true,
                    code: true,
                    timestamp: true,
                },
            },
        },
    });
}

import { Router } from 'express';
import type { Request, Response } from 'express';
import { getBlocks, getBlockByHeight } from '../services/blocks.js';

interface PaginationQuery {
    limit?: string;
    page?: string;
}

type BlocksResponse = Awaited<ReturnType<typeof getBlocks>>;
type SingleBlockResponse = NonNullable<Awaited<ReturnType<typeof getBlockByHeight>>>;

interface ErrorResponse {
    error: string;
}

const router = Router();

/**
 * GET /api/blocks?page=1&limit=20
 */
router.get(
    '/blocks',
    async (
        req: Request<unknown, BlocksResponse | ErrorResponse, unknown, PaginationQuery>,
        res: Response<BlocksResponse | ErrorResponse>
    ) => {
        try {
            const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
            const page = Math.max(parseInt(req.query.page as string) || 1, 1);

            const result = await getBlocks(page, limit);
            res.json(result);
        } catch (error) {
            console.error('[routes:blocks] Error:', error);
            res.status(500).json({ error: 'Failed to fetch blocks' });
        }
    });

/**
 * GET /api/blocks/:height
 */
router.get(
    '/blocks/:height',
    async (
        req: Request<{ height: string }, SingleBlockResponse | ErrorResponse, unknown, unknown>,
        res: Response<SingleBlockResponse | ErrorResponse>
    ) => {
        try {
            const height = parseInt(String(req.params.height), 10);
            if (isNaN(height)) {
                return res.status(400).json({ error: 'Invalid height' });
            }

            const block = await getBlockByHeight(height);
            if (!block) {
                return res.status(404).json({ error: 'Block not found' });
            }

            res.json(block);
        } catch (error) {
            console.error(`[routes:blocks] Error fetching block ${req.params.height}:`, error);
            res.status(500).json({ error: 'Failed to fetch block' });
        }
    });

export default router;

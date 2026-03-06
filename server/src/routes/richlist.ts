import { Router } from 'express';
import type { Request, Response } from 'express';
import { getRichlist } from '../services/richlist.js';

interface PaginationQuery {
    limit?: string;
    page?: string;
}

type RichlistResponse = Awaited<ReturnType<typeof getRichlist>>;

interface ErrorResponse {
    error: string;
}

const router = Router();

/**
 * GET /api/richlist?limit=20&page=1
 *
 * Returns paginated richlist sorted by balance descending.
 * Response: { count: number, data: [{ address, balance }] }
 */
router.get(
    '/richlist',
    async (
        req: Request<unknown, RichlistResponse | ErrorResponse, unknown, PaginationQuery>,
        res: Response<RichlistResponse | ErrorResponse>
    ) => {
        try {
            const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
            const page = Math.max(parseInt(req.query.page as string) || 1, 1);

            const result = await getRichlist(page, limit);
            res.json(result);
        } catch (error) {
            console.error('[routes:richlist] Error:', error);
            res.status(500).json({ error: 'Failed to fetch richlist' });
        }
    });

export default router;

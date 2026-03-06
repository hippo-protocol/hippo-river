import { Router } from 'express';
import type { Request, Response } from 'express';
import { getTransactions, getTransactionByHash, getAccountTransactions } from '../services/transactions.js';

interface PaginationQuery {
    limit?: string;
    page?: string;
}

type TxsResponse = Awaited<ReturnType<typeof getTransactions>>;
type SingleTxResponse = NonNullable<Awaited<ReturnType<typeof getTransactionByHash>>>;
type AccountTxsResponse = Awaited<ReturnType<typeof getAccountTransactions>>;

interface ErrorResponse {
    error: string;
}

const router = Router();

/**
 * GET /api/txs?page=1&limit=20
 */
router.get(
    '/txs',
    async (
        req: Request<unknown, TxsResponse | ErrorResponse, unknown, PaginationQuery>,
        res: Response<TxsResponse | ErrorResponse>
    ) => {
        try {
            const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
            const page = Math.max(parseInt(req.query.page as string) || 1, 1);

            const result = await getTransactions(page, limit);
            res.json(result);
        } catch (error) {
            console.error('[routes:txs] Error:', error);
            res.status(500).json({ error: 'Failed to fetch txs' });
        }
    });

/**
 * GET /api/txs/:hash
 */
router.get(
    '/txs/:hash',
    async (
        req: Request<{ hash: string }, SingleTxResponse | ErrorResponse, unknown, unknown>,
        res: Response<SingleTxResponse | ErrorResponse>
    ) => {
        try {
            const tx = await getTransactionByHash(String(req.params.hash));
            if (!tx) {
                return res.status(404).json({ error: 'Transaction not found' });
            }

            res.json(tx);
        } catch (error) {
            console.error(`[routes:txs] Error fetching tx ${req.params.hash}:`, error);
            res.status(500).json({ error: 'Failed to fetch transaction' });
        }
    });

/**
 * GET /api/accounts/:address/txs?page=1&limit=20
 */
router.get(
    '/accounts/:address/txs',
    async (
        req: Request<{ address: string }, AccountTxsResponse | ErrorResponse, unknown, PaginationQuery>,
        res: Response<AccountTxsResponse | ErrorResponse>
    ) => {
        try {
            const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
            const page = Math.max(parseInt(req.query.page as string) || 1, 1);
            const address = req.params.address;

            const result = await getAccountTransactions(String(address), page, limit);
            res.json(result);
        } catch (error) {
            console.error(`[routes:txs] Error fetching portfolio for ${req.params.address}:`, error);
            res.status(500).json({ error: 'Failed to fetch account transactions' });
        }
    });

export default router;

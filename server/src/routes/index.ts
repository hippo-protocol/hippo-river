import { Router } from 'express';
import richlistRouter from './richlist.js';
import blocksRouter from './blocks.js';
import txsRouter from './transactions.js';

const router = Router();

// Mount feature routers
router.use(richlistRouter);
router.use(blocksRouter);
router.use(txsRouter);

export default router;

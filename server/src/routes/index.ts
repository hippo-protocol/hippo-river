import { Router } from 'express';
import richlistRouter from './richlist.js';

const router = Router();

// Mount feature routers
router.use(richlistRouter);

export default router;

import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { prisma } from './db/index.js';
import apiRoutes from './routes/index.js';
import { startSync } from './sync/index.js';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// API routes
app.use('/api', apiRoutes);

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await prisma.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\nShutting down...');
    await prisma.$disconnect();
    process.exit(0);
});

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
    // Start sync jobs after server is ready
    startSync();
});

export { prisma };

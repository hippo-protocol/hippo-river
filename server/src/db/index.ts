import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { config } from '../config/index.js';

const adapter = new PrismaLibSql({
    url: config.databaseUrl,
});

export const prisma = new PrismaClient({ adapter });

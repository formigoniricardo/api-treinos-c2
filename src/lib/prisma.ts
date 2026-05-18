import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// No Prisma 7, o próprio adaptador gerencia a conexão do better-sqlite3.
// Nós só precisamos passar a URL do banco em um objeto.
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db"
});

const prisma = new PrismaClient({ adapter });

export default prisma;
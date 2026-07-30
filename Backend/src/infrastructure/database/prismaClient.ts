// Con tsx watch, el hot-reload puede crear múltiples instancias de PrismaClient y 
// agotar las conexiones. Solucionamos esto con un patrón singleton:

import { env } from "../../config/env.js";
import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient
}

function createPrismaClient() {
    const url = new URL(env.DATABASE_URL);

    const adapter = new PrismaMariaDb({
        host: url.hostname,
        port: (+url.port || 3306),
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.replace(/^\//, ""),
        connectionLimit: 5,
  });

  return new PrismaClient({adapter})
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if(process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Con tsx watch, el hot-reload puede crear múltiples instancias de PrismaClient y 
// agotar las conexiones. Solucionamos esto con un patrón singleton:

import { PrismaClient } from "@prisma/client/extension"

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if(process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

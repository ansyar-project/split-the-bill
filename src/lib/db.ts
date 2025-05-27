import { PrismaClient } from "@prisma/client";

interface GlobalThis {
  prisma?: PrismaClient;
}


const prisma = (globalThis as GlobalThis).prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") (globalThis as GlobalThis).prisma = prisma;

export default prisma;
import { PrismaClient } from "@square-cube/database";

// Single Prisma instance for the entire API process
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
});

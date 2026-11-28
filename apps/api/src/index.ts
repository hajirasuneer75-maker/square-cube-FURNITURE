import "./lib/env.js"; // Load root .env before any config reads process.env
import "./types.js";   // JWT type augmentation
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";

import productsRoute from "./routes/products.js";
import categoriesRoute from "./routes/categories.js";
import customOrdersRoute from "./routes/custom-orders.js";
import adminAuthRoute from "./routes/admin/auth.js";
import adminProductsRoute from "./routes/admin/products.js";
import adminEnquiriesRoute from "./routes/admin/enquiries.js";
import maintenanceRoute from "./routes/maintenance.js";
import estimatorRatesRoute from "./routes/estimator-rates.js";
import siteSettingsRoute from "./routes/site-settings.js";
import adminMaintenanceRoute from "./routes/admin/maintenance.js";
import uploadRoute from "./routes/upload.js";
import { prisma } from "./lib/prisma.js";

const isDev = process.env.NODE_ENV !== "production";

const server = Fastify({
  logger: isDev
    ? { transport: { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:HH:MM:ss" } } }
    : true,
});

// ── Plugins ───────────────────────────────────────────────────────────────────

await server.register(cors, {
  origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

await server.register(jwt, {
  secret: process.env.JWT_SECRET ?? "dev-secret-squarecube-change-in-production",
  cookie: { cookieName: "sc_admin_token", signed: false },
  sign: { expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" },
});

await server.register(cookie, {
  secret: process.env.COOKIE_SECRET ?? "dev-cookie-secret",
});

await server.register(multipart, {
  limits: { fileSize: 10 * 1024 * 1024, files: 6 },
});

// ── Routes ────────────────────────────────────────────────────────────────────

await server.register(productsRoute, { prefix: "/api/products" });
await server.register(categoriesRoute, { prefix: "/api/categories" });
await server.register(customOrdersRoute, { prefix: "/api/custom-orders" });
await server.register(adminAuthRoute, { prefix: "/api/admin/auth" });
await server.register(adminProductsRoute, { prefix: "/api/admin/products" });
await server.register(adminEnquiriesRoute, { prefix: "/api/admin/enquiries" });
await server.register(maintenanceRoute, { prefix: "/api/maintenance" });
await server.register(estimatorRatesRoute, { prefix: "/api/estimator-rates" });
await server.register(siteSettingsRoute, { prefix: "/api/site-settings" });
await server.register(adminMaintenanceRoute, { prefix: "/api/admin/maintenance" });
await server.register(uploadRoute, { prefix: "/api/upload" });

// ── Health check ──────────────────────────────────────────────────────────────

server.get("/health", async () => ({
  status: "ok",
  brand: "Square Cube Furniture",
  timestamp: new Date().toISOString(),
  env: process.env.NODE_ENV,
}));

// ── Graceful shutdown ─────────────────────────────────────────────────────────

const shutdown = async (signal: string) => {
  server.log.info(`[api] Received ${signal}. Shutting down…`);
  await server.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// ── Start ─────────────────────────────────────────────────────────────────────

try {
  const port = parseInt(process.env.PORT ?? "4000", 10);
  const host = process.env.HOST ?? "0.0.0.0";
  await server.listen({ port, host });
} catch (err) {
  server.log.error(err);
  process.exit(1);
}

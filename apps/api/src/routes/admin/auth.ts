import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../middlewares/auth.js";

const COOKIE_NAME = "sc_admin_token";
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

export default async function adminAuthRoute(fastify: FastifyInstance) {

  // ── POST /api/admin/auth/login ─────────────────────────────────────────────
  fastify.post<{ Body: { email: string; password: string } }>(
    "/login",
    async (request, reply) => {
      const { email, password } = request.body ?? {};

      const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
      const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH;

      if (!ADMIN_EMAIL || !ADMIN_HASH) {
        fastify.log.error("[admin/auth] ADMIN_EMAIL or ADMIN_PASSWORD_HASH env var not set.");
        return reply.status(500).send({ success: false, error: "Server not configured." });
      }

      if (!email || !password) {
        return reply.status(400).send({ success: false, error: "Email and password are required." });
      }

      const emailMatch = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const passwordMatch = bcrypt.compareSync(password, ADMIN_HASH);

      if (!emailMatch || !passwordMatch) {
        // Constant-time response to prevent timing attacks
        return reply.status(401).send({ success: false, error: "Invalid credentials." });
      }

      // Sign a JWT
      const token = fastify.jwt.sign({ sub: email, role: "admin" });

      // Persist a hashed version of the token for forced-logout / revocation
      try {
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await prisma.adminSession.create({ data: { tokenHash, adminEmail: email, expiresAt } });
      } catch (err) {
        fastify.log.warn("[admin/auth] Could not persist session:", err as any);
      }

      reply.setCookie(COOKIE_NAME, token, COOKIE_OPTS);

      return { success: true, message: "Logged in successfully." };
    }
  );

  // ── POST /api/admin/auth/logout ────────────────────────────────────────────
  fastify.post("/logout", { preHandler: [requireAdmin] }, async (request, reply) => {
    const token = request.cookies[COOKIE_NAME];
    if (token) {
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      await prisma.adminSession.updateMany({
        where: { tokenHash },
        data: { revokedAt: new Date() },
      });
    }
    reply.clearCookie(COOKIE_NAME, { path: "/" });
    return { success: true, message: "Logged out." };
  });

  // ── GET /api/admin/auth/me ─────────────────────────────────────────────────
  fastify.get("/me", { preHandler: [requireAdmin] }, async (request) => {
    return {
      success: true,
      data: { email: request.user.sub, role: request.user.role },
    };
  });
}

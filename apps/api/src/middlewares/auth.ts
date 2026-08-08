import type { FastifyRequest, FastifyReply } from "fastify";

// Prehandler — attach to any route that requires an admin JWT
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // @fastify/jwt verifies the token from the Authorization header ("Bearer …")
    // OR from the "sc_admin_token" cookie (configured in index.ts)
    await request.jwtVerify();
  } catch {
    reply.status(401).send({ success: false, error: "Unauthorized. Please log in." });
  }
}

// Guard that also checks the role claim
export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  await authenticate(request, reply);
  if (reply.sent) return; // authenticate already replied with 401
  if (request.user.role !== "admin") {
    reply.status(403).send({ success: false, error: "Forbidden." });
  }
}

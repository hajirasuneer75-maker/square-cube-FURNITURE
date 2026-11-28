import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middlewares/auth.js";

export default async function estimatorRatesRoute(fastify: FastifyInstance) {
  // GET /api/estimator-rates — public, list active rates
  fastify.get("/", async () => {
    const rates = await prisma.estimatorRate.findMany({
      where: { isActive: true },
      orderBy: { material: "asc" },
    });
    return { success: true, data: rates };
  });

  // GET /api/estimator-rates/all — admin, list all rates
  fastify.get("/all", { preHandler: [requireAdmin] }, async () => {
    const rates = await prisma.estimatorRate.findMany({ orderBy: { material: "asc" } });
    return { success: true, data: rates };
  });

  // POST /api/estimator-rates (admin)
  fastify.post("/", { preHandler: [requireAdmin] }, async (request, reply) => {
    const b = request.body as any;
    if (!b.material || b.ratePerSqFt === undefined) {
      return reply.status(400).send({ success: false, error: "material and ratePerSqFt are required." });
    }
    const rate = await prisma.estimatorRate.upsert({
      where: { material: String(b.material).trim() },
      update: {
        ratePerSqFt: Number(b.ratePerSqFt),
        description: b.description ?? null,
        isActive: b.isActive ?? true,
      },
      create: {
        material: String(b.material).trim(),
        ratePerSqFt: Number(b.ratePerSqFt),
        description: b.description ?? null,
        isActive: b.isActive ?? true,
      },
    });
    return reply.status(201).send({ success: true, data: rate });
  });

  // PUT /api/estimator-rates/:id (admin)
  fastify.put<{ Params: { id: string } }>("/:id", { preHandler: [requireAdmin] }, async (request) => {
    const b = request.body as any;
    const rate = await prisma.estimatorRate.update({
      where: { id: request.params.id },
      data: {
        ...(b.material !== undefined ? { material: String(b.material).trim() } : {}),
        ...(b.ratePerSqFt !== undefined ? { ratePerSqFt: Number(b.ratePerSqFt) } : {}),
        ...(b.description !== undefined ? { description: b.description } : {}),
        ...(b.isActive !== undefined ? { isActive: b.isActive } : {}),
      },
    });
    return { success: true, data: rate };
  });

  // DELETE /api/estimator-rates/:id (admin)
  fastify.delete<{ Params: { id: string } }>("/:id", { preHandler: [requireAdmin] }, async (request, reply) => {
    await prisma.estimatorRate.delete({ where: { id: request.params.id } });
    return reply.status(204).send();
  });
}

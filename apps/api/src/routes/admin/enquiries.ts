import type { FastifyInstance } from "fastify";
import { prisma }       from "../../lib/prisma.js";
import { requireAdmin } from "../../middlewares/auth.js";

export default async function adminEnquiriesRoute(fastify: FastifyInstance) {

  // ── GET /api/admin/enquiries ───────────────────────────────────────────────
  fastify.get("/", { preHandler: [requireAdmin] }, async (request) => {
    const q    = request.query as Record<string, string>;
    const page = Math.max(1, parseInt(q.page ?? "1", 10));
    const size = parseInt(q.pageSize ?? "20", 10);

    const where: any = {};
    if (q.status) where.status = q.status.toUpperCase();
    if (q.search) where.OR = [
      { name:         { contains: q.search, mode: "insensitive" } },
      { phone:        { contains: q.search                       } },
      { furnitureType:{ contains: q.search, mode: "insensitive" } },
    ];

    const [orders, total] = await prisma.$transaction([
      prisma.customOrder.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip:    (page - 1) * size,
        take:    size,
      }),
      prisma.customOrder.count({ where }),
    ]);

    return {
      success: true,
      data:    orders,
      meta:    { total, page, pageSize: size, totalPages: Math.ceil(total / size) },
    };
  });

  // ── GET /api/admin/enquiries/stats ────────────────────────────────────────
  fastify.get("/stats", { preHandler: [requireAdmin] }, async () => {
    const [total, pending, inProgress, quoted, completed] = await prisma.$transaction([
      prisma.customOrder.count(),
      prisma.customOrder.count({ where: { status: "PENDING"     } }),
      prisma.customOrder.count({ where: { status: "IN_PROGRESS" } }),
      prisma.customOrder.count({ where: { status: "QUOTED"      } }),
      prisma.customOrder.count({ where: { status: "COMPLETED"   } }),
    ]);
    return { success: true, data: { total, pending, inProgress, quoted, completed } };
  });

  // ── GET /api/admin/enquiries/:id ──────────────────────────────────────────
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [requireAdmin] },
    async (request, reply) => {
      const order = await prisma.customOrder.findUnique({ where: { id: request.params.id } });
      if (!order) return reply.status(404).send({ success: false, error: "Enquiry not found." });
      return { success: true, data: order };
    }
  );

  // ── PATCH /api/admin/enquiries/:id ────────────────────────────────────────
  fastify.patch<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [requireAdmin] },
    async (request) => {
      const { status, adminNotes, quotedPrice, aiGeneratedQuote } = request.body as any;
      const order = await prisma.customOrder.update({
        where: { id: request.params.id },
        data: {
          ...(status           !== undefined ? { status }           : {}),
          ...(adminNotes       !== undefined ? { adminNotes }       : {}),
          ...(quotedPrice      !== undefined ? { quotedPrice }      : {}),
          ...(aiGeneratedQuote !== undefined ? { aiGeneratedQuote } : {}),
        },
      });
      return { success: true, data: order };
    }
  );

  // ── DELETE /api/admin/enquiries/:id ───────────────────────────────────────
  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [requireAdmin] },
    async (request, reply) => {
      await prisma.customOrder.delete({ where: { id: request.params.id } });
      return reply.status(204).send();
    }
  );
}

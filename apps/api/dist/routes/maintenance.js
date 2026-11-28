import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middlewares/auth.js";
const VALID_SERVICES = new Set([
    "WOOD_POLISH",
    "PU_REFINISH",
    "REUPHOLSTERY",
    "FOAM_REPLACEMENT",
    "HINGE_REPAIR",
    "TERMITE_TREATMENT",
    "DISMANTLING_SHIFTING",
    "GENERAL_REPAIR",
]);
export default async function maintenanceRoute(fastify) {
    // POST /api/maintenance — public, creates a ticket
    fastify.post("/", async (request, reply) => {
        const b = request.body;
        if (!b?.name || !b?.phone || !b?.serviceType || !b?.furnitureItem || !b?.issueDescription) {
            return reply.status(400).send({ success: false, error: "Missing required fields." });
        }
        const serviceType = VALID_SERVICES.has(b.serviceType) ? b.serviceType : "GENERAL_REPAIR";
        const ticket = await prisma.maintenanceTicket.create({
            data: {
                name: String(b.name),
                phone: String(b.phone),
                email: b.email ? String(b.email) : null,
                city: b.city ? String(b.city) : null,
                serviceType,
                furnitureItem: String(b.furnitureItem),
                issueDescription: String(b.issueDescription),
                damagePhotos: Array.isArray(b.damagePhotos) ? b.damagePhotos : [],
                preferredDate: b.preferredDate ? String(b.preferredDate) : null,
            },
        });
        return reply.status(201).send({ success: true, data: ticket });
    });
    // GET /api/maintenance (admin) — list all
    fastify.get("/", { preHandler: [requireAdmin] }, async (request) => {
        const q = request.query;
        const page = Math.max(1, parseInt(q.page ?? "1", 10));
        const size = parseInt(q.pageSize ?? "50", 10);
        const where = {};
        if (q.status)
            where.status = q.status;
        const [tickets, total] = await prisma.$transaction([
            prisma.maintenanceTicket.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * size,
                take: size,
            }),
            prisma.maintenanceTicket.count({ where }),
        ]);
        return { success: true, data: tickets, meta: { total, page, pageSize: size } };
    });
    // GET /api/maintenance/:id (admin)
    fastify.get("/:id", { preHandler: [requireAdmin] }, async (request, reply) => {
        const ticket = await prisma.maintenanceTicket.findUnique({ where: { id: request.params.id } });
        if (!ticket)
            return reply.status(404).send({ success: false, error: "Not found." });
        return { success: true, data: ticket };
    });
    // PATCH /api/maintenance/:id (admin) — update status/notes
    fastify.patch("/:id", { preHandler: [requireAdmin] }, async (request) => {
        const { status, adminNotes, quotedPrice } = request.body;
        const ticket = await prisma.maintenanceTicket.update({
            where: { id: request.params.id },
            data: {
                ...(status !== undefined ? { status } : {}),
                ...(adminNotes !== undefined ? { adminNotes } : {}),
                ...(quotedPrice !== undefined ? { quotedPrice: quotedPrice === null ? null : Number(quotedPrice) } : {}),
            },
        });
        return { success: true, data: ticket };
    });
    // DELETE /api/maintenance/:id (admin)
    fastify.delete("/:id", { preHandler: [requireAdmin] }, async (request, reply) => {
        await prisma.maintenanceTicket.delete({ where: { id: request.params.id } });
        return reply.status(204).send();
    });
}
//# sourceMappingURL=maintenance.js.map
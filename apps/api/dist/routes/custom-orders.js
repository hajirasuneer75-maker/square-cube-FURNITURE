import { prisma } from "../lib/prisma.js";
import { uploadBuffer } from "../lib/cloudinary.js";
import { requireAdmin } from "../middlewares/auth.js";
export default async function customOrdersRoute(fastify) {
    // ── POST /api/custom-orders ────────────────────────────────────────────────
    // Accepts multipart/form-data — text fields + optional image/PDF attachments
    fastify.post("/", async (request, reply) => {
        const parts = request.parts();
        const fields = {};
        const uploadedUrls = [];
        for await (const part of parts) {
            if (part.type === "file") {
                const file = part;
                const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
                if (!allowed.includes(file.mimetype))
                    continue;
                const buffer = await file.toBuffer();
                try {
                    const url = await uploadBuffer(buffer, file.filename, "enquiries");
                    uploadedUrls.push(url);
                }
                catch (err) {
                    fastify.log.warn(`[custom-orders] Cloudinary upload failed for ${file.filename}: ${err}`);
                }
            }
            else {
                fields[part.fieldname] = part.value;
            }
        }
        const { name, phone, email, city, furnitureType, woodType, budgetRange, length, width, height, description } = fields;
        if (!name || !phone || !furnitureType || !description) {
            return reply.status(400).send({
                success: false,
                error: "Missing required fields: name, phone, furnitureType, description.",
            });
        }
        const order = await prisma.customOrder.create({
            data: {
                name, phone, email, city, furnitureType, woodType, budgetRange,
                length, width, height, description,
                referenceImages: uploadedUrls,
            },
        });
        return reply.status(201).send({
            success: true,
            enquiryId: `ENQ-${order.id.slice(-8).toUpperCase()}`,
            message: "Your request has been received. We'll contact you within 2–3 hours.",
            data: order,
        });
    });
    // ── GET /api/custom-orders (admin) ─────────────────────────────────────────
    fastify.get("/", { preHandler: [requireAdmin] }, async (request) => {
        const q = request.query;
        const page = Math.max(1, parseInt(q.page ?? "1", 10));
        const size = parseInt(q.pageSize ?? "20", 10);
        const where = {};
        if (q.status)
            where.status = q.status.toUpperCase();
        const [orders, total] = await prisma.$transaction([
            prisma.customOrder.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * size,
                take: size,
            }),
            prisma.customOrder.count({ where }),
        ]);
        return { success: true, data: orders, meta: { total, page, pageSize: size } };
    });
    // ── GET /api/custom-orders/:id (admin) ────────────────────────────────────
    fastify.get("/:id", { preHandler: [requireAdmin] }, async (request, reply) => {
        const order = await prisma.customOrder.findUnique({ where: { id: request.params.id } });
        if (!order)
            return reply.status(404).send({ success: false, error: "Order not found." });
        return { success: true, data: order };
    });
    // ── PATCH /api/custom-orders/:id/status (admin) ───────────────────────────
    fastify.patch("/:id/status", { preHandler: [requireAdmin] }, async (request, reply) => {
        const { status, adminNotes, quotedPrice } = request.body;
        const order = await prisma.customOrder.update({
            where: { id: request.params.id },
            data: { status, adminNotes, quotedPrice },
        });
        return { success: true, data: order };
    });
}
//# sourceMappingURL=custom-orders.js.map
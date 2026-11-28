import type { FastifyInstance } from "fastify";
import type { MultipartFile } from "@fastify/multipart";
import { prisma } from "../lib/prisma.js";
import { uploadBuffer, isCloudinaryConfigured } from "../lib/cloudinary.js";
import { requireAdmin } from "../middlewares/auth.js";

export default async function customOrdersRoute(fastify: FastifyInstance) {
  // ── POST /api/custom-orders ────────────────────────────────────────────────
  // Accepts either multipart/form-data OR application/json
  fastify.post("/", async (request, reply) => {
    let fields: Record<string, any> = {};
    const uploadedUrls: string[] = [];

    if (request.isMultipart()) {
      const parts = request.parts();
      for await (const part of parts) {
        if (part.type === "file") {
          const file = part as MultipartFile;
          const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
          if (!allowed.includes(file.mimetype)) continue;

          if (isCloudinaryConfigured()) {
            const buffer = await file.toBuffer();
            try {
              const url = await uploadBuffer(buffer, `${Date.now()}-${file.filename}`, "enquiries");
              uploadedUrls.push(url);
            } catch (err) {
              fastify.log.warn(`[custom-orders] Cloudinary upload failed for ${file.filename}: ${err}`);
            }
          }
        } else {
          fields[part.fieldname] = (part as any).value as string;
        }
      }
    } else {
      fields = (request.body as Record<string, any>) ?? {};
      if (Array.isArray(fields.referenceImages)) {
        uploadedUrls.push(...fields.referenceImages.filter((u: unknown) => typeof u === "string" && u.length > 0));
      }
    }

    const {
      name,
      phone,
      email,
      city,
      furnitureType,
      woodType,
      budgetRange,
      length,
      width,
      height,
      description,
    } = fields;

    if (!name || !phone || !furnitureType || !description) {
      return reply.status(400).send({
        success: false,
        error: "Missing required fields: name, phone, furnitureType, description.",
      });
    }

    const order = await prisma.customOrder.create({
      data: {
        name: String(name),
        phone: String(phone),
        email: email ? String(email) : null,
        city: city ? String(city) : null,
        furnitureType: String(furnitureType),
        woodType: woodType ? String(woodType) : null,
        budgetRange: budgetRange ? String(budgetRange) : "Custom Studio Estimate",
        length: length ? String(length) : null,
        width: width ? String(width) : null,
        height: height ? String(height) : null,
        description: String(description),
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
    const q = request.query as Record<string, string>;
    const page = Math.max(1, parseInt(q.page ?? "1", 10));
    const size = parseInt(q.pageSize ?? "20", 10);

    const where: any = {};
    if (q.status) where.status = q.status.toUpperCase();

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
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [requireAdmin] },
    async (request, reply) => {
      const order = await prisma.customOrder.findUnique({ where: { id: request.params.id } });
      if (!order) return reply.status(404).send({ success: false, error: "Order not found." });
      return { success: true, data: order };
    }
  );

  // ── PATCH /api/custom-orders/:id/status (admin) ───────────────────────────
  fastify.patch<{ Params: { id: string } }>(
    "/:id/status",
    { preHandler: [requireAdmin] },
    async (request) => {
      const { status, adminNotes, quotedPrice } = request.body as any;
      const order = await prisma.customOrder.update({
        where: { id: request.params.id },
        data: { status, adminNotes, quotedPrice },
      });
      return { success: true, data: order };
    }
  );
}

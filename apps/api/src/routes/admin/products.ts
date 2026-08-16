import type { FastifyInstance } from "fastify";
import type { MultipartFile } from "@fastify/multipart";
import { prisma }       from "../../lib/prisma.js";
import { uploadBuffer } from "../../lib/cloudinary.js";
import { requireAdmin } from "../../middlewares/auth.js";

// Admin product routes — all require JWT auth.
// The public CRUD lives in routes/products.ts (POST/PUT/DELETE are also admin-only there).
// This file adds admin-specific endpoints: image upload and wood variant management.

export default async function adminProductsRoute(fastify: FastifyInstance) {

  // ── POST /api/admin/products/:id/images ───────────────────────────────────
  // Upload one or more product images to Cloudinary
  fastify.post<{ Params: { id: string } }>(
    "/:id/images",
    { preHandler: [requireAdmin] },
    async (request, reply) => {
      const { id } = request.params;
      const parts = request.parts();
      const created = [];

      for await (const part of parts) {
        if (part.type !== "file") continue;
        const file = part as MultipartFile;

        const buffer = await file.toBuffer();
        const url    = await uploadBuffer(buffer, file.filename, `products/${id}`);
        const isPrimary = (part as any).fields?.isPrimary?.value === "true";
        const angle     = ((part as any).fields?.angle?.value ?? "FRONT") as any;

        if (isPrimary) {
          // Unset current primary
          await prisma.productImage.updateMany({
            where: { productId: id },
            data:  { isPrimary: false },
          });
        }

        const image = await prisma.productImage.create({
          data: { productId: id, url, isPrimary, angle },
        });
        created.push(image);
      }

      return reply.status(201).send({ success: true, data: created });
    }
  );

  // ── DELETE /api/admin/products/:id/images/:imageId ────────────────────────
  fastify.delete<{ Params: { id: string; imageId: string } }>(
    "/:id/images/:imageId",
    { preHandler: [requireAdmin] },
    async (request, reply) => {
      await prisma.productImage.delete({ where: { id: request.params.imageId } });
      return reply.status(204).send();
    }
  );

  // ── PUT /api/admin/products/:id/wood-variants ─────────────────────────────
  // Replace the full set of wood variants for a product
  fastify.put<{ Params: { id: string } }>(
    "/:id/wood-variants",
    { preHandler: [requireAdmin] },
    async (request) => {
      const { variants } = request.body as {
        variants: Array<{
          woodTypeId: string;
          priceModifier: number;
          priceModifierType?: string;
        }>;
      };

      // Delete existing, re-create new
      await prisma.productWoodVariant.deleteMany({ where: { productId: request.params.id } });
      const created = await prisma.$transaction(
        variants.map((v) =>
          prisma.productWoodVariant.create({
            data: {
              productId:         request.params.id,
              woodTypeId:        v.woodTypeId,
              priceModifier:     v.priceModifier,
              priceModifierType: (v.priceModifierType ?? "FIXED_ADD") as any,
            },
          })
        )
      );

      return { success: true, data: created };
    }
  );

  // ── PATCH /api/admin/products/:id/toggle-active ───────────────────────────
  fastify.patch<{ Params: { id: string } }>(
    "/:id/toggle-active",
    { preHandler: [requireAdmin] },
    async (request) => {
      const current = await prisma.product.findUnique({ where: { id: request.params.id }, select: { isActive: true } });
      const product  = await prisma.product.update({
        where: { id: request.params.id },
        data:  { isActive: !current?.isActive },
      });
      return { success: true, data: { id: product.id, isActive: product.isActive } };
    }
  );
}

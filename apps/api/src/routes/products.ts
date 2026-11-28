import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middlewares/auth.js";

function toSlug(str: string) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function resolveWoodVariants(
  variants?: Array<{
    woodTypeId?: string;
    woodName?: string;
    priceModifier?: number;
    priceModifierType?: string;
  }>
) {
  if (!variants || variants.length === 0) return [];
  const resolved: Array<{
    woodTypeId: string;
    priceModifier: number;
    priceModifierType: "FIXED_ADD" | "MULTIPLIER" | "FIXED_PRICE";
  }> = [];

  for (const w of variants) {
    let woodTypeId = w.woodTypeId;
    if (!woodTypeId && w.woodName) {
      const slug = toSlug(w.woodName);
      const wood = await prisma.woodType.upsert({
        where: { slug },
        update: {},
        create: { name: w.woodName.trim(), slug },
      });
      woodTypeId = wood.id;
    } else if (woodTypeId) {
      // Ensure the id exists; if caller passed a slug/name instead of cuid, upsert
      const byId = await prisma.woodType.findUnique({ where: { id: woodTypeId } });
      if (!byId && w.woodName) {
        const slug = toSlug(w.woodName);
        const wood = await prisma.woodType.upsert({
          where: { slug },
          update: {},
          create: { name: w.woodName.trim(), slug },
        });
        woodTypeId = wood.id;
      }
    }
    if (woodTypeId) {
      resolved.push({
        woodTypeId,
        priceModifier: Number(w.priceModifier ?? 0),
        priceModifierType: (w.priceModifierType as "FIXED_ADD" | "MULTIPLIER" | "FIXED_PRICE") ?? "FIXED_ADD",
      });
    }
  }
  return resolved;
}

export default async function productsRoute(fastify: FastifyInstance) {
  // ── GET /api/products ──────────────────────────────────────────────────────
  fastify.get("/", async (request) => {
    const q = request.query as Record<string, string>;
    const page = Math.max(1, parseInt(q.page ?? "1", 10));
    const pageSize = Math.min(100, parseInt(q.pageSize ?? "24", 10));

    const where: any = {};
    if (q.includeInactive !== "true") {
      where.isActive = true;
    }

    if (q.category) where.category = { slug: q.category };
    if (q.search) {
      where.OR = [
        { name: { contains: q.search, mode: "insensitive" } },
        { shortDescription: { contains: q.search, mode: "insensitive" } },
      ];
    }
    if (q.woodType) {
      where.woodVariants = {
        some: { woodType: { name: { equals: q.woodType, mode: "insensitive" } } },
      };
    }
    if (q.minPrice || q.maxPrice) {
      where.basePrice = {
        ...(q.minPrice ? { gte: parseFloat(q.minPrice) } : {}),
        ...(q.maxPrice ? { lte: parseFloat(q.maxPrice) } : {}),
      };
    }

    const orderBy =
      q.sort === "price_asc"
        ? { basePrice: "asc" as const }
        : q.sort === "price_desc"
        ? { basePrice: "desc" as const }
        : q.sort === "newest"
        ? { createdAt: "desc" as const }
        : [{ isFeatured: "desc" as const }, { createdAt: "desc" as const }];

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: true,
          woodVariants: { include: { woodType: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      success: true,
      data: products,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  });

  // ── GET /api/products/featured ─────────────────────────────────────────────
  fastify.get("/featured", async () => {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      orderBy: { updatedAt: "desc" },
      include: {
        images: true,
        category: true,
        woodVariants: { include: { woodType: true } },
      },
    });
    return { success: true, data: products };
  });

  // ── GET /api/products/:slug ────────────────────────────────────────────────
  fastify.get<{ Params: { slug: string } }>("/:slug", async (request, reply) => {
    const product = await prisma.product.findUnique({
      where: { slug: request.params.slug },
      include: {
        category: true,
        images: true,
        woodVariants: { include: { woodType: true } },
      },
    });
    if (!product) return reply.status(404).send({ success: false, error: "Product not found." });
    return { success: true, data: product };
  });

  // ── POST /api/products (admin) ─────────────────────────────────────────────
  fastify.post("/", { preHandler: [requireAdmin] }, async (request, reply) => {
    const b = request.body as any;
    if (!b.name || !b.sku || !b.categoryId || b.basePrice === undefined) {
      return reply.status(400).send({
        success: false,
        error: "name, sku, categoryId, and basePrice are required.",
      });
    }

    const woodVariants = await resolveWoodVariants(b.woodVariants);
    const slug = b.slug ? toSlug(b.slug) : toSlug(b.name);

    const imagesInput: Array<{ url: string; isPrimary?: boolean; angle?: string; altText?: string }> =
      Array.isArray(b.images)
        ? b.images
        : b.primaryImage
        ? [{ url: b.primaryImage, isPrimary: true, angle: "FRONT" }]
        : [];

    try {
      const product = await prisma.product.create({
        data: {
          name: b.name,
          slug,
          shortDescription: b.shortDescription ?? b.name,
          description: b.description ?? b.shortDescription ?? b.name,
          basePrice: Number(b.basePrice),
          offerPrice: b.offerPrice !== undefined && b.offerPrice !== null && b.offerPrice !== "" ? Number(b.offerPrice) : null,
          sku: b.sku,
          categoryId: b.categoryId,
          dimensions: b.dimensions ?? null,
          finishSwatches: Array.isArray(b.finishSwatches) ? b.finishSwatches : [],
          fabricSwatches: Array.isArray(b.fabricSwatches) ? b.fabricSwatches : [],
          stock: b.stock !== undefined ? Number(b.stock) : 10,
          isFeatured: b.isFeatured ?? false,
          isActive: b.isActive ?? true,
          manufacturingTime: b.manufacturingTime ?? null,
          deliveryTime: b.deliveryTime ?? null,
          warranty: b.warranty ?? null,
          tags: b.tags ?? [],
          images: imagesInput.length
            ? {
                create: imagesInput.map((img, i) => ({
                  url: img.url,
                  altText: img.altText ?? b.name,
                  isPrimary: img.isPrimary ?? i === 0,
                  angle: (img.angle as any) ?? "FRONT",
                })),
              }
            : undefined,
          woodVariants: woodVariants.length
            ? { create: woodVariants }
            : undefined,
        },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: true,
          woodVariants: { include: { woodType: true } },
        },
      });
      return reply.status(201).send({ success: true, data: product });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err?.message ?? "Failed to create product." });
    }
  });

  // ── PUT /api/products/:id (admin) ──────────────────────────────────────────
  fastify.put<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [requireAdmin] },
    async (request, reply) => {
      const b = request.body as any;
      try {
        if (Array.isArray(b.woodVariants)) {
          const woodVariants = await resolveWoodVariants(b.woodVariants);
          await prisma.productWoodVariant.deleteMany({ where: { productId: request.params.id } });
          if (woodVariants.length > 0) {
            await prisma.productWoodVariant.createMany({
              data: woodVariants.map((w) => ({ ...w, productId: request.params.id })),
            });
          }
        }

        if (Array.isArray(b.images)) {
          await prisma.productImage.deleteMany({ where: { productId: request.params.id } });
          if (b.images.length > 0) {
            await prisma.productImage.createMany({
              data: b.images.map((img: any, i: number) => ({
                productId: request.params.id,
                url: img.url,
                altText: img.altText ?? b.name ?? null,
                isPrimary: img.isPrimary ?? i === 0,
                angle: img.angle ?? "FRONT",
              })),
            });
          }
        }

        const product = await prisma.product.update({
          where: { id: request.params.id },
          data: {
            ...(b.name !== undefined ? { name: b.name } : {}),
            ...(b.slug !== undefined ? { slug: toSlug(b.slug) } : {}),
            ...(b.sku !== undefined ? { sku: b.sku } : {}),
            ...(b.categoryId !== undefined ? { categoryId: b.categoryId } : {}),
            ...(b.shortDescription !== undefined ? { shortDescription: b.shortDescription } : {}),
            ...(b.description !== undefined ? { description: b.description } : {}),
            ...(b.basePrice !== undefined ? { basePrice: Number(b.basePrice) } : {}),
            ...(b.offerPrice !== undefined
              ? { offerPrice: b.offerPrice === null || b.offerPrice === "" ? null : Number(b.offerPrice) }
              : {}),
            ...(b.dimensions !== undefined ? { dimensions: b.dimensions || null } : {}),
            ...(Array.isArray(b.finishSwatches) ? { finishSwatches: b.finishSwatches } : {}),
            ...(Array.isArray(b.fabricSwatches) ? { fabricSwatches: b.fabricSwatches } : {}),
            ...(b.stock !== undefined ? { stock: Number(b.stock) } : {}),
            ...(b.isFeatured !== undefined ? { isFeatured: b.isFeatured } : {}),
            ...(b.isActive !== undefined ? { isActive: b.isActive } : {}),
            ...(b.manufacturingTime !== undefined ? { manufacturingTime: b.manufacturingTime } : {}),
            ...(b.deliveryTime !== undefined ? { deliveryTime: b.deliveryTime } : {}),
            ...(b.warranty !== undefined ? { warranty: b.warranty } : {}),
            ...(b.tags !== undefined ? { tags: b.tags } : {}),
          },
          include: {
            category: { select: { id: true, name: true, slug: true } },
            images: true,
            woodVariants: { include: { woodType: true } },
          },
        });
        return { success: true, data: product };
      } catch (err: any) {
        return reply.status(404).send({ success: false, error: err?.message ?? "Product not found." });
      }
    }
  );

  // ── DELETE /api/products/:id (admin) ──────────────────────────────────────
  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [requireAdmin] },
    async (request, reply) => {
      try {
        await prisma.product.delete({ where: { id: request.params.id } });
        return reply.status(204).send();
      } catch {
        return reply.status(404).send({ success: false, error: "Product not found." });
      }
    }
  );
}

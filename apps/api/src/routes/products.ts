import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middlewares/auth";

export default async function productsRoute(fastify: FastifyInstance) {

  // ── GET /api/products ──────────────────────────────────────────────────────
  fastify.get("/", async (request) => {
    const q = request.query as Record<string, string>;
    const page = Math.max(1, parseInt(q.page ?? "1", 10));
    const pageSize = Math.min(50, parseInt(q.pageSize ?? "12", 10));

    const where: any = {
      isActive: true,
    };

    if (q.category) where.category = { slug: q.category };
    if (q.search) where.OR = [
      { name: { contains: q.search, mode: "insensitive" } },
      { shortDescription: { contains: q.search, mode: "insensitive" } },
    ];
    if (q.woodType) where.woodVariants = { some: { woodType: { name: { equals: q.woodType, mode: "insensitive" } } } };
    if (q.minPrice || q.maxPrice) {
      where.basePrice = {
        ...(q.minPrice ? { gte: parseFloat(q.minPrice) } : {}),
        ...(q.maxPrice ? { lte: parseFloat(q.maxPrice) } : {}),
      };
    }

    const orderBy =
      q.sort === "price_asc" ? { basePrice: "asc" as const } :
        q.sort === "price_desc" ? { basePrice: "desc" as const } :
          q.sort === "newest" ? { createdAt: "desc" as const } :
            [{ isFeatured: "desc" as const }, { createdAt: "desc" as const }];

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
      take: 6,
      orderBy: { updatedAt: "desc" },
      include: { images: { where: { isPrimary: true } }, category: true, woodVariants: { include: { woodType: true } } },
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
    const product = await prisma.product.create({
      data: {
        name: b.name,
        slug: b.slug,
        shortDescription: b.shortDescription,
        description: b.description ?? b.shortDescription,
        basePrice: b.basePrice,
        sku: b.sku,
        categoryId: b.categoryId,
        isFeatured: b.isFeatured ?? false,
        isActive: b.isActive ?? true,
        manufacturingTime: b.manufacturingTime,
        deliveryTime: b.deliveryTime,
        warranty: b.warranty,
        tags: b.tags ?? [],
        woodVariants: b.woodVariants ? {
          create: b.woodVariants.map((w: any) => ({
            woodTypeId: w.woodTypeId,
            priceModifier: w.priceModifier ?? 0,
            priceModifierType: w.priceModifierType ?? "FIXED_ADD",
          })),
        } : undefined,
      },
    });
    return reply.status(201).send({ success: true, data: product });
  });

  // ── PUT /api/products/:id (admin) ──────────────────────────────────────────
  fastify.put<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [requireAdmin] },
    async (request, reply) => {
      const b = request.body as any;
      try {
        const product = await prisma.product.update({
          where: { id: request.params.id },
          data: {
            name: b.name,
            shortDescription: b.shortDescription,
            description: b.description,
            basePrice: b.basePrice,
            isFeatured: b.isFeatured,
            isActive: b.isActive,
            manufacturingTime: b.manufacturingTime,
            deliveryTime: b.deliveryTime,
            warranty: b.warranty,
            tags: b.tags,
          },
        });
        return { success: true, data: product };
      } catch {
        return reply.status(404).send({ success: false, error: "Product not found." });
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

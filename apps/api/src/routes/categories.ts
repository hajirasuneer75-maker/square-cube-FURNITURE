import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middlewares/auth.js";

function toSlug(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default async function categoriesRoute(fastify: FastifyInstance) {
  // GET /api/categories
  fastify.get("/", async () => {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      include: { children: true, _count: { select: { products: true } } },
    });
    return { success: true, data: categories };
  });

  // GET /api/categories/:slug
  fastify.get<{ Params: { slug: string } }>("/:slug", async (request, reply) => {
    const category = await prisma.category.findUnique({
      where: { slug: request.params.slug },
      include: { children: true, _count: { select: { products: true } } },
    });
    if (!category) return reply.status(404).send({ success: false, error: "Category not found." });
    return { success: true, data: category };
  });

  // POST /api/categories (admin)
  fastify.post("/", { preHandler: [requireAdmin] }, async (request, reply) => {
    const b = request.body as {
      name?: string;
      slug?: string;
      description?: string;
      imageUrl?: string;
      icon?: string;
      parentId?: string | null;
    };

    if (!b.name?.trim()) {
      return reply.status(400).send({ success: false, error: "Category name is required." });
    }

    const slug = (b.slug?.trim() ? toSlug(b.slug) : toSlug(b.name));
    try {
      const created = await prisma.category.create({
        data: {
          name: b.name.trim(),
          slug,
          description: b.description?.trim() || null,
          imageUrl: b.imageUrl?.trim() || null,
          icon: b.icon?.trim() || "🪵",
          parentId: b.parentId || null,
        },
        include: { _count: { select: { products: true } } },
      });
      return reply.status(201).send({ success: true, data: created });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err?.message ?? "Could not create category." });
    }
  });

  // PUT /api/categories/:id (admin)
  fastify.put<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [requireAdmin] },
    async (request, reply) => {
      const b = request.body as {
        name?: string;
        slug?: string;
        description?: string;
        imageUrl?: string;
        icon?: string;
      };
      try {
        const updated = await prisma.category.update({
          where: { id: request.params.id },
          data: {
            ...(b.name !== undefined ? { name: b.name.trim() } : {}),
            ...(b.slug !== undefined ? { slug: toSlug(b.slug) } : {}),
            ...(b.description !== undefined ? { description: b.description || null } : {}),
            ...(b.imageUrl !== undefined ? { imageUrl: b.imageUrl || null } : {}),
            ...(b.icon !== undefined ? { icon: b.icon || null } : {}),
          },
          include: { _count: { select: { products: true } } },
        });
        return { success: true, data: updated };
      } catch {
        return reply.status(404).send({ success: false, error: "Category not found." });
      }
    }
  );

  // DELETE /api/categories/:id (admin)
  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [requireAdmin] },
    async (request, reply) => {
      try {
        const count = await prisma.product.count({ where: { categoryId: request.params.id } });
        if (count > 0) {
          return reply.status(409).send({
            success: false,
            error: `Cannot delete category with ${count} linked product(s). Reassign or delete them first.`,
          });
        }
        await prisma.category.delete({ where: { id: request.params.id } });
        return reply.status(204).send();
      } catch {
        return reply.status(404).send({ success: false, error: "Category not found." });
      }
    }
  );
}

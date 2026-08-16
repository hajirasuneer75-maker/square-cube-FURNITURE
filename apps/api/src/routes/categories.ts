import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export default async function categoriesRoute(fastify: FastifyInstance) {

  // GET /api/categories
  fastify.get("/", async () => {
    const categories = await prisma.category.findMany({
      where:   { parentId: null }, // only top-level
      orderBy: { name: "asc" },
      include: { children: true, _count: { select: { products: true } } },
    });
    return { success: true, data: categories };
  });

  // GET /api/categories/:slug
  fastify.get<{ Params: { slug: string } }>("/:slug", async (request, reply) => {
    const category = await prisma.category.findUnique({
      where:   { slug: request.params.slug },
      include: { children: true, _count: { select: { products: true } } },
    });
    if (!category) return reply.status(404).send({ success: false, error: "Category not found." });
    return { success: true, data: category };
  });
}

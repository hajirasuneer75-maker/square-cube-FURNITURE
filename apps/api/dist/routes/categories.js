import { prisma } from "../lib/prisma.js";
export default async function categoriesRoute(fastify) {
    // GET /api/categories
    fastify.get("/", async () => {
        const categories = await prisma.category.findMany({
            where: { parentId: null }, // only top-level
            orderBy: { name: "asc" },
            include: { children: true, _count: { select: { products: true } } },
        });
        return { success: true, data: categories };
    });
    // GET /api/categories/:slug
    fastify.get("/:slug", async (request, reply) => {
        const category = await prisma.category.findUnique({
            where: { slug: request.params.slug },
            include: { children: true, _count: { select: { products: true } } },
        });
        if (!category)
            return reply.status(404).send({ success: false, error: "Category not found." });
        return { success: true, data: category };
    });
}
//# sourceMappingURL=categories.js.map
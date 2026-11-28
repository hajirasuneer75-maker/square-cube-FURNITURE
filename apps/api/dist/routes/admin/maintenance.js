import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../middlewares/auth.js";
export default async function adminMaintenanceRoute(fastify) {
    // GET stats
    fastify.get("/stats", { preHandler: [requireAdmin] }, async () => {
        const [total, open, inProgress, completed] = await prisma.$transaction([
            prisma.maintenanceTicket.count(),
            prisma.maintenanceTicket.count({ where: { status: "OPEN" } }),
            prisma.maintenanceTicket.count({ where: { status: "IN_PROGRESS" } }),
            prisma.maintenanceTicket.count({ where: { status: "COMPLETED" } }),
        ]);
        return { success: true, data: { total, open, inProgress, completed } };
    });
}
//# sourceMappingURL=maintenance.js.map
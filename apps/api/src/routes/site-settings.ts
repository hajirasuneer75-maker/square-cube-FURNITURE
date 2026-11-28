import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middlewares/auth.js";

const DEFAULT_SETTINGS: Record<string, string> = {
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918547097173",
  whatsappDisplay: "+91 85470 97173",
  businessName: "Square Cube Furniture",
  businessTagline: "Architectural Woodcraft & Custom Studio",
  businessEmail: "hello@squarecubefurniture.in",
  businessCity: "Kerala, India",
  announcementText: "✦ Ultra-Luxury Handcrafted Furniture · Nilambur Teak & Heritage Hardwoods · Concierge: +91 85470 97173",
  announcementEnabled: "true",
};

export default async function siteSettingsRoute(fastify: FastifyInstance) {
  // GET /api/site-settings — public
  fastify.get("/", async () => {
    const settings = await prisma.siteSetting.findMany();
    const result: Record<string, string> = { ...DEFAULT_SETTINGS };
    settings.forEach((s) => {
      result[s.key] = s.value;
    });
    return { success: true, data: result };
  });

  // PUT /api/site-settings (admin) — upsert multiple keys at once
  fastify.put("/", { preHandler: [requireAdmin] }, async (request) => {
    const patch = request.body as Record<string, string>;
    const ops = Object.entries(patch).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      })
    );
    await prisma.$transaction(ops);
    return { success: true, message: "Settings updated." };
  });
}

import { uploadBuffer, isCloudinaryConfigured } from "../lib/cloudinary.js";
const ALLOWED_MIME = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
    "application/pdf",
];
export default async function uploadRoute(fastify) {
    // POST /api/upload?folder=maintenance|custom|products|categories
    fastify.post("/", async (request, reply) => {
        const q = request.query;
        const folder = (q.folder ?? "uploads").replace(/[^a-zA-Z0-9/_-]/g, "");
        if (!isCloudinaryConfigured()) {
            return reply.status(503).send({
                success: false,
                error: "Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
            });
        }
        const parts = request.parts();
        const urls = [];
        for await (const part of parts) {
            if (part.type !== "file")
                continue;
            const file = part;
            if (!ALLOWED_MIME.includes(file.mimetype)) {
                return reply.status(400).send({
                    success: false,
                    error: `Unsupported file type: ${file.mimetype}`,
                });
            }
            const buffer = await file.toBuffer();
            const safeName = `${Date.now()}-${file.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
            const url = await uploadBuffer(buffer, safeName, folder || "uploads");
            urls.push(url);
        }
        if (urls.length === 0) {
            return reply.status(400).send({ success: false, error: "No file uploaded." });
        }
        return reply.status(201).send({
            success: true,
            url: urls[0],
            urls,
        });
    });
}
//# sourceMappingURL=upload.js.map
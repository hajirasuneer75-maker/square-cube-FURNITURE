import { v2 as cloudinary } from "cloudinary";
export function isCloudinaryConfigured() {
    const name = process.env.CLOUDINARY_CLOUD_NAME;
    const key = process.env.CLOUDINARY_API_KEY;
    const secret = process.env.CLOUDINARY_API_SECRET;
    return Boolean(name &&
        key &&
        secret &&
        !name.includes("your-") &&
        !key.includes("your-") &&
        !secret.includes("your-"));
}
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
const FOLDER = process.env.CLOUDINARY_FOLDER ?? "square-cube-furniture";
// Upload a Buffer to Cloudinary and return the secure URL
export function uploadBuffer(buffer, filename, subfolder = "uploads") {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder: `${FOLDER}/${subfolder}`,
            resource_type: "auto",
            public_id: filename.replace(/\.[^.]+$/, ""), // strip extension
            overwrite: false,
        }, (err, result) => {
            if (err || !result)
                return reject(err ?? new Error("Cloudinary upload failed"));
            resolve(result.secure_url);
        });
        stream.end(buffer);
    });
}
// Delete by public_id (e.g. when a product is removed)
export function deleteAsset(publicId) {
    return cloudinary.uploader.destroy(publicId).then(() => undefined);
}
//# sourceMappingURL=cloudinary.js.map
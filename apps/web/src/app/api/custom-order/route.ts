import { NextRequest, NextResponse } from "next/server";

// ─── POST /api/custom-order ───────────────────────────────────────────────────
//
// Accepts multipart/form-data with:
//   Text fields: name, phone, email, city, furnitureType, woodType, budgetRange,
//                length, width, height, description
//   File fields: files[] (images/PDFs, up to 5 × 10 MB)
//
// Pipeline:
//   1. Parse formData via native request.formData() — no busboy needed in Next 14
//   2. Validate required fields
//   3. Upload each file to Cloudinary (shown as comments; wire up when ready)
//   4. Persist enquiry to Prisma (shown as comments)
//   5. Notify admin via WhatsApp Business API (shown as comments)
//   6. Return { success, enquiryId }

export async function POST(request: NextRequest) {
  try {
    // ── 1. Parse ──────────────────────────────────────────────────────────────
    const fd = await request.formData();

    const name          = fd.get("name")?.toString().trim()          ?? "";
    const phone         = fd.get("phone")?.toString().trim()         ?? "";
    const email         = fd.get("email")?.toString().trim()         ?? "";
    const city          = fd.get("city")?.toString().trim()          ?? "";
    const furnitureType = fd.get("furnitureType")?.toString().trim() ?? "";
    const woodType      = fd.get("woodType")?.toString().trim()      ?? "";
    const budgetRange   = fd.get("budgetRange")?.toString().trim()   ?? "";
    const length        = fd.get("length")?.toString().trim()        ?? "";
    const width         = fd.get("width")?.toString().trim()         ?? "";
    const height        = fd.get("height")?.toString().trim()        ?? "";
    const description   = fd.get("description")?.toString().trim()   ?? "";

    const rawFiles = fd.getAll("files");
    const files    = rawFiles.filter((f): f is File => f instanceof File && f.size > 0);

    // ── 2. Validate ───────────────────────────────────────────────────────────
    if (!name || !phone || !furnitureType || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, phone, furnitureType, description." },
        { status: 400 }
      );
    }

    if (phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number. Provide at least 10 digits." },
        { status: 400 }
      );
    }

    // ── 3. Upload reference images to Cloudinary ──────────────────────────────
    const referenceImageUrls: string[] = [];

    for (const file of files) {
      const bytes  = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // TODO: Replace this block with the actual Cloudinary upload:
      //
      // import { v2 as cloudinary } from "cloudinary";
      // cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, ... });
      //
      // const url = await new Promise<string>((resolve, reject) => {
      //   const stream = cloudinary.uploader.upload_stream(
      //     { folder: "square-cube/enquiries", resource_type: "auto" },
      //     (err, result) => err ? reject(err) : resolve(result!.secure_url)
      //   );
      //   stream.end(buffer);
      // });
      // referenceImageUrls.push(url);

      // For now, acknowledge file receipt only
      void buffer; // suppress unused-variable warning
      referenceImageUrls.push(`/uploads/${file.name}`);
      console.info(`[custom-order] File received: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    }

    // ── 4. Persist to database ────────────────────────────────────────────────
    // TODO: Uncomment once Prisma is wired into this package:
    //
    // import { prisma } from "@square-cube/database";
    //
    // const enquiry = await prisma.customOrder.create({
    //   data: {
    //     name, phone, email, city,
    //     furnitureType, woodType, budgetRange,
    //     description,
    //     dimensions: length ? JSON.stringify({ length, width, height }) : null,
    //     referenceImages: referenceImageUrls,
    //     status: "PENDING",
    //   },
    // });
    // const enquiryId = `ENQ-${enquiry.id}`;

    // ── 5. Notify admin on WhatsApp ────────────────────────────────────────────
    // TODO: Send via Twilio / WhatsApp Business Cloud API:
    //
    // const adminPhone = process.env.ADMIN_WA_NUMBER;
    // await fetch(`https://api.twilio.com/...`, { method: "POST", body: ... });

    // ── 6. Respond ────────────────────────────────────────────────────────────
    const enquiryId = `ENQ-${Date.now().toString(36).toUpperCase()}`;

    console.info(`[custom-order] New enquiry ${enquiryId}`, {
      name, phone, furnitureType, budgetRange, filesCount: files.length,
    });

    return NextResponse.json({
      success:    true,
      enquiryId,
      message:    "Your request has been received. We'll reach out within 2–3 hours.",
    });

  } catch (err) {
    console.error("[custom-order] Unhandled error:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again or contact us on WhatsApp." },
      { status: 500 }
    );
  }
}

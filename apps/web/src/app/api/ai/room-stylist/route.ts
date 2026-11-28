import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchProductsWithFallback } from "@/lib/api";

export const runtime = "nodejs";

function getRuleBasedResult(
  roomType: string,
  styleType: string,
  catalog: Awaited<ReturnType<typeof fetchProductsWithFallback>>
) {
  const woodMap: Record<string, string[]> = {
    "kerala-heritage": ["Nilambur Teak", "Rosewood", "Mahogany"],
    "modern-luxury":   ["Mahogany", "Nilambur Teak", "Marine Ply + Veneer"],
    "minimalist-warm": ["Marine Ply + Veneer", "Nilambur Teak", "Sheesham"],
  };
  const finishMap: Record<string, string[]> = {
    "kerala-heritage": ["Natural Matte Oil", "Walnut Stain"],
    "modern-luxury":   ["PU Gloss", "Champagne Brass Accent"],
    "minimalist-warm": ["Natural Matte", "Warm Duco Satin"],
  };
  const upholsteryMap: Record<string, { name: string; hex: string }[]> = {
    "kerala-heritage": [
      { name: "Ivory Kasavu Linen", hex: "#EFE8DC" },
      { name: "Cognac Tan Leather", hex: "#8B5A3C" },
      { name: "Earthy Olive",       hex: "#6B705C" },
    ],
    "modern-luxury": [
      { name: "Warm Alabaster Bouclé", hex: "#F5F1EA" },
      { name: "Espresso Velvet",       hex: "#2B221F" },
      { name: "Champagne Silk",        hex: "#C5A880" },
    ],
    "minimalist-warm": [
      { name: "Oatmeal Cotton",   hex: "#E6DDD0" },
      { name: "Sandstone Weave",  hex: "#CBBBA0" },
      { name: "Warm Charcoal",    hex: "#4A4643" },
    ],
  };

  const roomLower = roomType.toLowerCase();
  const matched = catalog
    .filter((p) => {
      if (roomLower.includes("living")) return ["living-room", "sofas", "coffee-tables", "tv-units"].includes(p.categorySlug);
      if (roomLower.includes("bed"))    return ["bedroom", "beds", "wardrobes"].includes(p.categorySlug);
      if (roomLower.includes("dining")) return ["dining-room", "dining-tables"].includes(p.categorySlug);
      if (roomLower.includes("office")) return ["office", "coffee-tables", "storage"].includes(p.categorySlug);
      return p.isFeatured;
    })
    .slice(0, 3);

  const suggestions = matched.length > 0 ? matched : catalog.slice(0, 3);
  const woods = woodMap[styleType] ?? woodMap["kerala-heritage"];
  const finishes = finishMap[styleType] ?? finishMap["kerala-heritage"];

  return {
    analysis: `Your ${roomType} pairs wonderfully with our ${styleType.replace(/-/g, " ")} palette. Warm natural tones and balanced architectural proportions in ${woods[0]} will anchor the space while keeping light flow open and welcoming.`,
    woodRecommendations: woods,
    finishRecommendations: finishes,
    upholsteryColors: upholsteryMap[styleType] ?? upholsteryMap["kerala-heritage"],
    matchedProducts: suggestions.map((p) => ({
      slug: p.slug,
      name: p.name,
      categoryName: p.categoryName,
      basePrice: p.offerPrice ?? p.basePrice,
      primaryImage: p.primaryImage,
      reason: `Curated by Square Cube Furniture for ${roomType} (${woods[0]} compatibility).`,
    })),
    whatsappMessage: `Hello Square Cube Furniture! I used the AI Room Stylist for my ${roomType} (${styleType.replace(/-/g, " ")}). I'd love pricing on ${woods[0]} pieces with ${finishes[0]} finish: ${suggestions.map((s) => s.name).join(", ")}.`,
    usedFallback: true,
  };
}

export async function POST(request: NextRequest) {
  try {
    const fd = await request.formData();
    const imageFile = fd.get("image") as File | null;
    const roomType = (fd.get("roomType") as string) || "Living Room";
    const styleType = (fd.get("styleType") as string) || "kerala-heritage";

    const catalog = await fetchProductsWithFallback();
    const GEMINI_KEY = process.env.GEMINI_API_KEY?.trim();

    if (!GEMINI_KEY || !imageFile) {
      return NextResponse.json({ result: getRuleBasedResult(roomType, styleType, catalog) });
    }

    const arrayBuf = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuf).toString("base64");
    const mimeType = imageFile.type || "image/jpeg";

    const catalogSummary = catalog
      .slice(0, 20)
      .map((p) => `- slug: "${p.slug}", name: "${p.name}", category: "${p.categoryName}", price: ₹${p.offerPrice ?? p.basePrice}`)
      .join("\n");

    const styleLabels: Record<string, string> = {
      "kerala-heritage": "Kerala Heritage Teak (warm traditional teak & handcraft detailing)",
      "modern-luxury":   "Modern Luxury (architectural silhouettes with champagne bronze & walnut tones)",
      "minimalist-warm": "Minimalist Warm (airy silk cream tones & clean joinery)",
    };

    const prompt = `You are the lead interior architect for Square Cube Furniture in Kerala, India.
Analyse the uploaded photo of this ${roomType} and recommend woods, finishes, upholstery colors, and exact matching products from the catalog below.

Preferred aesthetic: ${styleLabels[styleType] ?? styleType}
Room type: ${roomType}

Square Cube Furniture Catalog:
${catalogSummary}

Respond with ONLY valid JSON (no markdown fences):
{
  "analysis": "<2-3 sentences evaluating the room's natural/artificial lighting, wall colors, flooring, and spatial proportions>",
  "woodRecommendations": ["<wood 1>", "<wood 2>", "<wood 3>"],
  "finishRecommendations": ["<finish 1>", "<finish 2>"],
  "upholsteryColors": [
    { "name": "<color name>", "hex": "<#hex>" },
    { "name": "<color name>", "hex": "<#hex>" },
    { "name": "<color name>", "hex": "<#hex>" }
  ],
  "productMatches": [
    { "slug": "<exact-slug-from-catalog>", "reason": "<one sentence why it suits this room>" }
  ],
  "whatsappMessage": "<a concise enquiry message addressed to Square Cube Furniture summarizing the room and recommended pieces>"
}`;

    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const response = await model.generateContent([
      { inlineData: { mimeType, data: base64 } },
      { text: prompt },
    ]);

    const rawText = response.response.text();
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ result: getRuleBasedResult(roomType, styleType, catalog) });
    }

    const parsed = JSON.parse(match[0]);
    const matchedProducts = Array.isArray(parsed.productMatches)
      ? parsed.productMatches
          .map((m: { slug: string; reason: string }) => {
            const p = catalog.find((item) => item.slug === m.slug);
            if (!p) return null;
            return {
              slug: p.slug,
              name: p.name,
              categoryName: p.categoryName,
              basePrice: p.offerPrice ?? p.basePrice,
              primaryImage: p.primaryImage,
              reason: m.reason,
            };
          })
          .filter(Boolean)
      : [];

    const fallbackProducts =
      matchedProducts.length > 0
        ? matchedProducts
        : catalog.slice(0, 3).map((p) => ({
            slug: p.slug,
            name: p.name,
            categoryName: p.categoryName,
            basePrice: p.offerPrice ?? p.basePrice,
            primaryImage: p.primaryImage,
            reason: `Handcrafted ${p.categoryName} piece from Square Cube Furniture.`,
          }));

    return NextResponse.json({
      result: {
        analysis: parsed.analysis,
        woodRecommendations: parsed.woodRecommendations ?? ["Nilambur Teak", "Mahogany"],
        finishRecommendations: parsed.finishRecommendations ?? ["Natural Matte", "Walnut Stain"],
        upholsteryColors: parsed.upholsteryColors ?? [{ name: "Warm Ivory", hex: "#F0EAE1" }],
        matchedProducts: fallbackProducts,
        whatsappMessage:
          parsed.whatsappMessage ||
          `Hello Square Cube Furniture! I analysed my ${roomType} with the AI Room Stylist and would like pricing for ${fallbackProducts.map((p: any) => p.name).join(", ")}.`,
        usedFallback: false,
      },
    });
  } catch (err) {
    console.error("[ai/room-stylist]", err);
    const catalog = await fetchProductsWithFallback();
    return NextResponse.json({
      result: getRuleBasedResult("Living Room", "kerala-heritage", catalog),
    });
  }
}

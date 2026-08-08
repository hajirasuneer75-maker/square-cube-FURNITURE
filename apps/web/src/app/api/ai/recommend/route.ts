import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PRODUCT_CATALOGUE = `
Available product categories and slugs (use these EXACT slugs):
- Sofas: classic-chesterfield-sofa, l-shaped-sectional, two-seater-lovechair
- Beds: queen-platform-bed, storage-king-bed
- Dining: six-seater-dining-table, farmhouse-dining-set
- Tables: walnut-coffee-table, glass-side-table, laptop-writing-desk
- Storage: oak-bookshelf, chest-of-drawers, wardrobe-with-mirror
- Chairs: accent-armchair, bar-stool-set, rocking-chair
- Outdoor: teak-garden-bench, patio-dining-set
`.trim();

interface Recommendation {
  slug:   string;
  reason: string;
}

interface RecommendResponse {
  recommendations: Recommendation[];
}

export async function POST(request: NextRequest) {
  let body: { query?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { query } = body;
  if (!query || typeof query !== "string" || query.trim().length < 3) {
    return NextResponse.json({ error: "query must be at least 3 characters." }, { status: 400 });
  }

  const prompt = `You are a furniture recommendation engine for Square Cube, a premium custom furniture brand.

Given a customer's natural-language description, recommend 1–3 matching products from the catalogue below.

${PRODUCT_CATALOGUE}

Customer query: "${query.trim()}"

Respond with ONLY a JSON object — no markdown, no code fences, no explanation:
{
  "recommendations": [
    { "slug": "<exact-slug-from-catalogue>", "reason": "<one sentence why this matches>" },
    ...
  ]
}

If no products match, return: { "recommendations": [] }`;

  try {
    const message = await anthropic.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages:   [{ role: "user", content: prompt }],
    });

    const rawText = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    let parsed: RecommendResponse;
    try {
      parsed = JSON.parse(rawText.trim()) as RecommendResponse;
    } catch {
      // Attempt to extract JSON from a potentially wrapped response
      const match = rawText.match(/\{[\s\S]*\}/);
      parsed = match
        ? (JSON.parse(match[0]) as RecommendResponse)
        : { recommendations: [] };
    }

    return NextResponse.json({ success: true, data: parsed });
  } catch (err) {
    console.error("[ai/recommend]", err);
    return NextResponse.json({ error: "Recommendation failed." }, { status: 500 });
  }
}

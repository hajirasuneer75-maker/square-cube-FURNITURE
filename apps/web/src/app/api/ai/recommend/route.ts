import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchProductsWithFallback } from "@/lib/api";

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

  const catalog = await fetchProductsWithFallback();
  const GEMINI_KEY = process.env.GEMINI_API_KEY?.trim();

  const keywordFallback = () => {
    const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    const scored = catalog
      .map((p) => {
        const hay = `${p.name} ${p.shortDescription} ${p.categoryName} ${(p.availableWoods ?? []).map((w) => w.name).join(" ")}`.toLowerCase();
        const score = terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const picks = scored.length > 0 ? scored.map((x) => x.p) : catalog.filter((p) => p.isFeatured).slice(0, 3);
    return {
      recommendations: picks.map((p) => ({
        slug: p.slug,
        reason: `Matches your search in Square Cube Furniture's ${p.categoryName} collection.`,
      })),
    };
  };

  if (!GEMINI_KEY) {
    return NextResponse.json({ success: true, data: keywordFallback() });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const catalogText = catalog
      .map((p) => `- ${p.slug} | ${p.name} | ${p.categoryName} | ${p.shortDescription}`)
      .join("\n");

    const prompt = `You are a furniture recommendation engine for Square Cube Furniture.
Select 1 to 3 best matching slugs from this catalog for the query: "${query.trim()}".

Catalog:
${catalogText}

Return ONLY valid JSON:
{ "recommendations": [ { "slug": "<exact-slug>", "reason": "<one concise sentence>" } ] }`;

    const response = await model.generateContent(prompt);
    const rawText = response.response.text();
    const match = rawText.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : keywordFallback();

    return NextResponse.json({ success: true, data: parsed });
  } catch {
    return NextResponse.json({ success: true, data: keywordFallback() });
  }
}

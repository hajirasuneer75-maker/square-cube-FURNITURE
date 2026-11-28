import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

function buildFallbackQuote(params: {
  name?: string;
  furnitureType: string;
  woodType?: string;
  budgetRange: string;
  dimensions?: string;
}) {
  const greeting = params.name ? `Namaste ${params.name},` : "Namaste,";
  const wood = params.woodType || "Nilambur Teak or Mahogany";
  const dims = params.dimensions ? ` in ${params.dimensions}` : "";
  return `${greeting} thank you for connecting with Square Cube Furniture! We would be delighted to craft your custom ${params.furnitureType}${dims} in seasoned ${wood}. Based on your stated budget (${params.budgetRange}), our master craftsmen can tailor the joinery, polish finish, and upholstery to your exact room aesthetic within 4 to 6 weeks. Every piece undergoes kiln seasoning and multi-stage quality inspection at our studio. Reply to this message or call us to finalise your design drawings and wood samples.`;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body.", { status: 400 });
  }

  const { name, furnitureType, woodType, budgetRange, dimensions, description } = body as {
    name?: string;
    furnitureType?: string;
    woodType?: string;
    budgetRange?: string;
    dimensions?: string;
    description?: string;
  };

  if (!furnitureType || !budgetRange || !description) {
    return new Response("furnitureType, budgetRange, and description are required.", { status: 400 });
  }

  const encoder = new TextEncoder();
  const GEMINI_KEY = process.env.GEMINI_API_KEY?.trim();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (!GEMINI_KEY) {
          const text = buildFallbackQuote({ name, furnitureType, woodType, budgetRange, dimensions });
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          return;
        }

        const genAI = new GoogleGenerativeAI(GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a senior architectural furniture consultant for Square Cube Furniture in India.
Write a warm, concise WhatsApp quote message in plain text (no markdown, no asterisks) of 5 to 7 sentences.
Greet ${name ?? "Valued Customer"}, acknowledge their ${furnitureType} request (${woodType ?? "wood to be confirmed"}, budget ${budgetRange}, dimensions ${dimensions ?? "custom"}), mention craftsmanship timeline (4-6 weeks), and invite them to reply to confirm drawings.
Customer description: ${description}`;

        const result = await model.generateContentStream(prompt);
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch {
        const text = buildFallbackQuote({ name, furnitureType, woodType, budgetRange, dimensions });
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection:      "keep-alive",
    },
  });
}

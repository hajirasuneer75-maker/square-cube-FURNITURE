import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body.", { status: 400 });
  }

  const {
    name,
    furnitureType,
    woodType,
    budgetRange,
    dimensions,
    description,
  } = body as {
    name?:          string;
    furnitureType?: string;
    woodType?:      string;
    budgetRange?:   string;
    dimensions?:    string;
    description?:   string;
  };

  if (!furnitureType || !budgetRange || !description) {
    return new Response("furnitureType, budgetRange, and description are required.", { status: 400 });
  }

  const systemPrompt = `You are a senior sales consultant for Square Cube, a premium custom furniture studio based in India.
Your task is to write a warm, professional WhatsApp quote message on behalf of the Square Cube team.
The message should:
- Greet the customer by first name (if provided).
- Acknowledge their specific furniture request with enthusiasm.
- Suggest a price range consistent with the stated budget, using Indian Rupee (₹) formatting.
- Mention the wood type they chose and its premium qualities.
- Give an estimated manufacturing timeline (typically 4–8 weeks for custom pieces).
- End with a friendly call to action: "Reply to this message" or "Call us to finalise your design".
- Be written entirely in plain text suitable for WhatsApp (no markdown formatting, no asterisks).
- Be concise — 5 to 8 sentences.`;

  const userPrompt = `Generate a WhatsApp quote message for this custom furniture request:
Customer name: ${name ?? "Valued Customer"}
Furniture type: ${furnitureType}
Wood type: ${woodType ?? "Not specified"}
Budget range: ${budgetRange}
Dimensions: ${dimensions ?? "Custom / to be confirmed"}
Customer description: ${description}`;

  // Stream SSE back to the client
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const stream = await anthropic.messages.stream({
          model:      "claude-sonnet-4-6",
          max_tokens: 600,
          system:     systemPrompt,
          messages:   [{ role: "user", content: userPrompt }],
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const data = JSON.stringify({ text: event.delta.text });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        }

        // Signal completion
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
        );
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

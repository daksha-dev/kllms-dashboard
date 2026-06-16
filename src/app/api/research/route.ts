import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generate } from "@/lib/gemini";
import { webSearch } from "@/lib/search";
import { researchPrompt } from "@/lib/prompts";
import { DEFAULT_MODEL, type ModelId } from "@/lib/models";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    context?: string;
    pastedProfile?: string;
    model?: ModelId;
  };
  if (!body.name && !body.pastedProfile) {
    return NextResponse.json({ error: "Provide a name or paste profile text." }, { status: 400 });
  }

  const model = body.model ?? (user.preferredModel as ModelId) ?? DEFAULT_MODEL;
  const name = body.name || "Unknown person";
  const extraContext = [body.context, body.pastedProfile].filter(Boolean).join("\n\n");

  try {
    // Primary: Gemini with Google Search grounding
    const result = await generate({
      model,
      prompt: researchPrompt(name, extraContext || undefined),
      useSearchGrounding: true,
      temperature: 0.4,
    });
    return NextResponse.json({
      text: result.text,
      sources: result.sources ?? [],
      method: "gemini-grounding",
    });
  } catch (err) {
    console.error("grounding failed, falling back to web search + synthesis", err);
    try {
      // Fallback: explicit web search then synthesis
      const hits = await webSearch(`${name} LinkedIn achievements background`, 8);
      const searchBlock = hits
        .map((h, i) => `[${i + 1}] ${h.title}\n${h.url}\n${h.snippet}`)
        .join("\n\n");
      const result = await generate({
        model,
        prompt: researchPrompt(name, `${extraContext}\n\nWeb search results:\n${searchBlock}`),
        temperature: 0.4,
      });
      return NextResponse.json({
        text: result.text,
        sources: hits.map((h) => ({ title: h.title, url: h.url })),
        method: "search-fallback",
      });
    } catch (err2) {
      console.error("fallback also failed", err2);
      return NextResponse.json(
        {
          error: "Research failed in both paths. Try a different model or paste more profile text.",
        },
        { status: 500 }
      );
    }
  }
}

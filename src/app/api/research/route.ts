import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generate } from "@/lib/llm";
import { webSearch } from "@/lib/search";
import { researchPrompt } from "@/lib/prompts";
import { defaultModel, findModel, type ModelId } from "@/lib/models";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    context?: string;
    pastedProfile?: string;
    model?: string;
  };
  if (!body.name && !body.pastedProfile) {
    return NextResponse.json({ error: "Provide a name or paste profile text." }, { status: 400 });
  }

  const model = (body.model ?? user.preferredModel ?? defaultModel()) as ModelId;
  if (!findModel(model)) {
    return NextResponse.json({ error: `Unknown model: ${model}` }, { status: 400 });
  }
  const name = body.name || "Unknown person";
  const extraContext = [body.context, body.pastedProfile].filter(Boolean).join("\n\n");

  // Always do an explicit Tavily search first; synthesize from the hits.
  // This works the same for NIM and Gemini (grounding was Gemini-only).
  let hits: Awaited<ReturnType<typeof webSearch>> = [];
  try {
    hits = await webSearch(`${name} achievements background biography`, 8);
  } catch (err) {
    console.error("tavily search failed", err);
  }

  if (hits.length === 0) {
    return NextResponse.json(
      {
        error:
          "Web search returned no results. Check TAVILY_API_KEY / SERPAPI_API_KEY in .env.local and on Vercel.",
      },
      { status: 500 }
    );
  }

  const searchBlock = hits
    .map((h, i) => `[${i + 1}] ${h.title}\n${h.url}\n${h.snippet}`)
    .join("\n\n");

  try {
    const result = await generate({
      model,
      prompt: researchPrompt(name, `${extraContext}\n\nWeb search results:\n${searchBlock}`),
      temperature: 0.4,
    });
    return NextResponse.json({
      text: result.text,
      sources: hits.map((h) => ({ title: h.title, url: h.url })),
      method: "search-synthesis",
    });
  } catch (err) {
    console.error("synthesis failed", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error:
          "Synthesis failed after a successful web search. Most likely an LLM provider quota or model-name issue.",
        details: msg,
      },
      { status: 500 }
    );
  }
}

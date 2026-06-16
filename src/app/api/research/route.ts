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
    const groundingErrMsg = err instanceof Error ? err.message : String(err);
    try {
      // Fallback: explicit web search then synthesis
      const hits = await webSearch(`${name} LinkedIn achievements background`, 8);
      if (hits.length === 0) {
        return NextResponse.json(
          {
            error: "Web search returned no results and Gemini grounding failed. Check TAVILY_API_KEY / SERPAPI_API_KEY and Gemini quota.",
            groundingError: groundingErrMsg,
          },
          { status: 500 }
        );
      }
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
      const synthErrMsg = err2 instanceof Error ? err2.message : String(err2);
      return NextResponse.json(
        {
          error: "Research failed in both paths. Gemini is the bottleneck — likely a quota/billing issue. Try a different model or check your Gemini API key's billing status.",
          groundingError: groundingErrMsg,
          synthesisError: synthErrMsg,
        },
        { status: 500 }
      );
    }
  }
}

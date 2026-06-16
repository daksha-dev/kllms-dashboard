import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generate } from "@/lib/llm";
import { webSearch } from "@/lib/search";
import { iitmOutreachPrompt } from "@/lib/prompts";
import { defaultModel, findModel, type ModelId } from "@/lib/models";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    achievementArea?: string;
    angle?: string;
    model?: ModelId;
  };
  if (!body.achievementArea) {
    return NextResponse.json({ error: "Tell me what kind of achievement to look for." }, { status: 400 });
  }
  const model = (body.model ?? user.preferredModel ?? defaultModel()) as ModelId;
  if (!findModel(model)) {
    return NextResponse.json({ error: `Unknown model: ${model}` }, { status: 400 });
  }

  const query = `IIT Madras BS degree students ${body.achievementArea} ${body.angle ?? ""}`.trim();

  let hits: Awaited<ReturnType<typeof webSearch>> = [];
  try {
    hits = await webSearch(query, 8);
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
    const r = await generate({
      model,
      prompt: iitmOutreachPrompt({
        achievementArea: body.achievementArea,
        angle: body.angle ?? "",
        searchBlock,
      }),
      temperature: 0.6,
    });
    return NextResponse.json({ text: r.text, sources: hits.map((h) => ({ title: h.title, url: h.url })) });
  } catch (err) {
    console.error("synthesis failed", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Could not find students. Try again or rephrase.", details: msg },
      { status: 500 }
    );
  }
}

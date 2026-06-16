import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generate } from "@/lib/gemini";
import { iitmOutreachPrompt } from "@/lib/prompts";
import { DEFAULT_MODEL, type ModelId } from "@/lib/models";

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
  const model = body.model ?? (user.preferredModel as ModelId) ?? DEFAULT_MODEL;
  try {
    const r = await generate({
      model,
      prompt: iitmOutreachPrompt({ achievementArea: body.achievementArea, angle: body.angle ?? "" }),
      useSearchGrounding: true,
      temperature: 0.6,
    });
    return NextResponse.json({ text: r.text, sources: r.sources ?? [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not find students. Try again or rephrase." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generate } from "@/lib/llm";
import { questionPrompt } from "@/lib/prompts";
import { defaultModel, findModel, type ModelId } from "@/lib/models";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    guest?: string;
    research?: string;
    count?: number;
    durationMin?: number;
    tone?: string;
    angle?: string;
    model?: ModelId;
  };
  if (!body.guest || !body.research) {
    return NextResponse.json({ error: "Guest name and research text are required." }, { status: 400 });
  }
  const model = (body.model ?? user.preferredModel ?? defaultModel()) as ModelId;
  if (!findModel(model)) {
    return NextResponse.json({ error: `Unknown model: ${model}` }, { status: 400 });
  }
  const count = Math.min(30, Math.max(3, body.count ?? 10));
  const durationMin = Math.min(180, Math.max(10, body.durationMin ?? 30));

  try {
    const result = await generate({
      model,
      prompt: questionPrompt({
        guest: body.guest,
        research: body.research,
        count,
        durationMin,
        tone: body.tone ?? "curious, warm, thoughtful",
        angle: body.angle,
      }),
      temperature: 0.8,
    });
    return NextResponse.json({ text: result.text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not generate questions. Try again." }, { status: 500 });
  }
}

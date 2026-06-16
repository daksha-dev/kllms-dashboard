import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generate } from "@/lib/llm";
import { outreachEmailPrompt, followupEmailPrompt } from "@/lib/prompts";
import { defaultModel, findModel, type ModelId } from "@/lib/models";

type Body =
  | { kind: "outreach"; guest: string; research: string; podcastName: string; reason: string; tone?: string; model?: ModelId }
  | { kind: "followup"; guest: string; context: string; tone?: string; model?: ModelId };

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Body;
  const model = (body.model ?? user.preferredModel ?? defaultModel()) as ModelId;
  if (!findModel(model)) {
    return NextResponse.json({ error: `Unknown model: ${model}` }, { status: 400 });
  }
  try {
    if (body.kind === "outreach") {
      if (!body.guest || !body.research || !body.podcastName || !body.reason) {
        return NextResponse.json({ error: "Missing fields for outreach email." }, { status: 400 });
      }
      const r = await generate({
        model,
        prompt: outreachEmailPrompt({
          guest: body.guest,
          research: body.research,
          podcastName: body.podcastName,
          reason: body.reason,
          tone: body.tone,
        }),
        temperature: 0.7,
      });
      return NextResponse.json({ text: r.text });
    }
    if (body.kind === "followup") {
      if (!body.guest || !body.context) {
        return NextResponse.json({ error: "Missing fields for follow-up email." }, { status: 400 });
      }
      const r = await generate({
        model,
        prompt: followupEmailPrompt({ guest: body.guest, context: body.context, tone: body.tone }),
        temperature: 0.6,
      });
      return NextResponse.json({ text: r.text });
    }
    return NextResponse.json({ error: "Unknown email kind." }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not draft email. Try again." }, { status: 500 });
  }
}

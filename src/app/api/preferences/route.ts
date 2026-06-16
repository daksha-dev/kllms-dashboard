import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateUserPreferredModel } from "@/lib/notion";
import { MODELS, type ModelId } from "@/lib/models";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { model } = (await req.json().catch(() => ({}))) as { model?: string };
  if (!model || !MODELS.some((m) => m.id === model)) {
    return NextResponse.json({ error: "Invalid model" }, { status: 400 });
  }
  await updateUserPreferredModel(user.id, model as ModelId);
  return NextResponse.json({ ok: true, model });
}

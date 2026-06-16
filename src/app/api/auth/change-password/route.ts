import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, changePassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { newPassword } = (await req.json().catch(() => ({}))) as { newPassword?: string };
  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  await changePassword(user.id, newPassword);
  return NextResponse.json({ ok: true });
}

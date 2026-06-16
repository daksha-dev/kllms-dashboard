import { NextRequest, NextResponse } from "next/server";
import { loginWithPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  const result = await loginWithPassword(email, password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json({
    user: { id: result.user.id, email: result.user.email, name: result.user.name, role: result.user.role },
  });
}

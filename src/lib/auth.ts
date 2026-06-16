import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "./env";
import { findUserByEmail, findUserById, createUser, type User } from "./notion";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "kllm_session";
const SESSION_DAYS = 30;

function key() {
  return new TextEncoder().encode(env().AUTH_SECRET);
}

export async function signSession(userId: string): Promise<string> {
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key());
}

export async function verifySession(token: string): Promise<{ uid: string } | null> {
  try {
    const { payload } = await jwtVerify(token, key());
    if (typeof payload.uid === "string") return { uid: payload.uid };
    return null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySession(token);
  if (!session) return null;
  return findUserById(session.uid);
}

export async function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
}

export async function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export async function loginWithPassword(
  email: string,
  password: string
): Promise<{ ok: true; user: User; token: string } | { ok: false; error: string }> {
  const e = env();

  // Seed-on-first-login: if this matches SEED_ADMIN env and no user exists, create it.
  let user = await findUserByEmail(email);
  if (!user && e.SEED_ADMIN_EMAIL && e.SEED_ADMIN_PASSWORD) {
    if (email.toLowerCase() === e.SEED_ADMIN_EMAIL.toLowerCase() && password === e.SEED_ADMIN_PASSWORD) {
      const hash = await bcrypt.hash(password, 10);
      user = await createUser({
        email: e.SEED_ADMIN_EMAIL,
        name: e.SEED_ADMIN_NAME || e.SEED_ADMIN_EMAIL,
        passwordHash: hash,
        role: "admin",
      });
    }
  }
  if (!user) return { ok: false, error: "No account with that email." };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { ok: false, error: "Wrong password." };

  const token = await signSession(user.id);
  await setSessionCookie(token);
  return { ok: true, user, token };
}

export async function changePassword(userId: string, newPassword: string) {
  const hash = await bcrypt.hash(newPassword, 10);
  const { updateUserPassword } = await import("./notion");
  await updateUserPassword(userId, hash);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

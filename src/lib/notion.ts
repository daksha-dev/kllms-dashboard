import { Client } from "@notionhq/client";
import { env } from "./env";

let notion: Client | null = null;
export function notionClient(): Client {
  if (!notion) notion = new Client({ auth: env().NOTION_TOKEN });
  return notion;
}

export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: "admin" | "user";
  preferredModel?: string;
};

function plain(rt: { plain_text: string }[] | undefined): string {
  return (rt ?? []).map((t) => t.plain_text).join("").trim();
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const notion = notionClient();
  const dbId = env().NOTION_USERS_DB_ID;
  const res = await notion.databases.query({
    database_id: dbId,
    filter: { property: "Email", title: { equals: email } },
    page_size: 1,
  });
  const page = res.results[0];
  if (!page || !("properties" in page)) return null;
  return pageToUser(page);
}

export async function findUserById(id: string): Promise<User | null> {
  try {
    const page = await notionClient().pages.retrieve({ page_id: id });
    if (!("properties" in page)) return null;
    return pageToUser(page);
  } catch {
    return null;
  }
}

function pageToUser(page: { id: string; properties: Record<string, unknown> }): User {
  const p = page.properties as Record<string, Record<string, unknown>>;
  const email = plain(p.Email?.title as { plain_text: string }[] | undefined) ||
                plain(p.Email?.rich_text as { plain_text: string }[] | undefined);
  const passwordHash = plain(p.PasswordHash?.rich_text as { plain_text: string }[] | undefined);
  const name = plain(p.Name?.rich_text as { plain_text: string }[] | undefined) || email;
  const role = ((p.Role?.select as { name?: string } | undefined)?.name ?? "user") as "admin" | "user";
  const preferredModel = plain(p.PreferredModel?.rich_text as { plain_text: string }[] | undefined) || undefined;
  return { id: page.id, email, name, passwordHash, role, preferredModel };
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  role?: "admin" | "user";
}): Promise<User> {
  const notion = notionClient();
  const page = await notion.pages.create({
    parent: { database_id: env().NOTION_USERS_DB_ID },
    properties: {
      Email: { title: [{ text: { content: input.email } }] },
      PasswordHash: { rich_text: [{ text: { content: input.passwordHash } }] },
      Name: { rich_text: [{ text: { content: input.name } }] },
      Role: { select: { name: input.role ?? "user" } },
    },
  });
  return pageToUser(page as { id: string; properties: Record<string, unknown> });
}

export async function updateUserPreferredModel(userId: string, model: string): Promise<void> {
  await notionClient().pages.update({
    page_id: userId,
    properties: {
      PreferredModel: { rich_text: [{ text: { content: model } }] },
    },
  });
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  await notionClient().pages.update({
    page_id: userId,
    properties: {
      PasswordHash: { rich_text: [{ text: { content: passwordHash } }] },
    },
  });
}

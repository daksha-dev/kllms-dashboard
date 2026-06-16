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

type PropValue = Record<string, unknown>;
type Page = { id: string; properties: Record<string, PropValue> };

function plain(rt: { plain_text: string }[] | undefined): string {
  return (rt ?? []).map((t) => t.plain_text).join("").trim();
}

/**
 * Read a property's text content regardless of its Notion type
 * (title / rich_text / email / url / phone_number / number-as-string).
 */
function readText(prop: PropValue | undefined): string {
  if (!prop) return "";
  const t = prop.type as string | undefined;
  switch (t) {
    case "title":
      return plain(prop.title as { plain_text: string }[] | undefined);
    case "rich_text":
      return plain(prop.rich_text as { plain_text: string }[] | undefined);
    case "email": {
      // The shape varies: when reading from a page, prop.email is the string
      // itself; when reading from a database prop config, it's { email: "..." }.
      const v = prop.email;
      if (typeof v === "string") return v.trim();
      if (v && typeof v === "object") return ((v as { email?: string }).email ?? "").trim();
      return "";
    }
    case "url": {
      const v = prop.url;
      if (typeof v === "string") return v.trim();
      if (v && typeof v === "object") return ((v as { url?: string }).url ?? "").trim();
      return "";
    }
    case "phone_number": {
      const v = prop.phone_number;
      if (typeof v === "string") return v.trim();
      if (v && typeof v === "object") return ((v as { phone_number?: string }).phone_number ?? "").trim();
      return "";
    }
    default:
      return "";
  }
}

function readSelectName(prop: PropValue | undefined): string | undefined {
  const sel = prop?.select as { name?: string } | undefined;
  return sel?.name;
}

/**
 * Build a property value matching the column's actual Notion type.
 * Notion's API requires email/url/phone_number/number/select to use a
 * different shape than rich_text/title, and rejects the request if you
 * guess wrong.
 */
export function buildPropValue(propName: string, value: string, propType: string): Record<string, unknown> {
  switch (propType) {
    case "title":
      return { title: [{ text: { content: value } }] };
    case "rich_text":
      return { rich_text: [{ text: { content: value } }] };
    case "email":
      return { email: value };
    case "url":
      return { url: value };
    case "phone_number":
      return { phone_number: value };
    case "number":
      return { number: Number(value) };
    case "select":
      return { select: { name: value } };
    default:
      return { rich_text: [{ text: { content: value } }] };
  }
}

async function getPropType(propName: string): Promise<string> {
  const db = (await notionClient().databases.retrieve({
    database_id: env().NOTION_USERS_DB_ID,
  })) as { properties: Record<string, { type: string }> };
  return db.properties[propName]?.type ?? "rich_text";
}

/** Discover the actual property names + types in the users DB. */
type DbSchema = {
  emailProp: string;          // property name holding the email
  nameProp: string;           // property name holding the display name
  passwordProp: string;       // property name holding the password hash
  roleProp?: string;          // optional
  preferredModelProp?: string;
};

let schemaCache: DbSchema | null = null;

export async function getUsersDbSchema(): Promise<DbSchema> {
  if (schemaCache) return schemaCache;
  const db = await notionClient().databases.retrieve({ database_id: env().NOTION_USERS_DB_ID });
  const props = (db as { properties: Record<string, { type: string }> }).properties;

  const findByName = (...names: string[]): string | undefined => {
    const lower = names.map((n) => n.toLowerCase());
    for (const [propName, def] of Object.entries(props)) {
      if (lower.includes(propName.toLowerCase())) return propName;
    }
    return undefined;
  };
  const findByType = (type: string, exclude: string[] = []): string | undefined => {
    for (const [name, def] of Object.entries(props)) {
      if (def.type === type && !exclude.includes(name)) return name;
    }
    return undefined;
  };

  // Email: prefer Email-type, fall back to a property named "Email"
  const emailProp =
    findByType("email") ??
    findByName("Email", "User email") ??
    // if not found, fall back to the title prop (common in Notion user tables)
    findByType("title") ??
    "Email";

  // Password: any property whose name matches (case-insensitive)
  const passwordProp =
    findByName("PasswordHash", "Password Hash", "Password", "Hash", "Passwordhash") ??
    // last resort: any text-like prop that isn't email/name/role/model
    Object.keys(props).find(
      (k) =>
        k !== emailProp &&
        k !== "Name" &&
        k !== "Role" &&
        k !== "PreferredModel" &&
        (props[k].type === "rich_text" || props[k].type === "title")
    ) ?? "PasswordHash";

  // Name: prefer a name-like prop; fall back to email
  const nameProp =
    findByName("Name", "Full name", "Display name", "Username") ??
    "Name";

  const roleProp = findByName("Role", "Type", "Access");
  const preferredModelProp = findByName("PreferredModel", "Preferred Model", "Model");

  schemaCache = { emailProp, nameProp, passwordProp, roleProp, preferredModelProp };
  return schemaCache;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const schema = await getUsersDbSchema();
  const notion = notionClient();

  // Query by the email property's actual type.
  const emailPropDef = (await notion.databases.retrieve({
    database_id: env().NOTION_USERS_DB_ID,
  })) as { properties: Record<string, { type: string }> };
  const emailType = emailPropDef.properties[schema.emailProp]?.type ?? "rich_text";

  const filter =
    emailType === "title"
      ? { property: schema.emailProp, title: { equals: email } }
      : emailType === "email"
        ? { property: schema.emailProp, email: { equals: email } }
        : { property: schema.emailProp, rich_text: { equals: email } };

  const res = await notion.databases.query({
    database_id: env().NOTION_USERS_DB_ID,
    filter,
    page_size: 1,
  });
  const page = res.results[0] as Page | undefined;
  if (!page) return null;
  return pageToUser(page, schema);
}

export async function findUserById(id: string): Promise<User | null> {
  try {
    const page = (await notionClient().pages.retrieve({ page_id: id })) as Page;
    return pageToUser(page);
  } catch {
    return null;
  }
}

async function pageToUser(page: Page, schema?: DbSchema): Promise<User> {
  const s = schema ?? (await getUsersDbSchema());
  const p = page.properties;
  const email = readText(p[s.emailProp]) || readText(p["Email"]) || readText(p["email"]);
  const passwordHash = readText(p[s.passwordProp]) || readText(p["PasswordHash"]) || readText(p["Password"]);
  const name = readText(p[s.nameProp]) || email;
  const role = (readSelectName(p[s.roleProp ?? "Role"]) ?? "user") as "admin" | "user";
  const preferredModel =
    readText(p[s.preferredModelProp ?? "PreferredModel"]) || undefined;
  return { id: page.id, email, name, passwordHash, role, preferredModel };
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  role?: "admin" | "user";
}): Promise<User> {
  const schema = await getUsersDbSchema();
  const notion = notionClient();
  const dbInfo = (await notion.databases.retrieve({
    database_id: env().NOTION_USERS_DB_ID,
  })) as { properties: Record<string, { type: string }> };

  const buildValue = (propName: string, value: string): Record<string, unknown> =>
    buildPropValue(propName, value, dbInfo.properties[propName]?.type ?? "rich_text");

  const props: Record<string, unknown> = {
    [schema.emailProp]: buildValue(schema.emailProp, input.email),
  };
  if (schema.nameProp !== schema.emailProp) {
    props[schema.nameProp] = buildValue(schema.nameProp, input.name);
  }
  if (schema.passwordProp && schema.passwordProp !== schema.emailProp) {
    props[schema.passwordProp] = buildValue(schema.passwordProp, input.passwordHash);
  } else {
    // Password col == email col: extremely unlikely, encode into name as fallback.
    props[schema.nameProp] = buildValue(schema.nameProp, `${input.name}::${input.passwordHash}`);
  }
  if (schema.roleProp) {
    props[schema.roleProp] = { select: { name: input.role ?? "user" } };
  }

  const page = await notion.pages.create({
    parent: { database_id: env().NOTION_USERS_DB_ID },
    properties: props as never,
  });
  return pageToUser(page as Page, schema);
}

export async function updateUserPreferredModel(userId: string, model: string): Promise<void> {
  const schema = await getUsersDbSchema();
  if (!schema.preferredModelProp) return;
  const propType = await getPropType(schema.preferredModelProp);
  await notionClient().pages.update({
    page_id: userId,
    properties: {
      [schema.preferredModelProp]: buildPropValue(schema.preferredModelProp, model, propType),
    } as never,
  });
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  const schema = await getUsersDbSchema();
  const propType = await getPropType(schema.passwordProp);
  await notionClient().pages.update({
    page_id: userId,
    properties: {
      [schema.passwordProp]: buildPropValue(schema.passwordProp, passwordHash, propType),
    } as never,
  });
}

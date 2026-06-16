import { z } from "zod";

const schema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  TAVILY_API_KEY: z.string().optional().default(""),
  SERPAPI_API_KEY: z.string().optional().default(""),
  NOTION_TOKEN: z.string().min(1, "NOTION_TOKEN is required"),
  NOTION_USERS_DB_ID: z.string().min(1, "NOTION_USERS_DB_ID is required"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 chars"),
  SEED_ADMIN_EMAIL: z.string().optional().default(""),
  SEED_ADMIN_PASSWORD: z.string().optional().default(""),
  SEED_ADMIN_NAME: z.string().optional().default("Admin"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration. Set these in .env.local:\n${issues}`
    );
  }
  cached = parsed.data;
  return cached;
}

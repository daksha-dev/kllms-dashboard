import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env";
import type { ModelId } from "./models";

let client: GoogleGenerativeAI | null = null;
function getClient() {
  if (!client) client = new GoogleGenerativeAI(env().GEMINI_API_KEY);
  return client;
}

export type GenOptions = {
  model: ModelId;
  system?: string;
  temperature?: number;
  json?: boolean;
  useSearchGrounding?: boolean;
};

export async function generate(opts: GenOptions & { prompt: string }): Promise<{
  text: string;
  sources?: { title: string; url: string }[];
}> {
  const model = getClient().getGenerativeModel({
    model: opts.model,
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
    },
    ...(opts.system ? { systemInstruction: opts.system } : {}),
    tools: opts.useSearchGrounding
      ? ([{ googleSearch: {} }] as unknown as never)
      : undefined,
  });

  const result = await model.generateContent(opts.prompt);
  const text = result.response.text();

  const sources: { title: string; url: string }[] = [];
  const cand = result.response.candidates?.[0];
  const grounding = cand?.groundingMetadata as
    | { groundingChunks?: { web?: { title?: string; uri?: string } }[] }
    | undefined;
  for (const chunk of grounding?.groundingChunks ?? []) {
    if (chunk.web?.uri) {
      sources.push({ title: chunk.web.title ?? chunk.web.uri, url: chunk.web.uri });
    }
  }

  return { text, sources: sources.length ? sources : undefined };
}

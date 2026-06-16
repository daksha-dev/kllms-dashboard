/**
 * NIM / OpenAI-compatible generation. NVIDIA NIM is the only provider — it
 * speaks the OpenAI chat completions protocol, so any OPENAI_API_KEY with
 * OPENAI_BASE_URL pointing at NIM works too.
 *
 * Web search / grounding is no longer a property of the LLM call. Routes
 * that need retrieval should call webSearch() (src/lib/search.ts) first
 * and pass the results into the prompt.
 */

import OpenAI from "openai";
import { env } from "./env";
import { findModel, modelSupportsJson } from "./models";

export type GenOptions = {
  model: string;
  system?: string;
  temperature?: number;
  json?: boolean;
};

export type GenResult = {
  text: string;
  sources?: { title: string; url: string }[];
};

let providerLogged = false;

function getOpenAIClient(): OpenAI {
  const e = env();
  if (!providerLogged) {
    console.log(`[llm] provider=nim base_url=${e.OPENAI_BASE_URL}`);
    providerLogged = true;
  }
  return new OpenAI({
    apiKey: e.NVIDIA_API_KEY || e.OPENAI_API_KEY,
    baseURL: e.OPENAI_BASE_URL || undefined,
  });
}

export async function generate(opts: GenOptions & { prompt: string }): Promise<GenResult> {
  const client = getOpenAIClient();
  const modelDef = findModel(opts.model);
  if (!modelDef) {
    throw new Error(`Unknown model: ${opts.model}`);
  }

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  if (opts.system) messages.push({ role: "system", content: opts.system });
  messages.push({ role: "user", content: opts.prompt });

  const useJson = !!opts.json && modelSupportsJson(opts.model);

  const res = await client.chat.completions.create({
    model: opts.model,
    messages,
    temperature: opts.temperature ?? 0.7,
    ...(useJson ? { response_format: { type: "json_object" as const } } : {}),
  });

  return { text: res.choices[0]?.message?.content ?? "" };
}

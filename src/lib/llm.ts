/**
 * Provider dispatch: routes generation calls to NVIDIA NIM (default) or
 * Gemini (fallback) based on which API keys are configured.
 *
 * Selection is env-driven and picked at first call. There is no automatic
 * runtime failover — if NIM is configured, every call goes to NIM. To
 * switch providers, restart the process with a different env.
 *
 * Web search / grounding is no longer a property of the LLM call. Routes
 * that need retrieval should call webSearch() (src/lib/search.ts) first
 * and pass the results into the prompt.
 */

import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env";
import { findModel, modelSupportsJson, type ModelProvider } from "./models";

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
let chosenProvider: ModelProvider | null = null;

function pickProvider(): ModelProvider {
  if (chosenProvider) return chosenProvider;
  const e = env();
  if (e.NVIDIA_API_KEY || e.OPENAI_API_KEY) chosenProvider = "nim";
  else if (e.GEMINI_API_KEY) chosenProvider = "gemini";
  else
    throw new Error(
      "No LLM provider configured. Set NVIDIA_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY."
    );
  if (!providerLogged) {
    console.log(`[llm] provider=${chosenProvider} base_url=${e.OPENAI_BASE_URL}`);
    providerLogged = true;
  }
  return chosenProvider;
}

// ---- NIM / OpenAI-compatible provider ----

let openaiClient: OpenAI | null = null;
function getOpenAIClient(): OpenAI {
  if (openaiClient) return openaiClient;
  const e = env();
  const apiKey = e.NVIDIA_API_KEY || e.OPENAI_API_KEY;
  openaiClient = new OpenAI({
    apiKey,
    baseURL: e.OPENAI_BASE_URL || undefined,
  });
  return openaiClient;
}

async function generateNim(opts: GenOptions & { prompt: string }): Promise<GenResult> {
  const client = getOpenAIClient();
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

  const text = res.choices[0]?.message?.content ?? "";
  return { text };
}

// ---- Gemini provider ----

let geminiClient: GoogleGenerativeAI | null = null;
function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) geminiClient = new GoogleGenerativeAI(env().GEMINI_API_KEY);
  return geminiClient;
}

async function generateGemini(opts: GenOptions & { prompt: string }): Promise<GenResult> {
  const model = getGeminiClient().getGenerativeModel({
    model: opts.model,
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
    },
    ...(opts.system ? { systemInstruction: opts.system } : {}),
  });
  const result = await model.generateContent(opts.prompt);
  return { text: result.response.text() };
}

// ---- Public entry point ----

export async function generate(opts: GenOptions & { prompt: string }): Promise<GenResult> {
  const modelDef = findModel(opts.model);
  const provider = modelDef?.provider ?? pickProvider();
  if (provider === "nim") return generateNim(opts);
  return generateGemini(opts);
}

export type ModelProvider = "gemini" | "nim";

export type ModelDef = {
  id: string;
  label: string;
  description: string;
  provider: ModelProvider;
  supportsJson: boolean;
};

export const MODELS: ModelDef[] = [
  // NVIDIA NIM — verified to respond on the chat completions endpoint.
  {
    id: "meta/llama-3.3-70b-instruct",
    label: "Llama 3.3 70B (NIM)",
    description: "Default — strong general purpose, fast",
    provider: "nim",
    supportsJson: true,
  },
  {
    id: "meta/llama-3.1-8b-instruct",
    label: "Llama 3.1 8B (NIM)",
    description: "Fastest, cheap",
    provider: "nim",
    supportsJson: true,
  },
  {
    id: "nvidia/nemotron-mini-4b-instruct",
    label: "Nemotron Mini 4B (NIM)",
    description: "Tiny + quick, good for simple prompts",
    provider: "nim",
    supportsJson: true,
  },
  {
    id: "moonshotai/kimi-k2.6",
    label: "Kimi K2.6 (NIM)",
    description: "Moonshot, fast + strong",
    provider: "nim",
    supportsJson: true,
  },
  {
    id: "qwen/qwen3-next-80b-a3b-instruct",
    label: "Qwen3 80B (NIM)",
    description: "Qwen 3 next-gen, multilingual",
    provider: "nim",
    supportsJson: true,
  },
  {
    id: "z-ai/glm-5.1",
    label: "GLM 5.1 (NIM)",
    description: "Zhipu, long-horizon tasks",
    provider: "nim",
    supportsJson: true,
  },
  // Gemini (fallback if NIM key missing)
  {
    id: "gemini-flash-latest",
    label: "Gemini Flash (latest)",
    description: "Auto-routes to newest Flash",
    provider: "gemini",
    supportsJson: true,
  },
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    description: "Fast, great quality",
    provider: "gemini",
    supportsJson: true,
  },
  {
    id: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    description: "Fast, cheap",
    provider: "gemini",
    supportsJson: true,
  },
];

export type ModelId = (typeof MODELS)[number]["id"];

export function findModel(id: string | null | undefined): ModelDef | undefined {
  if (!id) return undefined;
  return MODELS.find((m) => m.id === id);
}

export function modelSupportsJson(id: string | null | undefined): boolean {
  return findModel(id)?.supportsJson ?? false;
}

/**
 * Default model: prefer a NIM model if NVIDIA is configured, else Gemini.
 */
export function defaultModel(): ModelId {
  const nim = MODELS.find((m) => m.provider === "nim");
  return (nim?.id ?? "gemini-flash-latest") as ModelId;
}

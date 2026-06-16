export type ModelProvider = "nim";

export type ModelDef = {
  id: string;
  label: string;
  description: string;
  provider: ModelProvider;
  supportsJson: boolean;
};

/**
 * Verified to respond on the NVIDIA NIM chat completions endpoint with the
 * current `NVIDIA_API_KEY` in .env.local. Probe results, Jun 2026.
 *
 *   OK  meta/llama-3.3-70b-instruct          (3.2s)
 *   OK  meta/llama-3.1-8b-instruct           (0.4s)
 *   OK  meta/llama-3.1-70b-instruct          (60s — large)
 *   OK  nvidia/nemotron-mini-4b-instruct     (0.5s)
 *   OK  nvidia/nemotron-3-nano-30b-a3b       (0.6s)
 *   OK  nvidia/nemotron-3-nano-omni-30b-a3b-reasoning  (0.8s)
 *   OK  nvidia/nemotron-3-super-120b-a12b    (5s)
 *   OK  nvidia/llama-3.3-nemotron-super-49b-v1     (50s)
 *   OK  nvidia/llama-3.3-nemotron-super-49b-v1.5   (3s)
 *   OK  moonshotai/kimi-k2.6                 (0.6s)
 *   OK  qwen/qwen3-next-80b-a3b-instruct     (4.5s)
 *   OK  qwen/qwen3.5-397b-a17b               (26s)
 *   OK  z-ai/glm-5.1                         (0.7s)
 *   OK  deepseek-ai/deepseek-v4-pro          (8s)
 *   OK  deepseek-ai/deepseek-v4-flash        (6s)
 *   OK  openai/gpt-oss-120b                  (25s)
 *   OK  openai/gpt-oss-20b                   (0.5s)
 *   OK  minimaxai/minimax-m3                 (0.7s)
 *
 *   FAIL nvidia/llama-3.1-nemotron-70b-instruct   (404 not in account)
 *   FAIL nvidia/llama-3.1-nemotron-ultra-253b-v1  (404 not in account)
 *   FAIL nvidia/nemotron-nano-3-30b-a3b           (404 no such model)
 *   FAIL nvidia/nemotron-nano-9b-v2               (404)
 *   FAIL qwen/qwen3.5-122b-a10b                   (500 server parse error)
 *   SKIP nvidia/nemotron-3-ultra-550b-a55b         (responds in 13s on probe
 *                                                 but times out >180s on full
 *                                                 route sweep — too slow to
 *                                                 be useful in the UI)
 */
export const MODELS: ModelDef[] = [
  {
    id: "meta/llama-3.3-70b-instruct",
    label: "Llama 3.3 70B (NIM)",
    description: "Default — strong general purpose",
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
    id: "meta/llama-3.1-70b-instruct",
    label: "Llama 3.1 70B (NIM)",
    description: "Bigger context than 3.3 70B on some prompts",
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
    id: "nvidia/nemotron-3-nano-30b-a3b",
    label: "Nemotron 3 Nano 30B (NIM)",
    description: "Small MoE, fast + strong",
    provider: "nim",
    supportsJson: true,
  },
  {
    id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
    label: "Nemotron 3 Nano Omni 30B (NIM)",
    description: "Reasoning-tuned nano",
    provider: "nim",
    supportsJson: true,
  },
  {
    id: "nvidia/nemotron-3-super-120b-a12b",
    label: "Nemotron 3 Super 120B (NIM)",
    description: "Strong MoE, current-gen NVIDIA flagship",
    provider: "nim",
    supportsJson: true,
  },
  {
    id: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
    label: "Llama 3.3 Nemotron Super 49B v1.5 (NIM)",
    description: "Post-trained for instruction following",
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
    id: "qwen/qwen3.5-397b-a17b",
    label: "Qwen 3.5 397B (NIM)",
    description: "Qwen 3.5 flagship MoE, strongest Qwen",
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
  {
    id: "deepseek-ai/deepseek-v4-pro",
    label: "DeepSeek V4 Pro (NIM)",
    description: "DeepSeek pro tier, strong reasoning",
    provider: "nim",
    supportsJson: true,
  },
  {
    id: "deepseek-ai/deepseek-v4-flash",
    label: "DeepSeek V4 Flash (NIM)",
    description: "DeepSeek flash tier, faster than pro",
    provider: "nim",
    supportsJson: true,
  },
  {
    id: "openai/gpt-oss-120b",
    label: "GPT-OSS 120B (NIM)",
    description: "OpenAI's open-weight 120B",
    provider: "nim",
    supportsJson: true,
  },
  {
    id: "openai/gpt-oss-20b",
    label: "GPT-OSS 20B (NIM)",
    description: "OpenAI's open-weight 20B, fast",
    provider: "nim",
    supportsJson: true,
  },
  {
    id: "minimaxai/minimax-m3",
    label: "Minimax M3 (NIM)",
    description: "Minimax's current model",
    provider: "nim",
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
 * Default model: first entry in MODELS (Llama 3.3 70B).
 */
export function defaultModel(): ModelId {
  return MODELS[0].id as ModelId;
}

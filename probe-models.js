// Probe the NVIDIA NIM chat completions endpoint with a list of model IDs
// to find out which are actually responsive (not just listed in /v1/models).
// Also try DeepSeek V4 Pro/Flash and the Nemotron 3 family.
const API_KEY = "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";
const BASE = "https://integrate.api.nvidia.com/v1";

const MODELS = [
  // Already in code
  "meta/llama-3.3-70b-instruct",
  "meta/llama-3.1-8b-instruct",
  "nvidia/nemotron-mini-4b-instruct",
  "moonshotai/kimi-k2.6",
  "qwen/qwen3-next-80b-a3b-instruct",
  "z-ai/glm-5.1",
  // Newly discovered candidates
  "deepseek-ai/deepseek-v4-pro",
  "deepseek-ai/deepseek-v4-flash",
  "nvidia/llama-3.1-nemotron-70b-instruct",
  "nvidia/llama-3.1-nemotron-ultra-253b-v1",
  "nvidia/llama-3.3-nemotron-super-49b-v1",
  "nvidia/llama-3.3-nemotron-super-49b-v1.5",
  "nvidia/nemotron-3-super-120b-a12b",
  "nvidia/nemotron-3-ultra-550b-a55b",
  "nvidia/nemotron-3-nano-30b-a3b",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
  "nvidia/nemotron-nano-3-30b-a3b",
  "nvidia/nemotron-nano-9b-v2",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "minimaxai/minimax-m3",
  "qwen/qwen3.5-397b-a17b",
  "qwen/qwen3.5-122b-a10b",
  "meta/llama-3.1-70b-instruct",
  "meta/llama-3.1-405b-instruct",
  "mistralai/mistral-large-3-675b-instruct-2512",
  "google/gemma-3-27b-it",
];

async function probe(model) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 180000);
  const start = Date.now();
  try {
    const r = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "Reply in one short sentence." },
          { role: "user", content: "Say hi and identify yourself briefly." },
        ],
        max_tokens: 80,
        temperature: 0.2,
      }),
      signal: controller.signal,
    });
    const ms = Date.now() - start;
    const text = await r.text();
    if (!r.ok) {
      let detail = text.slice(0, 200);
      try { detail = JSON.parse(text).detail || JSON.parse(text).error?.message || detail; } catch {}
      return { ok: false, status: r.status, ms, reason: detail };
    }
    const j = JSON.parse(text);
    const content = j.choices?.[0]?.message?.content || "(empty)";
    return { ok: true, status: 200, ms, text: content.slice(0, 120) };
  } catch (e) {
    return { ok: false, status: 0, ms: Date.now() - start, reason: String(e.message || e) };
  } finally {
    clearTimeout(t);
  }
}

(async () => {
  // serial to stay under rate limits
  const results = [];
  for (const m of MODELS) {
    process.stdout.write(`${m.padEnd(50)} ... `);
    const r = await probe(m);
    const tag = r.ok ? "OK " : "FAIL";
    const note = r.ok ? `${r.ms}ms — ${r.text.replace(/\n/g, " ")}` : `${r.status} — ${r.reason}`;
    console.log(`${tag} ${note}`);
    results.push({ model: m, ...r });
  }
  console.log("\n=== Summary ===");
  console.log(`OK:    ${results.filter((r) => r.ok).length}/${results.length}`);
  console.log(`FAIL:  ${results.filter((r) => !r.ok).length}`);
  console.log("\nWorking:");
  for (const r of results.filter((r) => r.ok)) console.log(`  ${r.model}  (${r.ms}ms)`);
  console.log("\nFailing:");
  for (const r of results.filter((r) => !r.ok)) console.log(`  ${r.model}  ${r.status} ${r.reason}`);
})();

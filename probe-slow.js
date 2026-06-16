// Retest only the previously-aborted large models with a long timeout.
const API_KEY = "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";
const BASE = "https://integrate.api.nvidia.com/v1";

const MODELS = [
  "openai/gpt-oss-120b",
  "minimaxai/minimax-m3",
  "qwen/qwen3.5-122b-a10b",
  "meta/llama-3.1-70b-instruct",
  "nvidia/nemotron-3-ultra-550b-a55b",
];

async function probe(model) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 240000);
  const start = Date.now();
  try {
    const r = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Reply with one short sentence and your name." }],
        max_tokens: 60,
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
    return { ok: true, status: 200, ms, text: (j.choices?.[0]?.message?.content || "").slice(0, 120) };
  } catch (e) {
    return { ok: false, status: 0, ms: Date.now() - start, reason: String(e.message || e) };
  } finally {
    clearTimeout(t);
  }
}

(async () => {
  for (const m of MODELS) {
    process.stdout.write(`${m.padEnd(45)} ... `);
    const r = await probe(m);
    const note = r.ok ? `${r.ms}ms — ${r.text}` : `${r.status} ${r.reason}`;
    console.log(`${r.ok ? "OK " : "FAIL"} ${note}`);
  }
})();

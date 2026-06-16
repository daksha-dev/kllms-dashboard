// Headless API smoke test: exercises every (model × route) combination
// the UI exposes and reports which fail.

const BASE = "http://localhost:3005";
const EMAIL = "dakshasubramanya123@gmail.com";
const PASSWORD = "Kllmisdagoat@123";

const MODELS_TO_TEST = [
  "meta/llama-3.3-70b-instruct",
  "meta/llama-3.1-8b-instruct",
  "meta/llama-3.1-70b-instruct",
  "nvidia/nemotron-mini-4b-instruct",
  "nvidia/nemotron-3-nano-30b-a3b",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
  "nvidia/nemotron-3-super-120b-a12b",
  "nvidia/llama-3.3-nemotron-super-49b-v1.5",
  "moonshotai/kimi-k2.6",
  "qwen/qwen3-next-80b-a3b-instruct",
  "qwen/qwen3.5-397b-a17b",
  "z-ai/glm-5.1",
  "deepseek-ai/deepseek-v4-pro",
  "deepseek-ai/deepseek-v4-flash",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "minimaxai/minimax-m3",
];

async function login() {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const setCookie = r.headers.get("set-cookie") || "";
  const cookie = setCookie.split(";")[0];
  if (!r.ok) throw new Error(`Login failed: ${r.status}`);
  return cookie;
}

async function call(cookie, route, body, timeoutMs = 180000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(`${BASE}${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await r.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 200) }; }
    return { status: r.status, body: json };
  } catch (err) {
    return { status: 0, body: { error: String(err.message || err) } };
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  const cookie = await login();
  console.log(`Logged in.\n`);

  const routes = [
    {
      name: "research",
      body: (m) => ({ name: "Sam Altman", model: m, context: "OpenAI CEO" }),
    },
    {
      name: "questions",
      body: (m) => ({
        guest: "Sam Altman",
        research: "OpenAI CEO, focused on safe AGI development.",
        count: 5,
        durationMin: 30,
        model: m,
      }),
    },
    {
      name: "email-outreach",
      body: (m) => ({
        kind: "outreach",
        guest: "Sam Altman",
        research: "OpenAI CEO, focused on safe AGI development.",
        podcastName: "KLLM",
        reason: "AGI safety is a hugely relevant topic for our student audience.",
        model: m,
      }),
    },
    {
      name: "email-followup",
      body: (m) => ({
        kind: "followup",
        guest: "Sam Altman",
        context: "Great conversation about AI safety and Y Combinator.",
        model: m,
      }),
    },
    {
      name: "iitm-outreach",
      body: (m) => ({
        achievementArea: "GATE toppers",
        angle: "research",
        model: m,
      }),
    },
  ];

  const results = {};
  for (const route of routes) {
    results[route.name] = {};
    for (const m of MODELS_TO_TEST) {
      process.stdout.write(`  ${route.name.padEnd(18)} ${m.padEnd(48)} ... `);
      const start = Date.now();
      const path = route.name.startsWith("email-") ? "/api/email" : `/api/${route.name}`;
      const r = await call(cookie, path, route.body(m));
      const ms = Date.now() - start;
      const ok = r.status === 200 && r.body.text && r.body.text.length > 20;
      const tag = ok ? "OK" : `FAIL(${r.status})`;
      const reason = ok ? `${r.body.text.length} chars` : (r.body.error || JSON.stringify(r.body).slice(0, 120));
      console.log(`${tag} ${ms}ms — ${reason}`);
      results[route.name][m] = { ok, status: r.status, ms, reason };
    }
    console.log();
  }

  console.log("\n=== Summary (passing models per route) ===");
  for (const [route, byModel] of Object.entries(results)) {
    const passing = Object.entries(byModel).filter(([, v]) => v.ok).map(([m]) => m);
    const failing = Object.entries(byModel).filter(([, v]) => !v.ok).map(([m, v]) => `${m} (${v.status})`);
    console.log(`\n${route}:`);
    console.log(`  ✓ ${passing.length ? passing.join(", ") : "(none)"}`);
    if (failing.length) console.log(`  ✗ ${failing.join(", ")}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

"use client";

import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }
      // Hard navigation so the freshly-set session cookie is sent with the GET
      // (soft router.push can race with the RSC render and miss the cookie).
      window.location.assign("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-pink-400 text-white font-display text-2xl shadow-soft mb-3">
            K
          </div>
          <h1 className="font-display text-3xl text-ink-900">KLLM&apos;s Dashboard</h1>
          <p className="text-ink-700/70 mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={submit} className="card p-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email" type="email" autoComplete="email" required
              className="input" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password" type="password" autoComplete="current-password" required
              className="input" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-sm text-pink-500 bg-pink-50 px-3 py-2 rounded-lg">{error}</div>
          )}

          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-ink-700/50 text-center mt-6">
          Private dashboard. Authorized access only.
        </p>
      </div>
    </main>
  );
}

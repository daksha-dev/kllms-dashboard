"use client";

import { useState } from "react";

export default function SettingsPanel({ name, email }: { name: string; email: string }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function changePassword() {
    setMsg(null);
    if (pw.length < 8) return setMsg({ kind: "err", text: "Min 8 characters." });
    if (pw !== pw2) return setMsg({ kind: "err", text: "Passwords don't match." });
    setBusy(true);
    try {
      const r = await fetch("/api/auth/change-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: pw }),
      });
      const data = await r.json();
      if (!r.ok) setMsg({ kind: "err", text: data.error ?? "Failed." });
      else {
        setMsg({ kind: "ok", text: "Password updated." });
        setPw(""); setPw2("");
      }
    } finally { setBusy(false); }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/");
  }

  return (
    <div className="space-y-4">
      <div className="card p-5 space-y-3">
        <h2 className="font-display text-2xl text-ink-900">Account</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={name} disabled />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={email} disabled />
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <div>
          <h2 className="font-display text-2xl text-ink-900">Change password</h2>
          <p className="text-sm text-ink-700/60">
            If you signed in using a temporary seed password, set a real one now.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">New password</label>
            <input type="password" className="input" value={pw} onChange={(e) => setPw(e.target.value)} />
          </div>
          <div>
            <label className="label">Confirm</label>
            <input type="password" className="input" value={pw2} onChange={(e) => setPw2(e.target.value)} />
          </div>
        </div>
        {msg && (
          <div className={`text-sm px-3 py-2 rounded-lg ${msg.kind === "ok" ? "bg-pink-50 text-pink-500" : "bg-pink-50 text-pink-500"}`}>
            {msg.text}
          </div>
        )}
        <div className="flex justify-end">
          <button className="btn-primary" onClick={changePassword} disabled={busy}>
            {busy ? "Saving…" : "Update password"}
          </button>
        </div>
      </div>

      <div className="card p-5">
        <button className="btn-ghost" onClick={logout}>Sign out</button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import ModelPicker from "./ModelPicker";
import Output from "./Output";
import type { ModelId } from "@/lib/models";

export default function ResearchPanel({ model, onModelChange }: { model: ModelId; onModelChange: (m: ModelId) => void }) {
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [pastedProfile, setPastedProfile] = useState("");
  const [text, setText] = useState("");
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null); setText(""); setSources([]);
    try {
      const r = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, context, pastedProfile, model }),
      });
      const data = await r.json();
      if (!r.ok) setError(data.error ?? "Something went wrong.");
      else { setText(data.text); setSources(data.sources ?? []); }
    } catch (e) {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-display text-2xl text-ink-900">Research a guest</h2>
            <p className="text-sm text-ink-700/60">Web search + synthesis. Paste a LinkedIn profile for best results.</p>
          </div>
          <ModelPicker value={model} onChange={onModelChange} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Guest name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aarav Mehta" />
          </div>
          <div>
            <label className="label">Quick context (optional)</label>
            <input className="input" value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g. GATE AIR 12, founder of..." />
          </div>
        </div>

        <div>
          <label className="label">Paste LinkedIn / bio text (optional, big help)</label>
          <textarea
            className="input min-h-[120px]"
            value={pastedProfile}
            onChange={(e) => setPastedProfile(e.target.value)}
            placeholder="Copy the 'About' + 'Experience' section from their LinkedIn and paste it here. AI will use this as the source of truth."
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            className="btn-primary"
            onClick={run}
            disabled={loading || (!name && !pastedProfile)}
          >
            {loading ? "Researching…" : "Research"}
          </button>
        </div>
      </div>

      <Output
        text={text} sources={sources} loading={loading} error={error}
        emptyHint="Results will appear here. Try a name or paste their LinkedIn."
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import ModelPicker from "./ModelPicker";
import Output from "./Output";
import type { ModelId } from "@/lib/models";

export default function IITMPanel({ model, onModelChange }: { model: ModelId; onModelChange: (m: ModelId) => void }) {
  const [area, setArea] = useState("GATE toppers, research papers, hackathon wins, founders");
  const [angle, setAngle] = useState("under-25 achievers, first-gen college students, builders");
  const [text, setText] = useState("");
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null); setText(""); setSources([]);
    try {
      const r = await fetch("/api/iitm-outreach", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achievementArea: area, angle, model }),
      });
      const data = await r.json();
      if (!r.ok) setError(data.error ?? "Failed.");
      else { setText(data.text); setSources(data.sources ?? []); }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-5 space-y-4">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h2 className="font-display text-2xl text-ink-900">IITM BS outreach</h2>
            <p className="text-sm text-ink-700/60">
              Find IITM BS students or alumni with notable achievements — GATE toppers, founders, researchers, award winners.
            </p>
          </div>
          <ModelPicker value={model} onChange={onModelChange} />
        </div>

        <div>
          <label className="label">What kind of achievement are you looking for?</label>
          <input className="input" value={area} onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. GATE toppers, hackathon wins, published papers, startups" />
        </div>
        <div>
          <label className="label">Episode angle (optional)</label>
          <input className="input" value={angle} onChange={(e) => setAngle(e.target.value)} />
        </div>

        <div className="flex justify-end">
          <button className="btn-primary" onClick={run} disabled={loading || !area}>
            {loading ? "Searching…" : "Find students"}
          </button>
        </div>
      </div>

      <Output
        text={text} sources={sources} loading={loading} error={error}
        emptyHint="A list of potential guests will appear here, each with an achievement and a pitch angle."
      />
    </div>
  );
}

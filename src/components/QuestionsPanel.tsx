"use client";

import { useState } from "react";
import ModelPicker from "./ModelPicker";
import Slider from "./Slider";
import Output from "./Output";
import type { ModelId } from "@/lib/models";

export default function QuestionsPanel({ model, onModelChange, initialResearch = "" }: { model: ModelId; onModelChange: (m: ModelId) => void; initialResearch?: string }) {
  const [guest, setGuest] = useState("");
  const [research, setResearch] = useState(initialResearch);
  const [duration, setDuration] = useState(30);
  const [count, setCount] = useState(10);
  const [angle, setAngle] = useState("");
  const [tone, setTone] = useState("curious, warm, thoughtful");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null); setText("");
    try {
      const r = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guest, research, count, durationMin: duration, tone, angle, model }),
      });
      const data = await r.json();
      if (!r.ok) setError(data.error ?? "Failed.");
      else setText(data.text);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-display text-2xl text-ink-900">Generate questions</h2>
            <p className="text-sm text-ink-700/60">Pick a duration, get a question set tailored to your guest.</p>
          </div>
          <ModelPicker value={model} onChange={onModelChange} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Guest name</label>
            <input className="input" value={guest} onChange={(e) => setGuest(e.target.value)} placeholder="Guest's name" />
          </div>
          <div>
            <label className="label">Episode angle (optional)</label>
            <input className="input" value={angle} onChange={(e) => setAngle(e.target.value)} placeholder="e.g. resilience, building in public" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Slider
            label="Episode length" min={10} max={120} step={5} value={duration}
            onChange={setDuration} format={(v) => `${v} min`}
          />
          <Slider
            label="Number of questions" min={3} max={25} step={1} value={count}
            onChange={setCount}
          />
        </div>

        <div>
          <label className="label">Tone</label>
          <input className="input" value={tone} onChange={(e) => setTone(e.target.value)} />
        </div>

        <div>
          <label className="label">Research / notes about the guest</label>
          <textarea
            className="input min-h-[140px]"
            value={research}
            onChange={(e) => setResearch(e.target.value)}
            placeholder="Paste research from the Research tab, or quick notes. The more context, the better the questions."
          />
        </div>

        <div className="flex justify-end">
          <button className="btn-primary" onClick={run} disabled={loading || !guest || !research}>
            {loading ? "Generating…" : "Generate questions"}
          </button>
        </div>
      </div>

      <Output
        text={text} loading={loading} error={error}
        emptyHint="Your questions will appear here."
      />
    </div>
  );
}

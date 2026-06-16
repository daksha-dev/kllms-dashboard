"use client";

import { useState } from "react";
import ModelPicker from "./ModelPicker";
import Output from "./Output";
import type { ModelId } from "@/lib/models";

type Tab = "outreach" | "followup";

export default function EmailPanel({ model, onModelChange }: { model: ModelId; onModelChange: (m: ModelId) => void }) {
  const [tab, setTab] = useState<Tab>("outreach");

  // outreach
  const [guest, setGuest] = useState("");
  const [podcastName, setPodcastName] = useState("Stories of IITM BS");
  const [reason, setReason] = useState("");
  const [tone, setTone] = useState("warm, professional, enthusiastic but not pushy");
  const [research, setResearch] = useState("");

  // followup
  const [fuGuest, setFuGuest] = useState("");
  const [fuContext, setFuContext] = useState("");

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null); setText("");
    try {
      const payload = tab === "outreach"
        ? { kind: "outreach" as const, guest, research, podcastName, reason, tone, model }
        : { kind: "followup" as const, guest: fuGuest, context: fuContext, tone, model };
      const r = await fetch("/api/email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h2 className="font-display text-2xl text-ink-900">Draft an email</h2>
            <p className="text-sm text-ink-700/60">Outreach invites and post-recording follow-ups.</p>
          </div>
          <ModelPicker value={model} onChange={onModelChange} />
        </div>

        <div className="flex gap-2">
          <button className={tab === "outreach" ? "btn-pink" : "btn-ghost"} onClick={() => setTab("outreach")}>
            Outreach invite
          </button>
          <button className={tab === "followup" ? "btn-pink" : "btn-ghost"} onClick={() => setTab("followup")}>
            Follow-up
          </button>
        </div>

        {tab === "outreach" ? (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Guest name</label>
                <input className="input" value={guest} onChange={(e) => setGuest(e.target.value)} />
              </div>
              <div>
                <label className="label">Podcast name</label>
                <input className="input" value={podcastName} onChange={(e) => setPodcastName(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Why this guest?</label>
              <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. They built X while in college and have a unique story" />
            </div>
            <div>
              <label className="label">Research / context (paste from Research tab)</label>
              <textarea className="input min-h-[120px]" value={research} onChange={(e) => setResearch(e.target.value)} />
            </div>
            <div>
              <label className="label">Tone</label>
              <input className="input" value={tone} onChange={(e) => setTone(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label">Guest name</label>
              <input className="input" value={fuGuest} onChange={(e) => setFuGuest(e.target.value)} />
            </div>
            <div>
              <label className="label">What happened in the recording?</label>
              <textarea
                className="input min-h-[140px]" value={fuContext} onChange={(e) => setFuContext(e.target.value)}
                placeholder="Highlights, moments you liked, things you promised to send, etc."
              />
            </div>
            <div>
              <label className="label">Tone</label>
              <input className="input" value={tone} onChange={(e) => setTone(e.target.value)} />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            className="btn-primary"
            onClick={run}
            disabled={loading || (tab === "outreach" ? (!guest || !reason || !research) : (!fuGuest || !fuContext))}
          >
            {loading ? "Drafting…" : "Draft email"}
          </button>
        </div>
      </div>

      <Output
        text={text} loading={loading} error={error}
        emptyHint="Your email draft will appear here. One click to copy."
      />
    </div>
  );
}

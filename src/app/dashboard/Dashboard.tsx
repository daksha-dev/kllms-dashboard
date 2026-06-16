"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ResearchPanel from "@/components/ResearchPanel";
import QuestionsPanel from "@/components/QuestionsPanel";
import EmailPanel from "@/components/EmailPanel";
import IITMPanel from "@/components/IITMPanel";
import SettingsPanel from "@/components/SettingsPanel";
import { defaultModel, type ModelId } from "@/lib/models";

type Tab = "research" | "questions" | "email" | "iitm" | "settings";

const TABS: { id: Tab; label: string; icon: string; sub: string }[] = [
  { id: "research", label: "Research", icon: "🔍", sub: "Deep-dive on a guest" },
  { id: "questions", label: "Questions", icon: "🎙️", sub: "Episode prep" },
  { id: "email", label: "Emails", icon: "✉️", sub: "Outreach & follow-ups" },
  { id: "iitm", label: "IITM BS", icon: "🏆", sub: "Find achievers" },
  { id: "settings", label: "Settings", icon: "⚙️", sub: "Account" },
];

export default function Dashboard({ user }: { user: { id: string; name: string; email: string; preferredModel: string | null } }) {
  const [tab, setTab] = useState<Tab>("research");
  const [model, setModel] = useState<ModelId>((user.preferredModel as ModelId) ?? defaultModel());
  const [savedFlash, setSavedFlash] = useState(false);
  const router = useRouter();

  async function changeModel(m: ModelId) {
    setModel(m);
    setSavedFlash(false);
    const r = await fetch("/api/preferences", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: m }),
    });
    if (r.ok) { setSavedFlash(true); setTimeout(() => setSavedFlash(false), 1200); }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-64 md:min-h-screen bg-white/70 backdrop-blur border-r border-beige-200 p-5 flex md:flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-400 text-white flex items-center justify-center font-display text-xl shadow-soft">K</div>
          <div>
            <p className="font-display text-lg leading-none">KLLM</p>
            <p className="text-xs text-ink-700/60">Podcast dashboard</p>
          </div>
        </div>

        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible md:mt-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition whitespace-nowrap ${
                tab === t.id ? "bg-pink-50 text-pink-500" : "hover:bg-beige-100 text-ink-800"
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              <span>
                <span className="block font-medium leading-tight">{t.label}</span>
                <span className="block text-xs text-ink-700/60">{t.sub}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className="hidden md:block md:mt-auto pt-4 border-t border-beige-200">
          <p className="text-sm font-medium text-ink-900 truncate">{user.name}</p>
          <p className="text-xs text-ink-700/60 truncate">{user.email}</p>
          <button onClick={() => setTab("settings")} className="btn-ghost mt-2 w-full text-sm">Settings</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-5 md:p-8 max-w-5xl w-full mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm text-ink-700/60">Hi {user.name.split(" ")[0]} 👋</p>
            <h1 className="font-display text-3xl text-ink-900">Let&apos;s make a great episode.</h1>
          </div>
          {savedFlash && <span className="chip">✓ Model saved</span>}
        </div>

        {tab === "research" && <ResearchPanel model={model} onModelChange={changeModel} />}
        {tab === "questions" && <QuestionsPanel model={model} onModelChange={changeModel} />}
        {tab === "email" && <EmailPanel model={model} onModelChange={changeModel} />}
        {tab === "iitm" && <IITMPanel model={model} onModelChange={changeModel} />}
        {tab === "settings" && <SettingsPanel name={user.name} email={user.email} />}

        <footer className="mt-10 text-center text-xs text-ink-700/50">
          Built with ♡ · KLLM&apos;s dashboard
        </footer>
      </main>
    </div>
  );
}

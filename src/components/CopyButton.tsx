"use client";

import { useState } from "react";

export default function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 1500); } finally {
        document.body.removeChild(ta);
      }
    }
  }
  return (
    <button onClick={copy} className={copied ? "btn-pink" : "btn-ghost"} aria-live="polite">
      {copied ? "✓ Copied!" : label}
    </button>
  );
}

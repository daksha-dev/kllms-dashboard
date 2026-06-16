"use client";

import { MODELS, type ModelId } from "@/lib/models";
import { useEffect, useState } from "react";

export default function ModelPicker({
  value, onChange,
}: { value: ModelId; onChange: (m: ModelId) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-ink-700/70">Model</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ModelId)}
        className="bg-white border border-beige-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
      >
        {MODELS.map((m) => (
          <option key={m.id} value={m.id}>{m.label}</option>
        ))}
      </select>
    </div>
  );
}

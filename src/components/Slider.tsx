"use client";

export default function Slider({
  label, min, max, step = 1, value, onChange, format,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <label className="label mb-0">{label}</label>
        <span className="text-pink-500 font-medium">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-pink-400"
      />
      <div className="flex justify-between text-xs text-ink-700/50 mt-1">
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  );
}

export type ModelId =
  | "gemini-2.0-flash"
  | "gemini-2.0-flash-exp"
  | "gemini-1.5-pro"
  | "gemini-1.5-flash";

export const MODELS: { id: ModelId; label: string; description: string }[] = [
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", description: "Fast, cheap, great for drafts" },
  { id: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash (Experimental)", description: "Newest features" },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", description: "Strongest reasoning, slower" },
  { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", description: "Reliable fallback" },
];

export const DEFAULT_MODEL: ModelId = "gemini-2.0-flash";

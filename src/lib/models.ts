export type ModelId =
  | "gemini-2.5-flash"
  | "gemini-2.5-pro"
  | "gemini-2.0-flash"
  | "gemini-2.0-flash-lite"
  | "gemini-flash-latest"
  | "gemini-flash-lite-latest"
  | "gemini-pro-latest";

export const MODELS: { id: ModelId; label: string; description: string }[] = [
  { id: "gemini-flash-latest", label: "Gemini Flash (latest)", description: "Auto-routes to newest Flash" },
  { id: "gemini-pro-latest", label: "Gemini Pro (latest)", description: "Auto-routes to strongest model" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", description: "Fast, great quality" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", description: "Strongest reasoning, slower" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", description: "Fast, cheap, great for drafts" },
  { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite", description: "Lightest, fastest" },
  { id: "gemini-flash-lite-latest", label: "Gemini Flash Lite (latest)", description: "Auto-routes to newest Lite" },
];

export const DEFAULT_MODEL: ModelId = "gemini-flash-latest";

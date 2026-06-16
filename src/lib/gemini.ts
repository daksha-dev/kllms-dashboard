/**
 * @deprecated Use `@/lib/llm` instead. This re-export is kept for one release
 * to avoid breaking external scripts that import from this path.
 */
export { generate } from "./llm";
export type { GenOptions, GenResult } from "./llm";

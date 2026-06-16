import { env } from "./env";

export type SearchHit = { title: string; url: string; snippet: string };

/**
 * Try Tavily first (best for research), then SerpAPI. Used as a fallback
 * when Gemini grounding isn't enough or is unavailable.
 */
export async function webSearch(query: string, maxResults = 8): Promise<SearchHit[]> {
  const e = env();

  if (e.TAVILY_API_KEY) {
    try {
      const r = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: e.TAVILY_API_KEY,
          query,
          max_results: maxResults,
          search_depth: "advanced",
          include_answer: false,
        }),
      });
      if (r.ok) {
        const data = (await r.json()) as { results?: SearchHit[] };
        return data.results ?? [];
      }
    } catch (err) {
      console.error("tavily failed", err);
    }
  }

  if (e.SERPAPI_API_KEY) {
    try {
      const url = new URL("https://serpapi.com/search.json");
      url.searchParams.set("q", query);
      url.searchParams.set("api_key", e.SERPAPI_API_KEY);
      url.searchParams.set("num", String(maxResults));
      const r = await fetch(url.toString());
      if (r.ok) {
        const data = (await r.json()) as {
          organic_results?: { title: string; link: string; snippet?: string }[];
        };
        return (data.organic_results ?? []).map((o) => ({
          title: o.title,
          url: o.link,
          snippet: o.snippet ?? "",
        }));
      }
    } catch (err) {
      console.error("serpapi failed", err);
    }
  }

  return [];
}

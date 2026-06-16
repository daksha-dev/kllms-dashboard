export const PODCAST_HOST_CONTEXT = `
You are helping a podcast host (intern at IIT Madras, hosting a podcast for the IITM BS Degree programme).
She interviews students, researchers, founders, and achievers. Her tone is warm, curious, friendly.
Keep outputs in first-person-ready prose she can paste / read aloud / email directly.
Avoid corporate jargon. Be specific, not generic.
`;

export function researchPrompt(name: string, context?: string) {
  return `
${PODCAST_HOST_CONTEXT}

Research the following person for a podcast interview:
Name: ${name}
${context ? `Extra context from user:\n${context}` : ""}

Using the latest web information, produce:
1. **Bio snapshot** (3-4 sentences)
2. **Notable achievements** (bullets, with year and source if known)
3. **Background** (education, current role, prior roles)
4. **Public presence** (LinkedIn, Twitter/X, website, notable talks, press)
5. **Why they'd be a great guest** (1-2 sentences from the host's perspective)
6. **Risky / sensitive topics to avoid or handle carefully**
7. **5 fun facts / anecdotes** to break the ice

Cite sources inline as [title](url) where possible.
`.trim();
}

export function questionPrompt(opts: {
  guest: string;
  research: string;
  count: number;
  durationMin: number;
  tone: string;
  angle?: string;
}) {
  return `
${PODCAST_HOST_CONTEXT}

Generate ${opts.count} podcast questions for a ${opts.durationMin}-minute episode.

Guest: ${opts.guest}
${opts.angle ? `Episode angle: ${opts.angle}` : ""}
Tone: ${opts.tone}

Use the research below to make questions specific, not generic.

---
${opts.research}
---

Return a numbered list. For each question include:
- The question itself
- 1-line "intent" (what the question is trying to surface — helps the host steer)
- Optional 1-line "follow-up" if the guest gives a short answer

Mix opener, deep, vulnerable, fun, and closing questions.
`.trim();
}

export function outreachEmailPrompt(opts: {
  guest: string;
  research: string;
  podcastName: string;
  reason: string;
  tone?: string;
}) {
  return `
${PODCAST_HOST_CONTEXT}

Draft a podcast outreach email to ${opts.guest} inviting them to be a guest on "${opts.podcastName}".

Why we want them: ${opts.reason}
Tone: ${opts.tone ?? "warm, professional, enthusiastic but not pushy"}

Use the research below to personalise — reference 1-2 specific things they've done.

---
${opts.research}
---

Structure:
- Subject line (catchy, short)
- 1-2 line opener (warm, personal)
- 2-3 short paragraphs: who we are, why them specifically, what the episode would look like
- Clear ask + 2-3 time-slot suggestions
- Friendly sign-off

Make it short. People skim. Under 180 words.
`.trim();
}

export function followupEmailPrompt(opts: {
  guest: string;
  context: string;
  tone?: string;
}) {
  return `
${PODCAST_HOST_CONTEXT}

Draft a follow-up email for a podcast host.

Guest: ${opts.guest}
Context: ${opts.context}
Tone: ${opts.tone ?? "warm, appreciative, brief"}

Structure:
- Thank them
- 1-2 specific moments from the conversation (placeholders if not provided)
- 2 sentences on what to expect next
- Sign-off

Under 120 words.
`.trim();
}

export function iitmOutreachPrompt(opts: {
  achievementArea: string;
  angle: string;
  searchBlock?: string;
}) {
  return `
${PODCAST_HOST_CONTEXT}

Find me 5 IITM BS Degree students or alumni who've done something notable in: ${opts.achievementArea}.

For each person return:
- Name
- Year / level in BS programme (Foundation / Diploma / Degree / Alumni)
- 1-line bio
- Specific achievement (cite source URL)
- 1-line podcast pitch angle

${opts.angle ? `Episode angle: ${opts.angle}` : ""}

Prefer students with verifiable public achievements (GATE, hackathons, research papers, founder news, awards).

${
  opts.searchBlock
    ? `Use the following fresh web results to find candidates. Cite source URLs inline:\n\n${opts.searchBlock}`
    : "If no candidates can be found, say so honestly rather than inventing names."
}
`.trim();
}

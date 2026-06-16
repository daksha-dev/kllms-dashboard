"use client";

import CopyButton from "./CopyButton";
import DownloadPdfButton from "./DownloadPdfButton";

export default function Output({
  text, sources, loading, error, emptyHint, pdfTitle, pdfFilename,
}: {
  text: string;
  sources?: { title: string; url: string }[];
  loading: boolean;
  error?: string | null;
  emptyHint?: string;
  pdfTitle?: string;
  pdfFilename?: string;
}) {
  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-4 bg-beige-200 rounded w-1/3 mb-3" />
        <div className="h-3 bg-beige-100 rounded w-full mb-2" />
        <div className="h-3 bg-beige-100 rounded w-5/6 mb-2" />
        <div className="h-3 bg-beige-100 rounded w-4/6" />
        <p className="text-sm text-ink-700/50 mt-4">Thinking…</p>
      </div>
    );
  }
  if (error) {
    return <div className="card p-4 text-pink-500 bg-pink-50">{error}</div>;
  }
  if (!text) {
    return emptyHint ? (
      <div className="card p-6 text-ink-700/60 text-sm">{emptyHint}</div>
    ) : null;
  }
  return (
    <div className="card p-5 space-y-4">
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-display text-lg text-ink-900">Result</h3>
        <div className="flex gap-2">
          {pdfTitle && <DownloadPdfButton text={text} title={pdfTitle} filename={pdfFilename ?? "questions.pdf"} />}
          <CopyButton text={text} />
        </div>
      </div>
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-800">{text}</pre>
      {sources && sources.length > 0 && (
        <div>
          <p className="text-xs font-medium text-ink-700/60 mb-1.5">Sources</p>
          <ul className="space-y-1">
            {sources.map((s, i) => (
              <li key={i} className="text-xs">
                <a href={s.url} target="_blank" rel="noreferrer" className="text-pink-500 hover:underline break-all">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

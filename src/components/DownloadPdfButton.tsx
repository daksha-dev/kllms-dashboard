"use client";

import { jsPDF } from "jspdf";

export default function DownloadPdfButton({
  text,
  filename = "document.pdf",
  title,
}: {
  text: string;
  filename?: string;
  title?: string;
}) {
  function onClick() {
    const doc = new jsPDF({
      unit: "pt",
      format: "letter",
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 54;
    const maxWidth = pageWidth - margin * 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    let y = margin;
    if (title) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      const titleLines = doc.splitTextToSize(title, maxWidth);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 20 + 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
    }

    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      const wrapped = line.length === 0 ? [""] : doc.splitTextToSize(line, maxWidth);
      for (const wl of wrapped) {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(wl, margin, y);
        y += 14;
      }
    }

    doc.save(filename);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-ghost text-sm"
    >
      Download as PDF
    </button>
  );
}

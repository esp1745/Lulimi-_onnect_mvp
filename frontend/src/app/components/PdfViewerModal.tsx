import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink, Download, FileText } from "lucide-react";
import { Button } from "./ui/button";

/**
 * Opens a PDF in place rather than throwing the reader into a new tab and
 * losing their place. Rendered through a portal to <body>, since the sticky
 * header's backdrop-blur is a containing block for fixed positioning.
 */
export function PdfViewerModal({
  url,
  title,
  onClose,
}: {
  url: string;
  title: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Stop the page behind from scrolling while the viewer is open.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1A3A35]/50 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#1A3A35]/10 px-5 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-[#C4622D]" />
            <h2 className="truncate font-bold text-[#1A3A35]">{title}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <a href={url} target="_blank" rel="noopener noreferrer" title="Open in a new tab">
              <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs text-gray-500 hover:text-[#1A3A35]">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New tab</span>
              </Button>
            </a>
            <a href={url} download title="Download">
              <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs text-gray-500 hover:text-[#1A3A35]">
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close PDF"
              className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-[#1A3A35]/5 hover:text-[#1A3A35]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* A browser that can't render PDFs inline shows the fallback link. */}
        <object data={url} type="application/pdf" className="min-h-0 flex-1 bg-[#F5F0E8]">
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-sm text-gray-500">This browser can&apos;t show PDFs inline.</p>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="rounded-full bg-[#C4622D] text-white hover:bg-[#7A2E1A]">
                Open the PDF
              </Button>
            </a>
          </div>
        </object>
      </div>
    </div>,
    document.body
  );
}

/** Tracks which PDF is open, so a page can wire up the viewer in two lines. */
export function usePdfViewer() {
  const [pdf, setPdf] = useState<{ url: string; title: string } | null>(null);
  return {
    openPdf: (url: string, title: string) => setPdf({ url, title }),
    pdfViewer: pdf ? <PdfViewerModal url={pdf.url} title={pdf.title} onClose={() => setPdf(null)} /> : null,
  };
}

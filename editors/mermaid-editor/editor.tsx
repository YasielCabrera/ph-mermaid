import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import { useCallback, useEffect, useRef, useState } from "react";
import { actions, useSelectedMermaidDocument } from "document-models/mermaid";
import { MonacoPane } from "./components/monaco-pane.js";
import { MermaidPreview } from "./components/mermaid-preview.js";
import { useDebouncedValue } from "./hooks/use-debounced-value.js";

const DEBOUNCE_MS = 400;
const MIN_PANE_RATIO = 0.15;
const MAX_PANE_RATIO = 0.85;

export default function Editor() {
  const [document, dispatch] = useSelectedMermaidDocument();
  const storedSource = document.state.global.mermaid;

  const [draft, setDraft] = useState(storedSource);
  const debouncedDraft = useDebouncedValue(draft, DEBOUNCE_MS);

  useEffect(() => {
    if (storedSource !== draft) {
      setDraft(storedSource);
    }
  }, [storedSource]);

  useEffect(() => {
    if (debouncedDraft !== storedSource) {
      dispatch(actions.setMermaid({ mermaid: debouncedDraft }));
    }
  }, [debouncedDraft, storedSource, dispatch]);

  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const [sourceRatio, setSourceRatio] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;

    function onMove(event: MouseEvent) {
      const container = splitContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const ratio = (event.clientX - rect.left) / rect.width;
      const clamped = Math.min(MAX_PANE_RATIO, Math.max(MIN_PANE_RATIO, ratio));
      setSourceRatio(clamped);
    }

    function onUp() {
      setIsDragging(false);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  const startDrag = useCallback(() => setIsDragging(true), []);
  const resetSplit = useCallback(() => setSourceRatio(0.5), []);

  const sourcePercent = `${(sourceRatio * 100).toFixed(2)}%`;
  const previewPercent = `${((1 - sourceRatio) * 100).toFixed(2)}%`;

  return (
    <div className="flex h-full w-full flex-col">
      <DocumentToolbar />
      <div
        ref={splitContainerRef}
        className="flex min-h-0 flex-1 border-t border-gray-200"
        style={{ cursor: isDragging ? "col-resize" : undefined }}
      >
        <div
          className="flex flex-col"
          style={{ width: sourcePercent, minWidth: 0 }}
        >
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            Source
          </div>
          <div className="min-h-0 flex-1">
            <MonacoPane value={draft} onChange={setDraft} />
          </div>
        </div>
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize source pane"
          onMouseDown={startDrag}
          onDoubleClick={resetSplit}
          className={`relative w-1 shrink-0 cursor-col-resize bg-gray-200 transition-colors hover:bg-blue-400 ${
            isDragging ? "bg-blue-500" : ""
          }`}
          title="Drag to resize · double-click to reset"
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
        </div>
        <div
          className="flex flex-col"
          style={{ width: previewPercent, minWidth: 0 }}
        >
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            Preview
          </div>
          <div className="min-h-0 flex-1">
            <MermaidPreview source={debouncedDraft} />
          </div>
        </div>
      </div>
    </div>
  );
}

import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import { Sparkles, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { actions, useSelectedMermaidDocument } from "document-models/mermaid";
import { ChatPane } from "./components/chat-pane.js";
import { MonacoPane } from "./components/monaco-pane.js";
import { MermaidPreview } from "./components/mermaid-preview.js";
import { useDebouncedValue } from "./hooks/use-debounced-value.js";

const DEBOUNCE_MS = 400;
const MIN_PANE_RATIO = 0.15;
const MAX_PANE_RATIO = 0.85;

const DEFAULT_SOURCE_WIDTH_PX = 570;
const DEFAULT_SOURCE_RATIO = 0.5;
const DEFAULT_OPEN_FIRST = 1 / 3;
const DEFAULT_OPEN_SECOND = 2 / 3;

type DragTarget = "first" | "second";

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

  const [chatOpen, setChatOpen] = useState(false);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const [firstRatio, setFirstRatio] = useState(DEFAULT_SOURCE_RATIO);
  const [secondRatio, setSecondRatio] = useState(DEFAULT_OPEN_SECOND);
  const [dragging, setDragging] = useState<DragTarget | null>(null);
  const initialWidthAppliedRef = useRef(false);

  useLayoutEffect(() => {
    if (initialWidthAppliedRef.current) return;
    const container = splitContainerRef.current;
    if (!container) return;
    const width = container.getBoundingClientRect().width;
    if (width <= 0) return;
    const ratio = DEFAULT_SOURCE_WIDTH_PX / width;
    const clamped = Math.min(MAX_PANE_RATIO, Math.max(MIN_PANE_RATIO, ratio));
    setFirstRatio(clamped);
    initialWidthAppliedRef.current = true;
  }, []);

  useEffect(() => {
    if (!dragging) return;

    function onMove(event: MouseEvent) {
      const container = splitContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const ratio = (event.clientX - rect.left) / rect.width;
      const clamped = Math.min(MAX_PANE_RATIO, Math.max(MIN_PANE_RATIO, ratio));
      if (dragging === "first") {
        if (chatOpen) {
          const maxFirst = secondRatio - MIN_PANE_RATIO;
          setFirstRatio(Math.min(Math.max(clamped, MIN_PANE_RATIO), maxFirst));
        } else {
          setFirstRatio(clamped);
        }
      } else {
        const minSecond = firstRatio + MIN_PANE_RATIO;
        const maxSecond = 1 - MIN_PANE_RATIO;
        setSecondRatio(Math.min(Math.max(clamped, minSecond), maxSecond));
      }
    }

    function onUp() {
      setDragging(null);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [chatOpen, dragging, firstRatio, secondRatio]);

  const startDrag = useCallback(
    (target: DragTarget) => () => setDragging(target),
    [],
  );
  const resetFirst = useCallback(
    () => setFirstRatio(chatOpen ? DEFAULT_OPEN_FIRST : DEFAULT_SOURCE_RATIO),
    [chatOpen],
  );
  const resetSecond = useCallback(
    () => setSecondRatio(DEFAULT_OPEN_SECOND),
    [],
  );

  const openChat = useCallback(() => {
    setFirstRatio(DEFAULT_OPEN_FIRST);
    setSecondRatio(DEFAULT_OPEN_SECOND);
    setChatOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setFirstRatio(DEFAULT_SOURCE_RATIO);
    setSecondRatio(DEFAULT_OPEN_SECOND);
    setChatOpen(false);
  }, []);

  const sourcePercent = `${(firstRatio * 100).toFixed(2)}%`;
  const previewPercent = `${(((chatOpen ? secondRatio : 1) - firstRatio) * 100).toFixed(2)}%`;
  const chatPercent = `${((1 - secondRatio) * 100).toFixed(2)}%`;

  const cursorStyle = dragging ? "col-resize" : undefined;

  return (
    <div className="flex h-full w-full flex-col">
      <DocumentToolbar />
      <div
        ref={splitContainerRef}
        className="flex min-h-0 flex-1 border-t border-gray-200"
        style={{ cursor: cursorStyle }}
      >
        <div
          className="flex flex-col"
          style={{ width: sourcePercent, minWidth: 0 }}
        >
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <span>Source</span>
            <button
              type="button"
              onClick={chatOpen ? closeChat : openChat}
              aria-label={chatOpen ? "Close Claude chat" : "Open Claude chat"}
              aria-pressed={chatOpen}
              title={chatOpen ? "Close Claude chat" : "Chat with Claude"}
              className={`inline-flex h-6 w-6 items-center justify-center rounded transition-colors ${
                chatOpen
                  ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <MonacoPane value={draft} onChange={setDraft} />
          </div>
        </div>
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize source pane"
          onMouseDown={startDrag("first")}
          onDoubleClick={resetFirst}
          className={`relative w-1 shrink-0 cursor-col-resize bg-gray-200 transition-colors hover:bg-blue-400 ${
            dragging === "first" ? "bg-blue-500" : ""
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
        {chatOpen ? (
          <>
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize chat pane"
              onMouseDown={startDrag("second")}
              onDoubleClick={resetSecond}
              className={`relative w-1 shrink-0 cursor-col-resize bg-gray-200 transition-colors hover:bg-blue-400 ${
                dragging === "second" ? "bg-blue-500" : ""
              }`}
              title="Drag to resize · double-click to reset"
            >
              <div className="absolute inset-y-0 -left-1 -right-1" />
            </div>
            <div
              className="flex min-h-0 flex-col overflow-hidden"
              style={{ width: chatPercent, minWidth: 0 }}
            >
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                <span>Chat</span>
                <button
                  type="button"
                  onClick={closeChat}
                  aria-label="Close Claude chat"
                  title="Close chat"
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="relative min-h-0 flex-1">
                <div className="absolute inset-0">
                  <ChatPane
                    mermaidSource={debouncedDraft}
                    onApplyEdit={setDraft}
                  />
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

import { Download, Maximize2, Minimize2 } from "lucide-react";
import mermaid from "mermaid";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";

mermaid.initialize({
  startOnLoad: false,
  securityLevel: "loose",
  theme: "default",
});

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 8;
const ZOOM_STEP = 1.2;
const WHEEL_ZOOM_RATE = 0.0015;
const FIT_PADDING = 32;
const PNG_EXPORT_SCALE = 2;

type MermaidPreviewProps = {
  source: string;
};

type Transform = { tx: number; ty: number; scale: number };

const IDENTITY_TRANSFORM: Transform = { tx: 0, ty: 0, scale: 1 };

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

// Mermaid renders the SVG with `width="100%"` and a `max-width` style. That
// works when the parent has an explicit width, but our content div is sized
// to its content (it's the transformed pan/zoom layer), so `100%` collapses
// to 0. Replace the sizing with the SVG's natural viewBox dimensions so the
// content div takes a real size we can fit and pan around.
function normalizeSvgSize(host: HTMLDivElement) {
  const svg = host.querySelector("svg");
  if (!svg) return null;
  const viewBox = svg.viewBox.baseVal;
  const width = viewBox.width > 0 ? viewBox.width : svg.getBBox().width;
  const height = viewBox.height > 0 ? viewBox.height : svg.getBBox().height;
  if (width <= 0 || height <= 0) return null;
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.style.maxWidth = "none";
  svg.style.display = "block";
  return { width, height };
}

export function MermaidPreview({ source }: MermaidPreviewProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const baseId = useId().replace(/:/g, "-");
  const renderCountRef = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [transform, setTransform] = useState<Transform>(IDENTITY_TRANSFORM);
  const userInteractedRef = useRef(false);
  const panStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originTx: number;
    originTy: number;
  } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fitToViewport = useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;
    const svg = content.querySelector("svg");
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    // Read intrinsic size from the SVG attributes set by normalizeSvgSize.
    const naturalW = Number(svg.getAttribute("width")) || rect.width;
    const naturalH = Number(svg.getAttribute("height")) || rect.height;
    if (naturalW <= 0 || naturalH <= 0) return;
    const viewportW = viewport.clientWidth - FIT_PADDING * 2;
    const viewportH = viewport.clientHeight - FIT_PADDING * 2;
    if (viewportW <= 0 || viewportH <= 0) return;
    const scale = clampZoom(
      Math.min(viewportW / naturalW, viewportH / naturalH, 1),
    );
    const tx = (viewport.clientWidth - naturalW * scale) / 2;
    const ty = (viewport.clientHeight - naturalH * scale) / 2;
    setTransform({ tx, ty, scale });
  }, []);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    if (source.trim() === "") {
      container.innerHTML = "";
      setError(null);
      return;
    }

    const state = { cancelled: false };
    renderCountRef.current += 1;
    const id = `mermaid-${baseId}-${renderCountRef.current}`;

    void (async () => {
      try {
        await mermaid.parse(source);
        const { svg, bindFunctions } = await mermaid.render(id, source);
        if (state.cancelled || !contentRef.current) return;
        contentRef.current.innerHTML = svg;
        bindFunctions?.(contentRef.current);
        normalizeSvgSize(contentRef.current);
        setError(null);
        // Only auto-fit while the user hasn't moved the view themselves —
        // otherwise edits would yank their viewport back.
        if (!userInteractedRef.current) {
          fitToViewport();
        }
      } catch (err) {
        if (state.cancelled) return;
        if (contentRef.current) contentRef.current.innerHTML = "";
        setError(err instanceof Error ? err.message : String(err));
      }
    })();

    return () => {
      state.cancelled = true;
    };
  }, [source, baseId, fitToViewport]);

  // Reset everything when the source goes empty so a fresh diagram re-fits.
  useEffect(() => {
    if (source.trim() === "") {
      userInteractedRef.current = false;
      setTransform(IDENTITY_TRANSFORM);
    }
  }, [source]);

  const zoomAroundCenter = useCallback((step: number) => {
    userInteractedRef.current = true;
    const viewport = viewportRef.current;
    const cx = viewport ? viewport.clientWidth / 2 : 0;
    const cy = viewport ? viewport.clientHeight / 2 : 0;
    setTransform((prev) => {
      const clamped = clampZoom(prev.scale * step);
      if (clamped === prev.scale) return prev;
      const ratio = clamped / prev.scale;
      return {
        scale: clamped,
        tx: cx - (cx - prev.tx) * ratio,
        ty: cy - (cy - prev.ty) * ratio,
      };
    });
  }, []);

  const zoomIn = useCallback(
    () => zoomAroundCenter(ZOOM_STEP),
    [zoomAroundCenter],
  );
  const zoomOut = useCallback(
    () => zoomAroundCenter(1 / ZOOM_STEP),
    [zoomAroundCenter],
  );

  const resetView = useCallback(() => {
    userInteractedRef.current = false;
    fitToViewport();
  }, [fitToViewport]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Re-fit after the viewport actually resizes into / out of the overlay.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      userInteractedRef.current = false;
      fitToViewport();
    });
    return () => cancelAnimationFrame(frame);
  }, [isFullscreen, fitToViewport]);

  // Escape exits the overlay, matching the browser fullscreen affordance.
  useEffect(() => {
    if (!isFullscreen) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setIsFullscreen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [isFullscreen]);

  const downloadPng = useCallback(async () => {
    const content = contentRef.current;
    if (!content) return;
    const svg = content.querySelector("svg");
    if (!svg) return;

    // Prefer the viewBox over rendered width/height — mermaid sometimes leaves
    // width/height attributes as percentages, and getBoundingClientRect on the
    // transformed parent reflects the scaled size, not the natural one.
    const viewBox = svg.viewBox.baseVal;
    const bbox = svg.getBoundingClientRect();
    const attrW = Number(svg.getAttribute("width"));
    const attrH = Number(svg.getAttribute("height"));
    const width =
      (viewBox.width > 0 ? viewBox.width : 0) ||
      (Number.isFinite(attrW) && attrW > 0 ? attrW : 0) ||
      bbox.width;
    const height =
      (viewBox.height > 0 ? viewBox.height : 0) ||
      (Number.isFinite(attrH) && attrH > 0 ? attrH : 0) ||
      bbox.height;
    if (width <= 0 || height <= 0) return;

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    // Force fixed pixel dimensions on the clone so the rasterizer doesn't have
    // to guess from a transformed/percentage layout.
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));
    clone.style.maxWidth = "none";
    clone.style.background = "#ffffff";

    // Wait for fonts so glyphs measured at render time also render to canvas.
    try {
      await window.document.fonts.ready;
    } catch {
      // Non-fatal: continue without waiting.
    }

    const svgString = new XMLSerializer().serializeToString(clone);
    // Base64 data URL is more reliable across browsers than blob URLs for
    // rasterizing SVGs that contain <foreignObject> or <style> blocks.
    const utf8 = new TextEncoder().encode(svgString);
    let binary = "";
    for (let i = 0; i < utf8.length; i += 1) {
      binary += String.fromCharCode(utf8[i]);
    }
    const dataUrl = `data:image/svg+xml;base64,${window.btoa(binary)}`;

    const image = new Image();
    image.decoding = "sync";
    try {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () =>
          reject(new Error("Failed to load diagram SVG for export"));
        image.src = dataUrl;
      });
    } catch (err) {
      console.error("[mermaid] PNG export failed:", err);
      return;
    }

    const canvas = window.document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * PNG_EXPORT_SCALE));
    canvas.height = Math.max(1, Math.round(height * PNG_EXPORT_SCALE));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob: Blob | null = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/png");
    });
    if (!blob) {
      console.error("[mermaid] PNG export failed: canvas.toBlob returned null");
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = "mermaid-diagram.png";
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, []);

  // Attach the wheel listener manually with { passive: false } — React's
  // synthetic onWheel is passive by default and would log a console error
  // when we call preventDefault().
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    function handleWheel(event: WheelEvent) {
      const target = viewportRef.current;
      if (!target) return;
      event.preventDefault();
      userInteractedRef.current = true;
      const rect = target.getBoundingClientRect();
      const originX = event.clientX - rect.left;
      const originY = event.clientY - rect.top;
      const factor = Math.exp(-event.deltaY * WHEEL_ZOOM_RATE);
      setTransform((prev) => {
        const clamped = clampZoom(prev.scale * factor);
        if (clamped === prev.scale) return prev;
        const ratio = clamped / prev.scale;
        return {
          scale: clamped,
          tx: originX - (originX - prev.tx) * ratio,
          ty: originY - (originY - prev.ty) * ratio,
        };
      });
    }

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const onPointerDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement;
      // Skip pan when the user clicks on UI controls or a diagram link —
      // capturing the pointer would steal the click from the button.
      if (
        target.closest("button, a, input, select, textarea, [role='button']")
      ) {
        return;
      }
      const viewport = viewportRef.current;
      if (!viewport) return;
      const pointerId = (event as unknown as { pointerId: number }).pointerId;
      viewport.setPointerCapture(pointerId);
      panStateRef.current = {
        pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originTx: transform.tx,
        originTy: transform.ty,
      };
      userInteractedRef.current = true;
      setIsPanning(true);
    },
    [transform.tx, transform.ty],
  );

  const onPointerMove = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const pan = panStateRef.current;
      if (!pan) return;
      const dx = event.clientX - pan.startX;
      const dy = event.clientY - pan.startY;
      setTransform((prev) => ({
        ...prev,
        tx: pan.originTx + dx,
        ty: pan.originTy + dy,
      }));
    },
    [],
  );

  const endPan = useCallback(() => {
    const pan = panStateRef.current;
    if (!pan) return;
    const viewport = viewportRef.current;
    if (viewport && viewport.hasPointerCapture(pan.pointerId)) {
      viewport.releasePointerCapture(pan.pointerId);
    }
    panStateRef.current = null;
    setIsPanning(false);
  }, []);

  if (source.trim() === "") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50 text-sm text-gray-400">
        Type a diagram on the left to see a preview.
      </div>
    );
  }

  const zoomPercent = `${Math.round(transform.scale * 100)}%`;

  return (
    <div
      ref={viewportRef}
      className={
        isFullscreen
          ? "fixed inset-0 z-50 overflow-hidden bg-white select-none"
          : "relative h-full w-full overflow-hidden bg-white select-none"
      }
      style={{ cursor: isPanning ? "grabbing" : "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPan}
      onPointerCancel={endPan}
      onDoubleClick={resetView}
    >
      <div
        ref={contentRef}
        className="mermaid-preview-target absolute left-0 top-0"
        style={{
          transform: `translate(${transform.tx}px, ${transform.ty}px) scale(${transform.scale})`,
          transformOrigin: "0 0",
          willChange: "transform",
        }}
      />
      <div className="pointer-events-none absolute right-3 top-3 z-10 flex justify-end">
        <div className="pointer-events-auto flex items-center gap-1 rounded-md border border-gray-200 bg-white/95 px-1.5 py-1 text-xs shadow-sm backdrop-blur">
          <button
            type="button"
            onClick={zoomOut}
            disabled={transform.scale <= MIN_ZOOM + 0.001}
            className="rounded px-2 py-0.5 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
            aria-label="Zoom out"
            title="Zoom out (scroll)"
          >
            −
          </button>
          <button
            type="button"
            onClick={resetView}
            className="min-w-[3.25rem] rounded px-2 py-0.5 font-mono text-gray-700 hover:bg-gray-100"
            aria-label="Fit to view"
            title="Fit to view (double-click)"
          >
            {zoomPercent}
          </button>
          <button
            type="button"
            onClick={zoomIn}
            disabled={transform.scale >= MAX_ZOOM - 0.001}
            className="rounded px-2 py-0.5 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
            aria-label="Zoom in"
            title="Zoom in (scroll)"
          >
            +
          </button>
          <span className="mx-0.5 h-4 w-px bg-gray-200" aria-hidden="true" />
          <button
            type="button"
            onClick={resetView}
            className="flex items-center rounded px-2 py-0.5 text-gray-700 hover:bg-gray-100"
            aria-label="Fit to screen"
            title="Fit to screen (double-click canvas)"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 9V5a2 2 0 0 1 2-2h4" />
              <path d="M21 9V5a2 2 0 0 0-2-2h-4" />
              <path d="M3 15v4a2 2 0 0 0 2 2h4" />
              <path d="M21 15v4a2 2 0 0 1-2 2h-4" />
            </svg>
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center rounded px-2 py-0.5 text-gray-700 hover:bg-gray-100"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            aria-pressed={isFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="size-3.5" aria-hidden="true" />
            ) : (
              <Maximize2 className="size-3.5" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => void downloadPng()}
            className="flex items-center rounded px-2 py-0.5 text-gray-700 hover:bg-gray-100"
            aria-label="Download as PNG"
            title="Download as PNG"
          >
            <Download className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
      {error && (
        <div className="absolute inset-x-4 bottom-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 shadow-sm">
          <div className="mb-1 font-semibold">Mermaid parse error</div>
          <pre className="whitespace-pre-wrap break-words">{error}</pre>
        </div>
      )}
    </div>
  );
}

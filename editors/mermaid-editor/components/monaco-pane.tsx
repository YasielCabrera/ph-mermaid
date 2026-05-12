import { Editor, loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useCallback, useEffect, useState } from "react";
import {
  MERMAID_LANGUAGE_ID,
  registerMermaidLanguage,
} from "./mermaid-language.js";

type MonacoPaneProps = {
  value: string;
  onChange: (value: string) => void;
  language?: string;
};

let loaderConfigured = false;
function configureLoaderOnce() {
  if (loaderConfigured) return;
  loaderConfigured = true;
  // Use the bundled monaco-editor instead of fetching from CDN.
  // The CDN loader hangs in the Connect/Vetra runtime, leaving the editor
  // stuck on "Loading...".
  loader.config({ monaco });
  // Stub workers — for plain markdown editing we don't need language services,
  // and an unstubbed MonacoEnvironment throws because it tries to fetch worker
  // bundles from a path that doesn't exist in this runtime.
  const env = (globalThis as { MonacoEnvironment?: unknown }).MonacoEnvironment;
  if (!env) {
    (
      globalThis as { MonacoEnvironment?: { getWorker: () => Worker } }
    ).MonacoEnvironment = {
      getWorker: () =>
        new Worker(
          URL.createObjectURL(
            new Blob([""], { type: "application/javascript" }),
          ),
        ),
    };
  }
}

export function MonacoPane({
  value,
  onChange,
  language = MERMAID_LANGUAGE_ID,
}: MonacoPaneProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    configureLoaderOnce();
    let cancelled = false;
    loader
      .init()
      .then(() => {
        registerMermaidLanguage();
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const propagateValue = useCallback(
    (next: string | undefined) => onChange(next ?? ""),
    [onChange],
  );

  if (!ready) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        theme={language === MERMAID_LANGUAGE_ID ? "mermaid-light" : "vs"}
        value={value}
        onChange={propagateValue}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          wordWrap: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          renderWhitespace: "none",
          lineNumbers: "on",
          smoothScrolling: true,
          quickSuggestions: { other: true, comments: false, strings: false },
          suggestOnTriggerCharacters: true,
          tabCompletion: "on",
          snippetSuggestions: "top",
          wordBasedSuggestions: "currentDocument",
          suggest: {
            showSnippets: true,
            showKeywords: true,
            showWords: true,
            snippetsPreventQuickSuggestions: false,
          },
        }}
      />
    </div>
  );
}

/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the "["powerhouse/mermaid"]" document type */
export const MermaidEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerhouse/mermaid"],
  config: {
    id: "mermaid-editor",
    name: "mermaid-editor",
  },
};

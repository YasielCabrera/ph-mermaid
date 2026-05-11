/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import {
  useDocumentById,
  useDocumentsInSelectedDrive,
  useDocumentsInSelectedFolder,
  useSelectedDocument,
} from "@powerhousedao/reactor-browser";
import type {
  MermaidAction,
  MermaidDocument,
} from "document-models/mermaid/v1";
import {
  assertIsMermaidDocument,
  isMermaidDocument,
} from "./gen/document-schema.js";

/** Hook to get a Mermaid document by its id */
export function useMermaidDocumentById(
  documentId: string | null | undefined,
): [MermaidDocument, DocumentDispatch<MermaidAction>] | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isMermaidDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected Mermaid document */
export function useSelectedMermaidDocument(): [
  MermaidDocument,
  DocumentDispatch<MermaidAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsMermaidDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all Mermaid documents in the selected drive */
export function useMermaidDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isMermaidDocument);
}

/** Hook to get all Mermaid documents in the selected folder */
export function useMermaidDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isMermaidDocument);
}

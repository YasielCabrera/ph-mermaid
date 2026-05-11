/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { mermaidDocumentType } from "./document-type.js";
import { MermaidStateSchema } from "./schema/zod.js";
import type { MermaidDocument, MermaidPHState } from "./types.js";

/** Schema for validating the header object of a Mermaid document */
export const MermaidDocumentHeaderSchema = BaseDocumentHeaderSchema.extend({
  documentType: z.literal(mermaidDocumentType),
});

/** Schema for validating the state object of a Mermaid document */
export const MermaidPHStateSchema = BaseDocumentStateSchema.extend({
  global: MermaidStateSchema(),
});

export const MermaidDocumentSchema = z.object({
  header: MermaidDocumentHeaderSchema,
  state: MermaidPHStateSchema,
  initialState: MermaidPHStateSchema,
});

/** Simple helper function to check if a state object is a Mermaid document state object */
export function isMermaidState(state: unknown): state is MermaidPHState {
  return MermaidPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a Mermaid document state object */
export function assertIsMermaidState(
  state: unknown,
): asserts state is MermaidPHState {
  MermaidPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a Mermaid document */
export function isMermaidDocument(
  document: unknown,
): document is MermaidDocument {
  return MermaidDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a Mermaid document */
export function assertIsMermaidDocument(
  document: unknown,
): asserts document is MermaidDocument {
  MermaidDocumentSchema.parse(document);
}

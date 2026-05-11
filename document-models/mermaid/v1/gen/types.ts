/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { MermaidAction } from "./actions.js";
import type { MermaidState as MermaidGlobalState } from "./schema/types.js";

type MermaidLocalState = Record<PropertyKey, never>;

type MermaidPHState = PHBaseState & {
  global: MermaidGlobalState;
  local: MermaidLocalState;
};
type MermaidDocument = PHDocument<MermaidPHState>;

export * from "./schema/types.js";

export type {
  MermaidAction,
  MermaidDocument,
  MermaidGlobalState,
  MermaidLocalState,
  MermaidPHState,
};

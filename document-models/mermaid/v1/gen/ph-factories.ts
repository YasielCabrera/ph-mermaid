/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating MermaidDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  MermaidDocument,
  MermaidGlobalState,
  MermaidLocalState,
  MermaidPHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): MermaidGlobalState {
  return { mermaid: "" };
}

export function defaultLocalState(): MermaidLocalState {
  return {};
}

export function defaultPHState(): MermaidPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<MermaidGlobalState>,
): MermaidGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<MermaidLocalState>,
): MermaidLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as MermaidLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<MermaidGlobalState>,
  localState?: Partial<MermaidLocalState>,
): MermaidPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a MermaidDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createMermaidDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<MermaidGlobalState>;
    local?: Partial<MermaidLocalState>;
  }>,
): MermaidDocument {
  const document = utils.createDocument(
    state
      ? createState(
          createBaseState(state.auth, state.document),
          state.global,
          state.local,
        )
      : undefined,
  );

  return document;
}

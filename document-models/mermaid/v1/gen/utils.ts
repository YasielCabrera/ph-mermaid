/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { DocumentModelUtils } from "document-model";
import {
  baseCreateDocument,
  baseLoadFromInput,
  baseSaveToFileHandle,
  defaultBaseState,
  generateId,
} from "document-model";
import {
  assertIsMermaidDocument,
  assertIsMermaidState,
  isMermaidDocument,
  isMermaidState,
} from "./document-schema.js";
import { mermaidDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type {
  MermaidGlobalState,
  MermaidLocalState,
  MermaidPHState,
} from "./types.js";

export const initialGlobalState: MermaidGlobalState = {
  mermaid: "",
  description: "",
};
export const initialLocalState: MermaidLocalState = {};

export const utils: DocumentModelUtils<MermaidPHState> = {
  fileExtension: ".mmd",
  createState(state) {
    return {
      ...defaultBaseState(),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    const document = baseCreateDocument(utils.createState, state);

    document.header.documentType = mermaidDocumentType;

    // for backwards compatibility, but this is NOT a valid signed document id
    document.header.id = generateId();

    return document;
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInput(input, reducer);
  },
  isStateOfType(state) {
    return isMermaidState(state);
  },
  assertIsStateOfType(state) {
    return assertIsMermaidState(state);
  },
  isDocumentOfType(document) {
    return isMermaidDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsMermaidDocument(document);
  },
};

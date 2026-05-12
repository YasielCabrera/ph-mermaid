/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type { SetDescriptionInput, SetMermaidInput } from "../types.js";

export type SetMermaidAction = Action & {
  type: "SET_MERMAID";
  input: SetMermaidInput;
};
export type SetDescriptionAction = Action & {
  type: "SET_DESCRIPTION";
  input: SetDescriptionInput;
};

export type MermaidMermaidAction = SetMermaidAction | SetDescriptionAction;

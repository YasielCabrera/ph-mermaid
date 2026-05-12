/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { MermaidGlobalState } from "../types.js";
import type { SetDescriptionAction, SetMermaidAction } from "./actions.js";

export interface MermaidMermaidOperations {
  setMermaidOperation: (
    state: MermaidGlobalState,
    action: SetMermaidAction,
    dispatch?: SignalDispatch,
  ) => void;
  setDescriptionOperation: (
    state: MermaidGlobalState,
    action: SetDescriptionAction,
    dispatch?: SignalDispatch,
  ) => void;
}

/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  SetDescriptionInputSchema,
  SetMermaidInputSchema,
} from "../schema/zod.js";
import type { SetDescriptionInput, SetMermaidInput } from "../types.js";
import type { SetDescriptionAction, SetMermaidAction } from "./actions.js";

export const setMermaid = (input: SetMermaidInput) =>
  createAction<SetMermaidAction>(
    "SET_MERMAID",
    { ...input },
    undefined,
    SetMermaidInputSchema,
    "global",
  );

export const setDescription = (input: SetDescriptionInput) =>
  createAction<SetDescriptionAction>(
    "SET_DESCRIPTION",
    { ...input },
    undefined,
    SetDescriptionInputSchema,
    "global",
  );

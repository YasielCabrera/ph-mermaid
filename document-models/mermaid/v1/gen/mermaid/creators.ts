/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import { SetMermaidInputSchema } from "../schema/zod.js";
import type { SetMermaidInput } from "../types.js";
import type { SetMermaidAction } from "./actions.js";

export const setMermaid = (input: SetMermaidInput) =>
  createAction<SetMermaidAction>(
    "SET_MERMAID",
    { ...input },
    undefined,
    SetMermaidInputSchema,
    "global",
  );

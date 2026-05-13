/* eslint-disable @typescript-eslint/no-empty-object-type */

import * as z from "zod";
import type {
  MermaidState,
  SetDescriptionInput,
  SetMermaidInput,
} from "./types.js";

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny =>
  v !== undefined && v !== null;

export const definedNonNullAnySchema = z
  .any()
  .refine((v) => isDefinedNonNullAny(v));

export function MermaidStateSchema(): z.ZodObject<Properties<MermaidState>> {
  return z.object({
    __typename: z.literal("MermaidState").optional(),
    description: z.string().nullish(),
    mermaid: z.string(),
  });
}

export function SetDescriptionInputSchema(): z.ZodObject<
  Properties<SetDescriptionInput>
> {
  return z.object({
    description: z.string(),
  });
}

export function SetMermaidInputSchema(): z.ZodObject<
  Properties<SetMermaidInput>
> {
  return z.object({
    mermaid: z.string(),
  });
}

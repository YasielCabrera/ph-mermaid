/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { MermaidPHState } from "document-models/mermaid/v1";

import { mermaidMermaidOperations } from "../src/reducers/mermaid.js";

import {
  SetDescriptionInputSchema,
  SetMermaidInputSchema,
} from "./schema/zod.js";

const stateReducer: StateReducer<MermaidPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "SET_MERMAID": {
      SetMermaidInputSchema().parse(action.input);

      mermaidMermaidOperations.setMermaidOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_DESCRIPTION": {
      SetDescriptionInputSchema().parse(action.input);

      mermaidMermaidOperations.setDescriptionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    default:
      return state;
  }
};

export const reducer: Reducer<MermaidPHState> = createReducer(stateReducer);

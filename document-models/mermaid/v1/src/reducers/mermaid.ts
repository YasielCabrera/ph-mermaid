import type { MermaidMermaidOperations } from "document-models/mermaid/v1";

export const mermaidMermaidOperations: MermaidMermaidOperations = {
  setMermaidOperation(state, action) {
    state.mermaid = action.input.mermaid;
  },
  setDescriptionOperation(state, action) {
    state.description = action.input.description;
  },
};

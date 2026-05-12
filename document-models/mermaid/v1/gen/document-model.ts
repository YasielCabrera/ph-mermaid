import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  id: "powerhouse/mermaid",
  name: "Mermaid",
  author: {
    name: "Yasiel Cabrera",
    website: "",
  },
  extension: ".mmd",
  description: "A document containing Mermaid diagram source code.",
  specifications: [
    {
      state: {
        local: {
          schema: "",
          examples: [],
          initialValue: "",
        },
        global: {
          schema:
            "type MermaidState {\n    mermaid: String!\n    description: String\n}",
          examples: [],
          initialValue: '{"mermaid":"","description":""}',
        },
      },
      modules: [
        {
          id: "01a00000-0000-4000-8000-000000000001",
          name: "mermaid",
          description: "Operations for editing the mermaid diagram source.",
          operations: [
            {
              id: "01a00000-0000-4000-8000-000000000002",
              name: "SET_MERMAID",
              description: "Sets the mermaid diagram source code.",
              schema: "input SetMermaidInput {\n    mermaid: String!\n}",
              template: "",
              reducer: "state.mermaid = action.input.mermaid;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "01a00000-0000-4000-8000-000000000003",
              name: "SET_DESCRIPTION",
              description: "Sets the markdown description for the diagram.",
              schema:
                "input SetDescriptionInput {\n    description: String!\n}",
              template: "",
              reducer: "state.description = action.input.description;",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
      ],
      version: 1,
      changeLog: [],
    },
  ],
};

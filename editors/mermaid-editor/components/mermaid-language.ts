import * as monaco from "monaco-editor";

export const MERMAID_LANGUAGE_ID = "mermaid";

let registered = false;

export function registerMermaidLanguage() {
  if (registered) return;
  registered = true;

  monaco.languages.register({ id: MERMAID_LANGUAGE_ID });

  monaco.languages.setLanguageConfiguration(MERMAID_LANGUAGE_ID, {
    comments: { lineComment: "%%" },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
  });

  monaco.languages.setMonarchTokensProvider(MERMAID_LANGUAGE_ID, {
    defaultToken: "",
    tokenPostfix: ".mermaid",

    diagramKeywords: [
      "sequenceDiagram",
      "flowchart",
      "graph",
      "classDiagram",
      "stateDiagram",
      "stateDiagram-v2",
      "erDiagram",
      "journey",
      "gantt",
      "pie",
      "requirementDiagram",
      "gitGraph",
      "mindmap",
      "timeline",
      "quadrantChart",
      "C4Context",
      "C4Container",
      "C4Component",
      "C4Dynamic",
      "C4Deployment",
      "sankey-beta",
      "block-beta",
      "xychart-beta",
    ],

    keywords: [
      "actor",
      "participant",
      "as",
      "Note",
      "note",
      "over",
      "of",
      "left",
      "right",
      "loop",
      "alt",
      "else",
      "opt",
      "par",
      "and",
      "rect",
      "break",
      "critical",
      "option",
      "end",
      "activate",
      "deactivate",
      "autonumber",
      "title",
      "accTitle",
      "accDescr",
      "subgraph",
      "direction",
      "class",
      "classDef",
      "click",
      "link",
      "callback",
      "state",
      "section",
      "dateFormat",
      "axisFormat",
      "tickInterval",
      "excludes",
      "includes",
      "todayMarker",
      "branch",
      "checkout",
      "merge",
      "commit",
      "cherry-pick",
      "showData",
      "style",
      "linkStyle",
      "requirement",
      "functionalRequirement",
      "interfaceRequirement",
      "performanceRequirement",
      "physicalRequirement",
      "designConstraint",
      "element",
      "satisfies",
      "verifies",
      "derives",
      "refines",
      "contains",
      "copies",
      "traces",
    ],

    directions: ["LR", "RL", "TB", "BT", "TD"],

    operators: [
      "-->>",
      "-->",
      "->>",
      "->",
      "--x",
      "-x",
      "--)",
      "-)",
      "==>",
      "===",
      "-.->",
      "-.-",
      "<-->",
      "<--",
      "<-",
      "|>",
      "<|",
      "*--",
      "o--",
      "--*",
      "--o",
      "..>",
      "..",
      "::",
      ":",
    ],

    symbols: /[=><!~?:&|+\-*/^%.]+/,

    tokenizer: {
      root: [
        [/^\s*%%.*$/, "comment"],
        [/%%.*$/, "comment"],

        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

        [/\b\d+(\.\d+)?\b/, "number"],

        [
          /[A-Za-z_][\w-]*/,
          {
            cases: {
              "@diagramKeywords": "keyword.diagram",
              "@keywords": "keyword",
              "@directions": "type.identifier",
              "@default": "identifier",
            },
          },
        ],

        [
          /-->>|->>|-->|->|--x|-x|--\)|-\)|==>|===|-\.->|-\.-|<-->|<--|<-/,
          "operator.arrow",
        ],

        [/[{}[\]()]/, "@brackets"],

        [/[;,]/, "delimiter"],

        [/@symbols/, "operator"],

        [/\s+/, "white"],
      ],

      string: [
        [/[^\\"]+/, "string"],
        [/\\./, "string.escape"],
        [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
      ],
    },
  });

  monaco.editor.defineTheme("mermaid-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword.diagram", foreground: "0550AE", fontStyle: "bold" },
      { token: "keyword", foreground: "AF00DB" },
      { token: "type.identifier", foreground: "267F99" },
      { token: "operator.arrow", foreground: "C5266F", fontStyle: "bold" },
      { token: "identifier", foreground: "1F2328" },
      { token: "string", foreground: "0A7C3A" },
      { token: "string.quote", foreground: "0A7C3A" },
      { token: "number", foreground: "1976D2" },
      { token: "comment", foreground: "6E7781", fontStyle: "italic" },
      { token: "delimiter", foreground: "57606A" },
      { token: "operator", foreground: "57606A" },
    ],
    colors: {},
  });

  monaco.editor.defineTheme("mermaid-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword.diagram", foreground: "79C0FF", fontStyle: "bold" },
      { token: "keyword", foreground: "D2A8FF" },
      { token: "type.identifier", foreground: "7EE7C8" },
      { token: "operator.arrow", foreground: "FF7B72", fontStyle: "bold" },
      { token: "identifier", foreground: "E6EDF3" },
      { token: "string", foreground: "A5D6FF" },
      { token: "string.quote", foreground: "A5D6FF" },
      { token: "number", foreground: "F2CC60" },
      { token: "comment", foreground: "8B949E", fontStyle: "italic" },
      { token: "delimiter", foreground: "8B949E" },
      { token: "operator", foreground: "8B949E" },
    ],
    colors: {},
  });
}

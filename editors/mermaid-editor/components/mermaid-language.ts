import * as monaco from "monaco-editor";

export const MERMAID_LANGUAGE_ID = "mermaid";

const DIAGRAM_KEYWORDS = [
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
];

const KEYWORDS = [
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
];

const DIRECTIONS = ["LR", "RL", "TB", "BT", "TD"];

type ArrowCompletion = { op: string; description: string };

const ARROW_OPERATORS: ArrowCompletion[] = [
  { op: "-->", description: "Flowchart arrow" },
  { op: "---", description: "Flowchart open link" },
  { op: "==>", description: "Flowchart thick arrow" },
  { op: "===", description: "Flowchart thick link" },
  { op: "-.->", description: "Flowchart dotted arrow" },
  { op: "-.-", description: "Flowchart dotted link" },
  { op: "->>", description: "Sequence solid arrow with arrowhead" },
  { op: "-->>", description: "Sequence dashed arrow with arrowhead" },
  { op: "-x", description: "Sequence solid arrow with cross" },
  { op: "--x", description: "Sequence dashed arrow with cross" },
  { op: "-)", description: "Sequence solid async arrow" },
  { op: "--)", description: "Sequence dashed async arrow" },
  { op: "<-->", description: "Bidirectional arrow" },
  { op: "o--o", description: "Class composition" },
  { op: "*--*", description: "Class aggregation" },
  { op: "<|--", description: "Class inheritance" },
  { op: "<|..", description: "Class realization" },
];

type Snippet = {
  label: string;
  body: string;
  description: string;
};

const SNIPPETS: Snippet[] = [
  {
    label: "flowchart",
    description: "Flowchart diagram skeleton",
    body: [
      "flowchart ${1|LR,TB,RL,BT,TD|}",
      "\t${2:A}[${3:Start}] --> ${4:B}[${5:End}]",
    ].join("\n"),
  },
  {
    label: "graph",
    description: "Graph (legacy flowchart) skeleton",
    body: [
      "graph ${1|LR,TB,RL,BT,TD|}",
      "\t${2:A}[${3:Start}] --> ${4:B}[${5:End}]",
    ].join("\n"),
  },
  {
    label: "sequenceDiagram",
    description: "Sequence diagram skeleton",
    body: [
      "sequenceDiagram",
      "\tparticipant ${1:Alice}",
      "\tparticipant ${2:Bob}",
      "\t${1:Alice}->>${2:Bob}: ${3:Hello}",
      "\t${2:Bob}-->>${1:Alice}: ${4:Hi}",
    ].join("\n"),
  },
  {
    label: "classDiagram",
    description: "Class diagram skeleton",
    body: [
      "classDiagram",
      "\tclass ${1:Animal} {",
      "\t\t+${2:String} ${3:name}",
      "\t\t+${4:eat}()",
      "\t}",
    ].join("\n"),
  },
  {
    label: "stateDiagram-v2",
    description: "State diagram skeleton",
    body: [
      "stateDiagram-v2",
      "\t[*] --> ${1:Idle}",
      "\t${1:Idle} --> ${2:Active}",
      "\t${2:Active} --> [*]",
    ].join("\n"),
  },
  {
    label: "erDiagram",
    description: "Entity-relationship diagram skeleton",
    body: [
      "erDiagram",
      "\t${1:CUSTOMER} ||--o{ ${2:ORDER} : ${3:places}",
      "\t${2:ORDER} ||--|{ ${4:LINE_ITEM} : ${5:contains}",
    ].join("\n"),
  },
  {
    label: "gantt",
    description: "Gantt chart skeleton",
    body: [
      "gantt",
      "\ttitle ${1:Project Schedule}",
      "\tdateFormat YYYY-MM-DD",
      "\tsection ${2:Phase 1}",
      "\t${3:Task} :a1, ${4:2024-01-01}, ${5:30}d",
    ].join("\n"),
  },
  {
    label: "pie",
    description: "Pie chart skeleton",
    body: [
      "pie title ${1:Pets Adopted}",
      '\t"${2:Dogs}" : ${3:386}',
      '\t"${4:Cats}" : ${5:85}',
    ].join("\n"),
  },
  {
    label: "journey",
    description: "User journey skeleton",
    body: [
      "journey",
      "\ttitle ${1:My Journey}",
      "\tsection ${2:Section}",
      "\t${3:Task}: ${4:5}: ${5:Me}",
    ].join("\n"),
  },
  {
    label: "gitGraph",
    description: "Git graph skeleton",
    body: [
      "gitGraph",
      "\tcommit",
      "\tbranch ${1:develop}",
      "\tcommit",
      "\tcheckout main",
      "\tmerge ${1:develop}",
    ].join("\n"),
  },
  {
    label: "mindmap",
    description: "Mindmap skeleton",
    body: [
      "mindmap",
      "\troot((${1:Root}))",
      "\t\t${2:Branch 1}",
      "\t\t${3:Branch 2}",
    ].join("\n"),
  },
  {
    label: "timeline",
    description: "Timeline skeleton",
    body: [
      "timeline",
      "\ttitle ${1:History}",
      "\t${2:2020} : ${3:Event}",
      "\t${4:2021} : ${5:Event}",
    ].join("\n"),
  },
  {
    label: "quadrantChart",
    description: "Quadrant chart skeleton",
    body: [
      "quadrantChart",
      "\ttitle ${1:Reach vs Effort}",
      "\tx-axis ${2:Low Effort} --> ${3:High Effort}",
      "\ty-axis ${4:Low Reach} --> ${5:High Reach}",
      "\tquadrant-1 ${6:Win}",
      "\tquadrant-2 ${7:Maybe}",
      "\tquadrant-3 ${8:Avoid}",
      "\tquadrant-4 ${9:Strategic}",
    ].join("\n"),
  },
  {
    label: "subgraph",
    description: "Flowchart subgraph block",
    body: ["subgraph ${1:title}", "\t${2:A} --> ${3:B}", "end"].join("\n"),
  },
  {
    label: "loop",
    description: "Sequence loop block",
    body: [
      "loop ${1:condition}",
      "\t${2:A}->>${3:B}: ${4:message}",
      "end",
    ].join("\n"),
  },
  {
    label: "alt",
    description: "Sequence alt / else block",
    body: [
      "alt ${1:condition}",
      "\t${2:A}->>${3:B}: ${4:yes}",
      "else ${5:otherwise}",
      "\t${2:A}->>${3:B}: ${6:no}",
      "end",
    ].join("\n"),
  },
  {
    label: "opt",
    description: "Sequence optional block",
    body: ["opt ${1:condition}", "\t${2:A}->>${3:B}: ${4:message}", "end"].join(
      "\n",
    ),
  },
  {
    label: "par",
    description: "Sequence parallel block",
    body: [
      "par ${1:branch A}",
      "\t${2:A}->>${3:B}: ${4:message}",
      "and ${5:branch B}",
      "\t${2:A}->>${6:C}: ${7:message}",
      "end",
    ].join("\n"),
  },
  {
    label: "note",
    description: "Sequence note",
    body: "note ${1|over,left of,right of|} ${2:Actor}: ${3:Message}",
  },
];

const SNIPPET_LABELS = new Set(SNIPPETS.map((snippet) => snippet.label));

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

    diagramKeywords: DIAGRAM_KEYWORDS,
    keywords: KEYWORDS,
    directions: DIRECTIONS,

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

  monaco.languages.registerCompletionItemProvider(MERMAID_LANGUAGE_ID, {
    triggerCharacters: [" ", "-", ">", ".", ":", "<", "|"],
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range: monaco.IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const lineUntilPosition = model
        .getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        })
        .toLowerCase();

      const arrowRange: monaco.IRange = (() => {
        const match = /[-=.<>|)]+$/.exec(
          model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          }),
        );
        if (!match) return range;
        return {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column - match[0].length,
          endColumn: position.column,
        };
      })();

      const suggestions: monaco.languages.CompletionItem[] = [];

      for (const snippet of SNIPPETS) {
        suggestions.push({
          label: snippet.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: snippet.body,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: snippet.description,
          documentation: {
            value: "```mermaid\n" + snippetPreview(snippet.body) + "\n```",
          },
          sortText: "0" + snippet.label,
          range,
        });
      }

      for (const keyword of DIAGRAM_KEYWORDS) {
        if (SNIPPET_LABELS.has(keyword)) continue;
        suggestions.push({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: keyword,
          detail: "Mermaid diagram",
          sortText: "1" + keyword,
          range,
        });
      }

      for (const keyword of KEYWORDS) {
        if (SNIPPET_LABELS.has(keyword)) continue;
        suggestions.push({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          detail: "Mermaid keyword",
          sortText: "2" + keyword,
          range,
        });
      }

      const directionContext = /\b(flowchart|graph|direction)\s+\S*$/.test(
        lineUntilPosition,
      );
      for (const direction of DIRECTIONS) {
        suggestions.push({
          label: direction,
          kind: monaco.languages.CompletionItemKind.Constant,
          insertText: direction,
          detail: "Diagram direction",
          sortText: (directionContext ? "0a" : "3") + direction,
          range,
        });
      }

      for (const arrow of ARROW_OPERATORS) {
        suggestions.push({
          label: arrow.op,
          kind: monaco.languages.CompletionItemKind.Operator,
          insertText: arrow.op,
          detail: arrow.description,
          sortText: "4" + arrow.op,
          range: arrowRange,
          filterText: arrow.op,
        });
      }

      return { suggestions };
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

function snippetPreview(body: string): string {
  return body
    .replace(/\$\{\d+\|([^|}]+)(?:[^}]*)\}/g, "$1")
    .replace(/\$\{\d+:([^}]+)\}/g, "$1")
    .replace(/\$\{\d+\}/g, "")
    .replace(/\$\d+/g, "");
}

import {
  createSdkMcpServer,
  query,
  tool,
} from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

type ChatMessage = { role: string; content: string };
type ChatReply = { text: string; editedSource: string | null };

function buildPrompt(
  messages: ChatMessage[],
  mermaidSource?: string | null,
): string {
  const lines: string[] = [];
  lines.push(
    "You are helping the user write a Mermaid diagram inside a live editor.",
    "You have access to a tool called `set_source` that REPLACES the diagram source with the value you provide. Use it whenever the user asks for a change to the diagram — do not just describe the change. After calling the tool, briefly tell the user what you changed.",
    "",
  );
  if (mermaidSource && mermaidSource.trim().length > 0) {
    lines.push(
      "Current diagram source:",
      "```mermaid",
      mermaidSource,
      "```",
      "",
    );
  } else {
    lines.push("The diagram is currently empty.", "");
  }
  for (const m of messages) {
    const label = m.role === "assistant" ? "Assistant" : "User";
    lines.push(`${label}: ${m.content}`);
  }
  return lines.join("\n");
}

async function runClaudeChat(
  messages: ChatMessage[],
  mermaidSource?: string | null,
): Promise<ChatReply> {
  const prompt = buildPrompt(messages, mermaidSource);

  let editedSource: string | null = null;

  const mermaidServer = createSdkMcpServer({
    name: "mermaid",
    tools: [
      tool(
        "set_source",
        "Replace the Mermaid diagram source with the provided text. Always pass the COMPLETE new source — partial diffs are not supported.",
        { source: z.string().describe("The full new Mermaid diagram source") },
        // eslint-disable-next-line @typescript-eslint/require-await
        async (args) => {
          editedSource = args.source;
          return {
            content: [
              {
                type: "text" as const,
                text: "Diagram source updated.",
              },
            ],
          };
        },
      ),
    ],
  });

  const q = query({
    prompt,
    options: {
      tools: [],
      mcpServers: { mermaid: mermaidServer },
      allowedTools: ["mcp__mermaid__set_source"],
    },
  });

  let text = "";
  for await (const message of q) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text") {
          text += block.text;
        }
      }
    }
  }
  return { text, editedSource };
}

export const getResolvers = (): Record<string, unknown> => {
  return {
    Mutation: {
      claudeChat_ping: () => "pong",
      claudeChat: async (
        _parent: unknown,
        args: { messages: ChatMessage[]; mermaidSource?: string | null },
      ): Promise<ChatReply> => {
        return runClaudeChat(args.messages, args.mermaidSource);
      },
    },
  };
};

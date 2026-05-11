import { useCallback, useId, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { DEFAULT_SWITCHBOARD_URL } from "@powerhousedao/reactor-browser";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "./ai-elements/conversation.js";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "./ai-elements/message.js";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputSubmit,
  type PromptInputMessage,
} from "./ai-elements/prompt-input.js";

type ChatRole = "user" | "assistant";
type ChatMessage = { id: string; role: ChatRole; content: string };

const CHAT_ENDPOINT = `${DEFAULT_SWITCHBOARD_URL}/claude-chat`;

const CHAT_MUTATION = /* GraphQL */ `
  mutation ClaudeChat(
    $messages: [ClaudeChatMessage!]!
    $mermaidSource: String
  ) {
    claudeChat(messages: $messages, mermaidSource: $mermaidSource) {
      text
      editedSource
    }
  }
`;

type ChatReply = { text: string; editedSource: string | null };

async function callClaudeChat(
  messages: { role: ChatRole; content: string }[],
  mermaidSource: string,
): Promise<ChatReply> {
  const response = await fetch(CHAT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: CHAT_MUTATION,
      variables: {
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        mermaidSource: mermaidSource || null,
      },
    }),
  });

  const bodyText = await response.text();
  let json: {
    data?: { claudeChat?: ChatReply };
    errors?: { message: string }[];
  } = {};
  try {
    json = JSON.parse(bodyText) as typeof json;
  } catch {
    throw new Error(
      `Chat endpoint returned ${response.status} (non-JSON body): ${bodyText.slice(0, 300)}`,
    );
  }

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }

  if (!response.ok) {
    throw new Error(
      `Chat endpoint returned ${response.status}: ${bodyText.slice(0, 300)}`,
    );
  }
  const reply = json.data?.claudeChat;
  return {
    text: reply?.text ?? "",
    editedSource: reply?.editedSource ?? null,
  };
}

export type ChatPaneProps = {
  mermaidSource: string;
  onApplyEdit?: (newSource: string) => void;
};

export function ChatPane({ mermaidSource, onApplyEdit }: ChatPaneProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const idPrefix = useId();
  const counterRef = useRef(0);

  const nextId = useCallback(() => {
    const id = `${idPrefix}-${counterRef.current}`;
    counterRef.current += 1;
    return id;
  }, [idPrefix]);

  const handleSubmit = useCallback(
    async (message: PromptInputMessage): Promise<void> => {
      const text = message.text ? message.text.trim() : "";
      if (!text || isSending) return;

      const userMessage: ChatMessage = {
        id: nextId(),
        role: "user",
        content: text,
      };
      const nextHistory = [...messages, userMessage];
      setMessages(nextHistory);
      setIsSending(true);

      try {
        const reply = await callClaudeChat(
          nextHistory.map(({ role, content }) => ({ role, content })),
          mermaidSource,
        );
        if (reply.editedSource !== null && onApplyEdit) {
          onApplyEdit(reply.editedSource);
        }
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "assistant",
            content: reply.text || "(no response)",
          },
        ]);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "assistant",
            content: `⚠️ ${errorMessage}`,
          },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [isSending, mermaidSource, messages, nextId, onApplyEdit],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <Conversation className="flex-1 min-h-0">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              title="Chat with Claude"
              description="Ask questions about your Mermaid diagram. Uses your local Claude Code subscription."
            />
          ) : (
            <>
              {messages.map((m) => (
                <Message key={m.id} from={m.role}>
                  <MessageContent>
                    {m.role === "assistant" ? (
                      <MessageResponse>{m.content}</MessageResponse>
                    ) : (
                      <div className="whitespace-pre-wrap break-words">
                        {m.content}
                      </div>
                    )}
                  </MessageContent>
                </Message>
              ))}
              {isSending ? (
                <Message from="assistant" aria-live="polite">
                  <MessageContent>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Claude is thinking</span>
                      <span className="inline-flex gap-0.5">
                        <span className="size-1 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                        <span className="size-1 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                        <span className="size-1 animate-bounce rounded-full bg-current" />
                      </span>
                    </div>
                  </MessageContent>
                </Message>
              ) : null}
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="border-t border-gray-200 p-2">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              placeholder="Message Claude…"
              disabled={isSending}
            />
            <div className="flex justify-end p-2">
              <PromptInputSubmit
                status={isSending ? "submitted" : undefined}
                disabled={isSending}
              />
            </div>
          </PromptInputBody>
        </PromptInput>
      </div>
    </div>
  );
}

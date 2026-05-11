import { gql } from "graphql-tag";
import type { DocumentNode } from "graphql";

export const schema: DocumentNode = gql`
  input ClaudeChatMessage {
    role: String!
    content: String!
  }

  type ClaudeChatReply {
    text: String!
    editedSource: String
  }

  type Query {
    _claudeChat: Boolean
  }

  type Mutation {
    claudeChat_ping: String
    claudeChat(
      messages: [ClaudeChatMessage!]!
      mermaidSource: String
    ): ClaudeChatReply!
  }
`;

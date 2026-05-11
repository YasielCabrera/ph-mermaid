import { BaseSubgraph } from "@powerhousedao/reactor-api";

import { schema } from "./schema.js";
import { getResolvers } from "./resolvers.js";

export class ClaudeChatSubgraph extends BaseSubgraph {
  name = "claude-chat";
  typeDefs = schema;
  resolvers = getResolvers();
}

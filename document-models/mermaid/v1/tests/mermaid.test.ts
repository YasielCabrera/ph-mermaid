import { generateMock } from "document-model";
import {
  isMermaidDocument,
  reducer,
  setDescription,
  SetDescriptionInputSchema,
  setMermaid,
  SetMermaidInputSchema,
  utils,
} from "document-models/mermaid/v1";
import { describe, expect, it } from "vitest";

describe("MermaidOperations", () => {
  it("should handle setMermaid operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetMermaidInputSchema());

    const updatedDocument = reducer(document, setMermaid(input));

    expect(isMermaidDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_MERMAID",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setDescription operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetDescriptionInputSchema());

    const updatedDocument = reducer(document, setDescription(input));

    expect(isMermaidDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_DESCRIPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});

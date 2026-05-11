/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import {
  assertIsMermaidDocument,
  assertIsMermaidState,
  initialGlobalState,
  initialLocalState,
  isMermaidDocument,
  isMermaidState,
  mermaidDocumentType,
  utils,
} from "document-models/mermaid/v1";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("Mermaid Document Model", () => {
  it("should create a new Mermaid document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(mermaidDocumentType);
  });

  it("should create a new Mermaid document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isMermaidDocument(document)).toBe(true);
    expect(isMermaidState(document.state)).toBe(true);
  });
  it("should reject a document that is not a Mermaid document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsMermaidDocument(wrongDocumentType)).toThrow();
      expect(isMermaidDocument(wrongDocumentType)).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
    }
  });
  const wrongState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongState.state.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isMermaidState(wrongState.state)).toBe(false);
    expect(assertIsMermaidState(wrongState.state)).toThrow();
    expect(isMermaidDocument(wrongState)).toBe(false);
    expect(assertIsMermaidDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isMermaidState(wrongInitialState.state)).toBe(false);
    expect(assertIsMermaidState(wrongInitialState.state)).toThrow();
    expect(isMermaidDocument(wrongInitialState)).toBe(false);
    expect(assertIsMermaidDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isMermaidDocument(missingIdInHeader)).toBe(false);
    expect(assertIsMermaidDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isMermaidDocument(missingNameInHeader)).toBe(false);
    expect(assertIsMermaidDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isMermaidDocument(missingCreatedAtUtcIsoInHeader)).toBe(false);
    expect(assertIsMermaidDocument(missingCreatedAtUtcIsoInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(isMermaidDocument(missingLastModifiedAtUtcIsoInHeader)).toBe(false);
    expect(
      assertIsMermaidDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});

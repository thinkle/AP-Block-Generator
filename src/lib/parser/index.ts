import * as TS from "ts-morph";
import type {
  CodeElement,
  Assignment,
  EmptyNode,
  ReturnStatement,
  AnyElement,
} from "../pseudocode";
import {
  handleFunctionDeclaration,
  handleFunctionExpression,
} from "./handleFunctionDeclaration";
import { handleVariableDeclaration } from "./handleVariableDeclaration";
import { handleStringLiteral } from "./handleStringLiteral";
import { handleNumericLiteral } from "./handleNumericLiteral";
import { handleCallExpression } from "./handleCallExpression";
import { handleBinaryExpression } from "./handleBinaryExpression";
import { handleForLoop } from "./handleForLoop";
import { handleForOfLoop } from "./handleForOfLoop";
import { handleBlock } from "./handleBlock";
import { handleIdentifier } from "./handleIdentifier";
import { handleListIndex } from "./handleListIndex";
import { handlePropertyAccessExpression } from "./handlePropertyAccessExpression";
import { handlePrefixUnaryExpression } from "./handlePrefixUnaryExpression";
import { handlePostfixUnaryExpression } from "./handlePostfixUnaryExpression";
import { handleParenthesizedExpression } from "./handleParenthesizedExpression";
import { handleArrayLiteralExpression } from "./handleArrayLiteralExpression";
import { handleIfStatement } from "./handleIfStatement";
import { transformTreeWithBreakout } from "./breakout";
import { resetNames } from "./getUniqueName";
import { handleAnonymousArrowFunction } from "./handleArrowFunction";
import { handleWhileLoop } from "./handleWhileLoop";
type NodeHandler = (node: TS.Node) => AnyElement;
export const ASSIGN = "←";
export function parseCode(code: string): AnyElement {
  resetNames();
  const project = new TS.Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile("temp.ts", code);
  try {
    let ogResult = processNode(sourceFile, nodeHandlers);

    if (Array.isArray(ogResult)) {
      ogResult = {
        element: "code",
        children: ogResult,
      };
    }
    console.log("ogResult", JSON.parse(JSON.stringify(ogResult)));
    transformTreeWithBreakout(ogResult);
    transformTreeWithBreakout(ogResult);
    transformTreeWithBreakout(ogResult);
    console.log("transformed => ", ogResult);
    return ogResult;
  } catch (err) {
    console.log("Error processing code", err);
    console.log("Code was: ", code);
    return {
      element: "empty",
    };
  }
}

const nodeHandlers: Record<TS.SyntaxKind, NodeHandler> = {
  [TS.SyntaxKind.FunctionDeclaration]: handleFunctionDeclaration,
  [TS.SyntaxKind.ArrowFunction]: handleAnonymousArrowFunction,
  [TS.SyntaxKind.FunctionExpression]: handleFunctionExpression,
  [TS.SyntaxKind.VariableDeclaration]: handleVariableDeclaration,
  [TS.SyntaxKind.Identifier]: handleIdentifier,
  [TS.SyntaxKind.StringLiteral]: handleStringLiteral,
  [TS.SyntaxKind.NumericLiteral]: handleNumericLiteral,
  [TS.SyntaxKind.BinaryExpression]: handleBinaryExpression,
  [TS.SyntaxKind.CallExpression]: handleCallExpression,
  [TS.SyntaxKind.IfStatement]: handleIfStatement,
  [TS.SyntaxKind.ArrayLiteralExpression]: handleArrayLiteralExpression,
  [TS.SyntaxKind.ForStatement]: handleForLoop,
  [TS.SyntaxKind.ForOfStatement]: handleForOfLoop,
  [TS.SyntaxKind.WhileStatement]: handleWhileLoop,
  [TS.SyntaxKind.Block]: handleBlock,
  [TS.SyntaxKind.ElementAccessExpression]: handleListIndex,
  [TS.SyntaxKind.PropertyAccessExpression]: handlePropertyAccessExpression,
  [TS.SyntaxKind.PrefixUnaryExpression]: handlePrefixUnaryExpression,
  [TS.SyntaxKind.PostfixUnaryExpression]: handlePostfixUnaryExpression,
  [TS.SyntaxKind.ParenthesizedExpression]: handleParenthesizedExpression,
  [TS.SyntaxKind.TrueKeyword]: () => ({
    element: "value",
    type: "boolean",
    value: "true",
  }),
  [TS.SyntaxKind.FalseKeyword]: () => ({
    element: "value",
    type: "boolean",
    value: "false",
  }),
  [TS.SyntaxKind.ReturnStatement]: (node) => {
    const returnStatement = node as TS.ReturnStatement;
    const expression = returnStatement.getExpression();
    if (expression) {
      return {
        element: "returnStatement",
        value: processNode(expression),
      };
    } else {
      return {
        element: "returnStatement",
        value: {
          element: "empty",
        },
      };
    }
  },
  // ... Add more handlers as needed
};

export function processNode(
  node: TS.Node,
  handlers: Record<TS.SyntaxKind, NodeHandler> = nodeHandlers
): CodeElement | CodeElement[] {
  const handler = handlers[node.getKind()];
  if (handler) {
    return handler(node);
  } else {
    if (shouldFlatten(node)) {
      return node.getChildren().flatMap((child) => processNode(child));
    } else {
      return {
        element: node.getKindName(),
        children: node
          .getChildren()
          .map((child) => processNode(child, handlers)),
      };
    }
  }
}

function shouldFlatten(node: TS.Node): boolean {
  // Add logic to determine if the node is of a type that should be flattened
  return [
    TS.SyntaxKind.SyntaxList,
    TS.SyntaxKind.VariableDeclarationList,
    TS.SyntaxKind.VariableStatement,
    TS.SyntaxKind.ConstKeyword,
    TS.SyntaxKind.LetKeyword,
    TS.SyntaxKind.VarKeyword,
    TS.SyntaxKind.SourceFile,
    TS.SyntaxKind.ExpressionStatement,
    TS.SyntaxKind.SemicolonToken,
    TS.SyntaxKind.EndOfFileToken,
    // Add other kinds as needed
  ].includes(node.getKind());
}

function ignore(node: TS.Node): EmptyNode {
  return {
    element: "empty",
  };
}

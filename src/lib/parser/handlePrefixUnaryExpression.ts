import * as TS from "ts-morph";
import type { MathExpression } from "./pseudocode";
import { processNode, translateOperatorToken } from ".";

export function translateOperatorToken(token: number): string {
  switch (token) {
    case TS.SyntaxKind.ExclamationToken:
      return "not";
    case TS.SyntaxKind.MinusToken:
      return "-";
    case TS.SyntaxKind.PlusToken:
      return "";
    default:
      return "?";
  }
}

export function handlePrefixUnaryExpression(
  node: TS.PrefixUnaryExpression
): MathExpression {
  if (!TS.Node.isPrefixUnaryExpression(node)) {
    throw new Error("Node is not a Prefix Unary Expression");
  }
  console.log("Handle unary", node);
  const operator = node.getOperatorToken();
  const operand = processNode(node.getOperand());

  return {
    element: "mathExpression",
    operator: translateOperatorToken(operator),
    left: {
      element: "empty",
    },
    right: operand,
  };
}

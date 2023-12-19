import * as TS from "ts-morph";
import { processNode } from ".";

export function handleParenthesizedExpression(
  node: TS.ParenthesizedExpression
): ParenthesizedExpression {
  if (!TS.Node.isParenthesizedExpression(node)) {
    throw new Error("Node is not a Parenthesized Expression");
  }

  return {
    element: "parentheses",
    expression: processNode(node.getExpression()),
  };
}

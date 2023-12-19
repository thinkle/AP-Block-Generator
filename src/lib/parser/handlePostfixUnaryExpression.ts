import * as TS from "ts-morph";
import type { MathExpression } from "./pseudocode";
import { processNode, ASSIGN } from ".";

export function handlePostfixUnaryExpression(
  node: TS.PostfixUnaryExpression
): MathExpression {
  if (!TS.Node.isPostfixUnaryExpression(node)) {
    throw new Error("Node is not a Postfix Unary Expression");
  }

  const operatorToken = node.getOperatorToken();
  const operand = processNode(node.getOperand());
  if (
    operatorToken == TS.SyntaxKind.PlusPlusToken ||
    operatorToken == TS.SyntaxKind.MinusMinusToken
  ) {
    const operator = operatorToken == TS.SyntaxKind.PlusPlusToken ? "+" : "-";
    return {
      element: "mathExpression",
      operator: ASSIGN,
      left: operand,
      right: {
        element: "mathExpression",
        operator,
        left: operand,
        right: {
          element: "value",
          type: "number",
          value: "1",
        },
      },
    };
  }
}

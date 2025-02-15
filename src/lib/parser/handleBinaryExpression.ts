import * as TS from "ts-morph";
import type { MathExpression, ExpressionElement, ProcedureCall } from "../pseudocode";
import { processNode, ASSIGN } from ".";
import { isStringType } from "./utils/isStringType";
import { handleSpreadAssignment } from "./handleSpread";

export function translateOperator(operator: string): string {
  switch (operator) {
    case "===":
    case "==":
      return "=";
    case "!==":
    case "!=":
      return "≠";
    // Add cases for other TypeScript operators if needed
    case ">=":
      return "≥";
    case "<=":
      return "≤";
    case "&&":
      return "and";
    case "||":
      return "or";
    case "=":
      return "←";
    case "%":
      return "MOD";
    default:
      return operator;
  }
}
/* Can we add correct type definitions here  - these will all return ProcedureCall */
export function handleBinaryExpression(
  node: TS.Node
): MathExpression | ProcedureCall {
  if (!TS.Node.isBinaryExpression(node)) {
    throw new Error("Node is not a Binary Expression");
  }

  const leftNode = node.getLeft();
  const rightNode = node.getRight();
  const left = processNode(leftNode) as ExpressionElement;
  const right = processNode(rightNode) as ExpressionElement;
  const operator = node.getOperatorToken().getText();

  // Check if it's a string concatenation
  if (operator === "+" && (isStringType(leftNode) || isStringType(rightNode))) {
    return {
      element: "procedureCall",
      name: "CONCAT",
      args: [left, right],
    };
  }

  if (["+=", "-=", "*=", "/=", "%="].includes(operator)) {
    let apCspOperator = translateOperator(operator[0]);
    return {
      element: "mathExpression",
      operator: ASSIGN,
      left,
      right: {
        element: "mathExpression",
        left,
        operator: apCspOperator,
        right,
      },
    };
  }

  if (operator === '=') {
    // special case assignment operator...
    if (right.type === 'list' && rightNode.getChildrenOfKind(TS.SyntaxKind.SpreadElement).length > 0) {
      return handleSpreadAssignment(left, right);
    }
  } 

  // Translate TypeScript operators to APCSP-style operators if needed
  const apCspOperator = translateOperator(operator);

  return {
    element: "mathExpression",
    operator: apCspOperator,
    left,
    right,
  };
}

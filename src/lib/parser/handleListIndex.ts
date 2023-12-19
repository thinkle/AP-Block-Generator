import * as TS from "ts-morph";
import type { Variable, List, ExpressionElement } from "./pseudocode";
import { processNode } from ".";

export function handleListIndex(node: TS.ElementAccessExpression): ListIndex {
  if (!TS.Node.isElementAccessExpression(node)) {
    throw new Error("Node is not an Element Access Expression");
  }

  const expression = node.getExpression(); // The list being accessed
  const argumentExpression = node.getArgumentExpression(); // The index expression

  if (!argumentExpression) {
    throw new Error("Element access expression lacks an index argument");
  }

  return {
    element: "listIndex",
    list: processNode(expression) as Variable | List, // Your processNode should be able to handle TS.Node types to Variable or List
    index: processNode(argumentExpression) as ExpressionElement, // Now index is processed as a general expression
  };
}

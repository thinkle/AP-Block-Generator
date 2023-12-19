import * as TS from "ts-morph";
import type { List, ExpressionElement } from "./pseudocode";
import { processNode } from ".";

export function handleArrayLiteralExpression(node: TS.Node): List {
  if (!TS.Node.isArrayLiteralExpression(node)) {
    throw new Error("Node is not an Array Literal Expression");
  }

  const elements = node
    .getElements()
    .map((element) => processNode(element)) as ExpressionElement[];

  return {
    element: "value",
    type: "list",
    value: elements,
  };
}

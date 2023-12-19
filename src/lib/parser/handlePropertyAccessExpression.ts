import * as TS from "ts-morph";
import type { Variable, ProcedureCall } from "./pseudocode";
import { processNode } from ".";

export function handlePropertyAccessExpression(
  node: TS.Node
): ProcedureCall | Variable {
  if (!TS.Node.isPropertyAccessExpression(node)) {
    throw new Error("Node is not a Property Access Expression");
  }

  const expression = node.getExpression();
  const name = node.getName();

  // Special handling for the 'length' property
  if (name === "length") {
    return {
      element: "procedureCall",
      name: "LENGTH",
      args: [processNode(expression)], // processNode should return a Variable or List
    };
  }

  // Default case, treat the entire property access as a variable name
  return {
    element: "variable",
    name: `${expression.getText()}.${name}`, // This assumes processNode returns a string for the object name
  };
}

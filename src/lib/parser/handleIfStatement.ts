import * as TS from "ts-morph";
import type { IfStatement } from "./pseudocode";
import { processNode } from ".";

export function handleIfStatement(node: TS.Node): IfStatement {
  if (!TS.Node.isIfStatement(node)) {
    throw new Error("Node is not an If Statement");
  }

  const condition = node.getExpression(); // Get the condition expression
  const thenStatement = node.getThenStatement(); // Get the 'then' block
  const elseStatement = node.getElseStatement(); // Get the 'else' block, if present

  return {
    element: "ifStatement",
    condition: processNode(condition),
    consequent: processNode(thenStatement),
    alternate: elseStatement && processNode(elseStatement),
  };
}

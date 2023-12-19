import * as TS from "ts-morph";
import type { StatementElement, Block } from "./pseudocode";
import { processNode } from ".";

export function handleBlock(node: TS.Node): Block {
  if (!TS.Node.isBlock(node)) {
    throw new Error("Node is not a Block");
  }

  // Process each statement in the block
  const children: StatementElement[] = node.getStatements().map((statement) => {
    return processNode(statement) as StatementElement;
  });

  return {
    element: "block",
    children,
  };
}

import * as TS from "ts-morph";
import type { UntilLoopExpression } from "../pseudocode";
import type { Block } from "../pseudocode";
import { processNode } from "."; // Assuming you have a function to invert conditions
import { invertCondition } from "./utils/invertCondition";

export const handleWhileLoop = (
  node: TS.WhileStatement
): UntilLoopExpression => {
  if (!TS.Node.isWhileStatement(node)) {
    throw new Error("Node is not a While Statement");
  }

  // Process the condition and invert it for the 'until' loop
  const condition = node.getExpression();
  const invertedCondition = invertCondition(condition);

  // Process the body of the while loop
  const body: Block = {
    element: "block",
    children:
      node.getStatement() instanceof TS.Block
        ? node.getStatement().getStatements().map(processNode)
        : [processNode(node.getStatement())],
  };

  return {
    element: "untilLoop",
    condition: processNode(invertedCondition),
    body,
  };
};

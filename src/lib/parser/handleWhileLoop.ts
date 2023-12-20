import * as TS from "ts-morph";
import type { UntilLoopExpression } from "../pseudocode";
import type { Block } from "../pseudocode";
import { processNode } from "."; // Assuming you have a function to invert conditions
import { getStatementFromJS } from "./utils/getStatementFromJS";

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

function invertCondition(expression: TS.Expression): TS.Expression {
  // Direct negation for simple conditions
  if (
    expression.getKind() === TS.SyntaxKind.PrefixUnaryExpression &&
    expression.getOperatorToken() === TS.SyntaxKind.ExclamationToken
  ) {
    // Remove the negation if it's already negated (e.g., !condition becomes condition)
    return expression.getOperand();
  }

  // Apply De Morgan's laws for compound conditions (e.g., !(a && b) becomes !a || !b)
  // This is a simplified example and should be expanded to handle various cases

  // For other cases, simply negate the condition
  return getStatementFromJS(`!${expression.getText()}`);
  /* const project = new TS.Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(
    "temp.ts",
    `!${expression.getText()}`,
    { overwrite: true }
  );
  return sourceFile.getStatements()[0] as TS.Expression; */
}

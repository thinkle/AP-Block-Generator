import * as TS from "ts-morph";
import type {
  ForEachExpression,
  GenericForExpression,
  RepeatExpression,
} from "./pseudocode";
import { processNode } from ".";

export function handleForLoop(
  node: TS.Node
): RepeatExpression | ForEachExpression | GenericForExpression {
  if (!TS.Node.isForStatement(node)) {
    throw new Error("Node is not a For Statement");
  }

  const initializer = node.getInitializer();
  const condition = node.getCondition();
  const incrementor = node.getIncrementor();
  const body = node.getStatement();

  // Check if the loop matches the pattern: for (let i = 0; i < N; i++)
  if (
    TS.Node.isVariableDeclarationList(initializer) &&
    initializer.getDeclarations().length === 1 &&
    condition &&
    TS.Node.isNumericLiteral(condition.getRight()) &&
    TS.Node.isPostfixUnaryExpression(incrementor) &&
    incrementor.getOperatorToken() === TS.SyntaxKind.PlusPlusToken
  ) {
    const n = parseInt(condition.getRight().getText());
    return {
      element: "repeatN",
      n: n,
      body: [processNode(node.getStatement())],
    };
  } else {
    return {
      element: "genericFor",
      initializer: initializer ? processNode(initializer) : undefined,
      condition: condition ? processNode(condition) : undefined,
      incrementor: incrementor ? processNode(incrementor) : undefined,
      body: [processNode(node.getStatement())],
    };
  }
}

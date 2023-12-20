import * as TS from "ts-morph";
import { getStatementFromJS } from "./getStatementFromJS";

export function invertCondition(expression: TS.Expression): TS.Expression {
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

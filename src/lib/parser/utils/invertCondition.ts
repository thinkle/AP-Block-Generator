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
  /* Can we check for simple statements, such as... 
  == -> !=
  != -> ==
  < -> >=
  > -> <=
  */
  // Check for simple binary expressions
  if (expression.getKind() === TS.SyntaxKind.BinaryExpression) {
    debugger;
    const binaryExpr = expression as TS.BinaryExpression;
    const left = binaryExpr.getLeft();
    const right = binaryExpr.getRight();
    let newOperator: TS.SyntaxKind | null = null;
    let leftText = left.getText();
    let rightText = right.getText();
    let operatorText = binaryExpr.getOperatorToken().getText();
    operatorText = operatorText.replace(/([=!])=/, "$1==");
    switch (operatorText) {
      case "===":
        newOperator = "!==";
        break;
      case "!==":
        newOperator = "==";
        break;
      case "<":
        newOperator = ">=";
        break;
      case ">":
        newOperator = "<=";
        break;
      case "<=":
        newOperator = ">";
        break;
      case ">=":
        newOperator = "<";
        break;
      // Add more cases as needed
    }

    if (newOperator) {
      return getStatementFromJS(
        `${left.getText()} ${newOperator} ${right.getText()}`
      );
    }
  }

  let jsExpression = `!(${expression.getText()})`;
  return getStatementFromJS(jsExpression);
}

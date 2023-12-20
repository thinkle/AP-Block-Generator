import * as TS from "ts-morph";
import type {
  ForEachExpression,
  GenericForExpression,
  RepeatExpression,
} from "./pseudocode";
import { processNode } from ".";
import { crawl } from "./utils/crawlNode";
import { invertCondition } from "./utils/invertCondition";

export function handleForLoop(
  node: TS.Node
): RepeatExpression | ForEachExpression | GenericForExpression {
  if (!TS.Node.isForStatement(node)) {
    throw new Error("Node is not a For Statement");
  }

  const initializer = node.getInitializer();
  const condition = node.getCondition();
  const incrementor = node.getIncrementor();
  const body = processNode(node.getStatement());
  let variableName = "";
  let bodyUsesVariable = false;
  if (initializer && initializer.getDeclarations()?.length) {
    variableName = initializer.getDeclarations()[0].getName();
    crawl(body, (node) => {
      if (node.element === "variable" && node.name === variableName) {
        bodyUsesVariable = true;
      }
    });
  }
  // Check if the loop matches the pattern:
  // for (let i = n; i < N; i++)
  if (
    !bodyUsesVariable &&
    TS.Node.isVariableDeclarationList(initializer) &&
    initializer.getDeclarations().length === 1 &&
    condition &&
    TS.Node.isBinaryExpression(condition) &&
    condition.getOperatorToken().getText() === "<" &&
    TS.Node.isNumericLiteral(condition.getRight()) &&
    TS.Node.isPostfixUnaryExpression(incrementor) &&
    incrementor.getOperatorToken() === TS.SyntaxKind.PlusPlusToken
  ) {
    const limitNumber = parseInt(condition.getRight().getText());
    const startNumber = parseInt(
      initializer.getDeclarations()[0].getInitializer().getText()
    );
    const n = limitNumber - startNumber;
    return {
      element: "repeatN",
      n: n,
      body: [processNode(node.getStatement())],
    };
  } else {
    let returnValues = [];
    if (initializer) {
      returnValues.push(processNode(initializer));
    }
    let untilCondition = {
      element: "value",
      type: "boolean",
      value: false,
    }; // if no condition, we run forever...
    if (condition) {
      untilCondition = processNode(invertCondition(condition));
    }
    if (incrementor) {
      body.children.push(processNode(incrementor));
    }
    returnValues.push({
      element: "untilLoop",
      condition: untilCondition,
      body: body,
    });
    return returnValues;
  }
}

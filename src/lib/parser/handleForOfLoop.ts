import * as TS from "ts-morph";
import type { Variable, ForEachExpression, List } from "./pseudocode";
import { processNode } from ".";

export function handleForOfLoop(node: TS.ForOfStatement): ForEachExpression {
  // Check for a for...of loop
  if (!TS.Node.isForOfStatement(node)) {
    throw new Error("Node is not a For...Of Statement");
  }
  const iterable = processNode(node.getExpression());
  let initializer = node.getInitializer();
  let declaration = initializer.getDeclarations()[0];
  let itemVariable = declaration.getName();

  // How do I get the itemVariable?
  return {
    initializer: processNode(node.getInitializer()),
    element: "forEach",
    list: iterable as Variable | List,
    itemVariable,
    body: [processNode(node.getStatement())],
  };
}

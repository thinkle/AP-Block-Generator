import * as TS from "ts-morph";
import type {
  ProcedureCall,
  ExpressionElement,
  Value,
  ForEachExpression,
  Block,
} from "../pseudocode";
import { ASSIGN, processNode } from ".";
import { handleArrowFunction } from "./handleArrowFunction";
import { handleFunctionDeclaration } from "./handleFunctionDeclaration";
import type MathExpression from "../../components/APCSP/MathExpression.svelte";
import { push, splice, forEach, map, filter, reduce } from "./listMethods";

const treatAsOutput = (args: ExpressionElement[]) => ({
  name: "OUTPUT",
  args,
  element: "procedureCall",
});
const treatAsInput = (args: ExpressionElement[]) => ({
  name: "INPUT",
  args,
  element: "procedureCall",
});

export const methodHandlers = {
  /*  Array methods */
  push,
  splice,
  forEach,
  map,
  filter,
  reduce,
  /* Window methods and console methods... */
  log: (
    objectNode: TS.LeftHandSideExpression,
    args: ExpressionElement[],
    fullNode: TS.Node
  ) => treatAsOutput(args),
  alert: (
    objectNode: TS.LeftHandSideExpression,
    args: ExpressionElement[],
    fullNode: TS.Node
  ) => treatAsOutput(args),
  prompt: (
    objectNode: TS.LeftHandSideExpression,
    args: ExpressionElement[],
    fullNode: TS.Node
  ) => treatAsInput(args),
};

export function handleCallExpression(node: TS.Node): ProcedureCall {
  if (!TS.Node.isCallExpression(node)) {
    throw new Error("Node is not a Call Expression");
  }

  const expression = node.getExpression();
  const args = node.getArguments().map((arg) => processNode(arg));
  const callExpressionText = expression.getText();

  // Special case for array methods like push, pop, splice
  if (TS.Node.isPropertyAccessExpression(expression)) {
    const methodName = expression.getName(); // Get the property name (method name)
    const objectNode = expression.getExpression(); // Get the object the property is being accessed on
    if (methodHandlers[methodName]) {
      let val = methodHandlers[methodName](objectNode, args, node);
      if (val) {
        return val;
      }
    }
  }

  // Special case for console.log and window.alert
  // Default case for other call expressions
  return {
    element: "procedureCall",
    name: callExpressionText,
    args,
  };
}

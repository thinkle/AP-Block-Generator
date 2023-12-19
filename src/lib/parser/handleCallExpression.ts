import * as TS from "ts-morph";
import type { ProcedureCall, ExpressionElement } from "../pseudocode";
import { processNode } from ".";

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
  push: (
    objectNode: TS.LeftHandSideExpression,
    args: ExpressionElement[],
    fullNode: TS.Node
  ) => {
    return {
      name: "APPEND",
      args: [processNode(objectNode), args[0] || { element: "empty" }],
      element: "procedureCall",
    };
  },
  splice: (
    objectNode: TS.LeftHandSideExpression,
    args: ExpressionElement[],
    fullNode: TS.Node
  ) => {
    // Create a special node for the index
    const indexElement = { element: "listIndexElement", value: args[0] };

    // Check for the remove operation
    if (args.length === 2 && args[1].value === "1") {
      return {
        element: "procedureCall",
        name: "REMOVE",
        args: [processNode(objectNode), indexElement],
      };
    }
    // Check for the insert operation
    else if (args.length > 2 && args[1].value === "0") {
      // Map all inserted items (third argument onwards) to the APCSP insert operation
      const inserts = args.slice(2).map((item) => ({
        element: "procedureCall",
        name: "INSERT",
        args: [processNode(objectNode), indexElement, item],
      }));
      // If there are multiple inserts, handle them as multiple insert operations
      return inserts.length === 1 ? inserts[0] : inserts;
    } else {
      return false;
    }
  },
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

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
import {
  push,
  splice,
  forEach,
  map,
  filter,
  reduce,
  find,
  includes,
  every,
  some,
} from "./listMethods";
import { substring, toLowerCase, toUpperCase } from "./stringMethods";

const treatAsDISPLAY = (args: ExpressionElement[]) => ({
  name: "DISPLAY",
  args,
  element: "procedureCall",
});
const treatAsInput = (args: ExpressionElement[]) => ({
  name: "INPUT",
  args,
  element: "procedureCall",
});
const treatAsTurnLeft = (args: ExpressionElement[]) => ({
  name: "TURN_LEFT",
  args,
  element: "procedureCall",
});
const treatAsTurnRight = (args: ExpressionElement[]) => ({
  name: "TURN_RIGHT",
  args,
  element: "procedureCall",
});
const treatAsForward = (args: ExpressionElement[]) => ({
  name: "MOVE_FORWARD",
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
  find,
  some,
  includes,
  every,
  /* String methods */
  substring,
  substr: substring,
  toLowerCase,
  toUpperCase,
  /* Window methods and console methods... */
  log: (
    objectNode: TS.LeftHandSideExpression,
    args: ExpressionElement[],
    fullNode: TS.Node
  ) => treatAsDISPLAY(args),
  alert: (
    objectNode: TS.LeftHandSideExpression,
    args: ExpressionElement[],
    fullNode: TS.Node
  ) => treatAsDISPLAY(args),
  prompt: (
    objectNode: TS.LeftHandSideExpression,
    args: ExpressionElement[],
    fullNode: TS.Node
  ) => treatAsInput(args),
  left: (
    objectNode: TS.LeftHandSideExpression,
    args: ExpressionElement[],
    fullNode: TS.Node
  ) => treatAsTurnLeft(args),
  right: (
    objectNode: TS.LeftHandSideExpression,
    args: ExpressionElement[],
    fullNode: TS.Node
  ) => treatAsTurnRight(args),
  forward: (
    objectNode: TS.LeftHandSideExpression,
    args: ExpressionElement[],
    fullNode: TS.Node
  ) => treatAsForward(args),
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
  let expressionName = callExpressionText;
  if (callExpressionText === "left") {
    expressionName = "ROTATE_LEFT";
  } else if (callExpressionText === "right") {
    expressionName = "ROTATE_RIGHT";
  } else if (callExpressionText == "forward") {
    expressionName = "MOVE_FORWARD";
  } else if (callExpressionText == "canMove") {
    expressionName = "CAN_MOVE";
  } else if (callExpressionText == "randInt") {
    expressionName = "RANDOM_INT";
  }

  // Special case for console.log and window.alert
  // Default case for other call expressions
  return {
    element: "procedureCall",
    name: expressionName,
    args,
  };
}

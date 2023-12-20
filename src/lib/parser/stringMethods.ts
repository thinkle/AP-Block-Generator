import * as TS from "ts-morph";
import type { ExpressionElement } from "../pseudocode";
import { getStatementFromJS } from "./utils/getStatementFromJS";
import { processNode } from ".";

export const toUpperCase = (
  objectNode: TS.LeftHandSideExpression,
  args: ExpressionElement[],
  fullNode: TS.Node
) => {
  let js = `UPPER(${objectNode.getText()})`;
  let transformedNode = getStatementFromJS(js);
  let node = processNode(transformedNode);
  if (Array.isArray(node)) {
    node = node[0];
  }
  return node;
};
export const toLowerCase = (
  objectNode: TS.LeftHandSideExpression,
  args: ExpressionElement[],
  fullNode: TS.Node
) => {
  let js = `LOWER(${objectNode.getText()})`;
  let transformedNode = getStatementFromJS(js);
  let node = processNode(transformedNode);
  if (Array.isArray(node)) {
    node = node[0];
  }
  return node;
};
export const substring = (
  objectNode: TS.LeftHandSideExpression,
  args: ExpressionElement[],
  fullNode: TS.Node
) => {
  let fullArgs = fullNode.getArguments();
  let js = `SLICE(${objectNode.getText()},${fullArgs
    .map((arg) => arg.getText())
    .join(",")})`;
  let transformedNode = getStatementFromJS(js);
  let node = processNode(transformedNode);
  if (Array.isArray(node)) {
    node = node[0];
  }
  if (node.args) {
    node.args = node.args.map((arg, i) => {
      if (i > 0) {
        return {
          element: "listIndexElement",
          value: arg,
        };
      } else {
        return arg;
      }
    });
  }
  return node;
};

import * as TS from "ts-morph";
import type { Variable } from "./pseudocode";

export function handleIdentifier(node: TS.Node): Variable {
  if (!TS.Node.isIdentifier(node)) {
    throw new Error("Node is not an Identifier");
  }

  return {
    element: "variable",
    name: node.getText(),
  };
}

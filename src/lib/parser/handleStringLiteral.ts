import * as TS from "ts-morph";
import type { Value } from "./pseudocode";

export function handleStringLiteral(node: TS.StringLiteral): Value {
  if (!TS.Node.isStringLiteral(node)) {
    throw new Error("Node is not a String Literal");
  }

  return {
    element: "value",
    type: "string",
    value: node.getLiteralValue(),
  };
}

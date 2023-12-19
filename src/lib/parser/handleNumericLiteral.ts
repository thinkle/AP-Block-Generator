import * as TS from "ts-morph";
import type { Value } from "./pseudocode";

export function handleNumericLiteral(node: TS.NumericLiteral): Value {
  if (!TS.Node.isNumericLiteral(node)) {
    throw new Error("Node is not a Numeric Literal");
  }

  return {
    element: "value",
    type: "number",
    value: node.getLiteralValue().toString(),
  };
}

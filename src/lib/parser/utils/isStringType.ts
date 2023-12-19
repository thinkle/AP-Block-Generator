import * as TS from "ts-morph";

export function isStringType(node: TS.Node): boolean {
  // You can use type checker to determine if the node is a string
  const typeChecker = node.getSourceFile().getProject().getTypeChecker();
  const type = typeChecker.getTypeAtLocation(node);
  return type.getApparentType().getText() === "String";
}

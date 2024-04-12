import * as TS from "ts-morph";
import type {
  ProcedureDefinition,
  EmptyNode,
  MathExpression,
} from "./pseudocode";
import { handleArrowFunction } from "./handleArrowFunction";
import { processNode, ASSIGN } from ".";

export function handleVariableDeclaration(
  node: TS.Node
): MathExpression | ProcedureDefinition | EmptyNode {
  const variableDeclaration = node.asKind(TS.SyntaxKind.VariableDeclaration);
  if (!variableDeclaration) throw new Error("Not a variable declaration");
  const varName = variableDeclaration.getName();

  // Check if the initializer is an arrow function
  const initializer = variableDeclaration.getInitializer();
  if (initializer && initializer.getKind() === TS.SyntaxKind.ArrowFunction) {
    // Handle arrow function and return a ProcedureDefinition
    return handleArrowFunction(varName, initializer);
  } else if (initializer) {
    return {
      element: "mathExpression",
      left: {
        element: "variable",
        name: varName,
      },
      right: processNode(initializer),
      operator: ASSIGN,
    };
  } else {
    return {
      element: "empty",
    };
  }
}

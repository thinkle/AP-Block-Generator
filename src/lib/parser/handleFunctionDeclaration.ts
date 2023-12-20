import * as TS from "ts-morph";
import type { ProcedureDefinition, StatementElement } from "./pseudocode";
import { processNode } from ".";
import { getUniqueName } from "./getUniqueName";

export function handleFunctionDeclaration(node: TS.Node): ProcedureDefinition {
  const functionDeclaration = node.asKind(TS.SyntaxKind.FunctionDeclaration);
  if (!functionDeclaration) throw new Error("Not a function declaration");

  const name = functionDeclaration.getName() ?? "";
  const args = functionDeclaration
    .getParameters()
    .map((param) => param.getName());

  const bodyNodes = functionDeclaration.getBody()?.getStatements() ?? [];
  const steps: StatementElement[] = bodyNodes.map((node) => processNode(node));

  return {
    element: "procedureDefinition",
    name,
    args,
    body: {
      element: "block",
      children: steps,
    },
  };
}

export function handleFunctionExpression(node: TS.FunctionExpression) {
  const functionExpression = node.asKind(TS.SyntaxKind.FunctionExpression);
  if (!functionExpression) throw new Error("Not a function expression");
  let args = functionExpression.getParameters().map((param) => param.getName());
  let bodyNodes = functionExpression.getBody()?.getStatements() ?? [];
  let steps: StatementElement[] = bodyNodes.map((node) => processNode(node));
  let name = getUniqueName("anonymousFunction", node);
  return [
    { element: "variable", name },
    { element: "breakOut", direction: "before" },
    {
      element: "procedureDefinition",
      name,
      args,
      body: {
        element: "block",
        children: steps,
      },
    },
  ];
}

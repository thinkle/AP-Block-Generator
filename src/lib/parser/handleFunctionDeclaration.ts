import * as TS from "ts-morph";
import type { ProcedureDefinition, StatementElement } from "./pseudocode";
import { processNode } from ".";

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

import * as TS from "ts-morph";
import type { ProcedureDefinition, StatementElement } from "./pseudocode";
import type { Expression } from "@ts-morph/common/lib/typescript";
import { processNode } from ".";
import { getUniqueName } from "./getUniqueName";

export function handleAnonymousArrowFunction(initializer: TS.ArrowFunction) {
  let name = getUniqueName("anonymousFunction", initializer);
  let definition = handleArrowFunction(name, initializer);
  return [
    { element: "variable", name },
    { element: "breakOut", direction: "before" },
    definition,
  ];
}

export function handleArrowFunction(
  name: string,
  initializer: TS.ArrowFunction
): ProcedureDefinition {
  const args = initializer.getParameters().map((param) => param.getName());
  let steps: StatementElement[];
  const functionBody = initializer.getBody();
  if (TS.Node.isBlock(functionBody)) {
    steps = functionBody
      .getStatements()
      .map((node) => processNode(node)) as StatementElement[];
  } else {
    steps = [
      {
        element: "returnStatement",
        value: processNode(functionBody),
      },
    ];
  }
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

import * as TS from "ts-morph";

export function resetNames() {
  while (namesCreated.length > 0) {
    namesCreated.pop();
  }
}
let namesCreated: string[] = [];
export function getUniqueName(name: string, node: Node): string {
  let uniqueName = name;
  let counter = 1;

  // Retrieve the source file from the provided node
  const sourceFile = node.getSourceFile();

  // Retrieve all identifiers in the source file
  const identifiers = sourceFile.getDescendantsOfKind(TS.SyntaxKind.Identifier);

  // Check if the name is unique
  while (
    identifiers.some((identifier) => identifier.getText() === uniqueName) ||
    namesCreated.includes(uniqueName)
  ) {
    uniqueName = `${name}${counter}`;
    counter++;
  }
  namesCreated.push(uniqueName);
  return uniqueName;
}

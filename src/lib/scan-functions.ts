import { FunctionDeclaration, Project } from "ts-morph";

export function getExportedFunctions(filePath: string) {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);
  const exports = sourceFile.getExportedDeclarations();
  let exportedFunctions: {
    [key: string]: {
      args: string;
      returnType: string;
    };
  } = {};

  exports.forEach((nodes, name) => {
    nodes.forEach((node) => {
      if (node.getKindName() === "FunctionDeclaration") {
        const functionDecl = node as FunctionDeclaration;
        const parameters = functionDecl.getParameters();
        const parameterStrings = parameters.map((param) => {
          return `${param.getName()}: ${param.getType().getText()}`;
        });

        const args = parameterStrings.join(", ");
        const returnType = functionDecl.getReturnType().getText();
        exportedFunctions[name] = { args, returnType };
      }
    });
  });

  return exportedFunctions;
}
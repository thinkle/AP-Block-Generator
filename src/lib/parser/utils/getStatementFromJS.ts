import * as TS from "ts-morph";

export function getStatementFromJS(JSExpression: string): TS.Expression {
  const project = new TS.Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile("temp.ts", JSExpression, {
    overwrite: true,
  });
  return sourceFile.getStatements()[0] as TS.Expression;
}

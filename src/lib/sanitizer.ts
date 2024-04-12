import { Project, SyntaxKind } from "ts-morph";

export const sanitize = (code: string): string => {
  const project = new Project({ useInMemoryFileSystem: true });
  // Create a temporary source file in the project from the provided code
  const sourceFile = project.createSourceFile("tempFile.ts", code);
  // Initialize a counter to keep track of loops
  let loopCount = 0;

  // Function to traverse the AST and inject 'checkForInfinite(loopId);' into each loop
  sourceFile.forEachDescendant((node) => {
    // Check if the node is a loop statement
    if (
      [
        SyntaxKind.ForStatement,
        SyntaxKind.WhileStatement,
        SyntaxKind.DoStatement,
      ].includes(node.getKind())
    ) {
      // Generate a unique ID for the loop
      const loopId = loopCount++;
      // Determine if the loop body is already a block statement
      const isBlock = node.getStatement()?.getKind() === SyntaxKind.Block;

      if (isBlock) {
        // If the body is a block, insert 'checkForInfinite(loopId);' at the beginning
        node.getStatement().insertStatements(0, `checkForInfinite(${loopId});`);
      } else {
        // If the body is not a block (a single statement), replace it with a block containing 'checkForInfinite(loopId);' and the original statement
        const originalStatement = node.getStatement();
        node.replaceWithText(
          `{ checkForInfinite(${loopId}); ${originalStatement?.getText()} }`
        );
      }
    }
  });

  // Return the modified code as a string
  return sourceFile.getFullText();
};

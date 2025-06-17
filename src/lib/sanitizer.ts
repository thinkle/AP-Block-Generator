import {
  Project,
  SyntaxKind,
  Node,
  FunctionDeclaration,
  FunctionExpression,
  ArrowFunction,
  CallExpression,
} from "ts-morph";

// Primitives whose calls must be awaited
const ASYNC_PRIMITIVES = ["INPUT", "input", "prompt"];

/** Resolve the ‘name’ of a function – including arrow functions assigned to a variable */
function getFunctionName(
  fn: FunctionDeclaration | FunctionExpression | ArrowFunction
): string | undefined {
  if (Node.isFunctionDeclaration(fn) || Node.isFunctionExpression(fn)) {
    return fn.getName();
  }
  // Arrow function:  const foo = () => { … }
  const parent = fn.getParent();
  if (Node.isVariableDeclaration(parent) || Node.isPropertyAssignment(parent)) {
    return parent.getName();
  }
  return undefined;
}

export const sanitize = (code: string): string => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile("tempFile.ts", code, {
    overwrite: true,
  });

  /* ─────────────────────────── 1.---Infinite-loop guard ────────────────────────── */
  let loopId = 0;
  sourceFile.forEachDescendant((n) => {
    if (
      [
        SyntaxKind.ForStatement,
        SyntaxKind.WhileStatement,
        SyntaxKind.DoStatement,
      ].includes(n.getKind())
    ) {
      const body = (n as any).getStatement?.();
      if (!body) return;

      const id = loopId++;
      if (Node.isBlock(body)) {
        body.insertStatements(0, `checkForInfinite(${id});`);
      } else {
        // single-line loop body → wrap in a block
        n.replaceWithText(`{ checkForInfinite(${id}); ${body.getText()} }`);
      }
    }
  });

  /* ─────────────────────────── 2.---Mark async functions ───────────────────────── */
  const asyncFns = new Set<string>();
  let changed = true;

  while (changed) {
    changed = false;
    sourceFile.forEachDescendant((n) => {
      if (
        Node.isFunctionDeclaration(n) ||
        Node.isFunctionExpression(n) ||
        Node.isArrowFunction(n)
      ) {
        const fn = n as
          | FunctionDeclaration
          | FunctionExpression
          | ArrowFunction;
        const name = getFunctionName(fn);
        let needsAsync = false;

        fn.forEachDescendant((d) => {
          if (Node.isAwaitExpression(d)) needsAsync = true;
          if (Node.isCallExpression(d)) {
            const callee = d.getExpression().getText();
            if (ASYNC_PRIMITIVES.includes(callee) || asyncFns.has(callee))
              needsAsync = true;
          }
        });

        if (needsAsync && name && !asyncFns.has(name)) {
          asyncFns.add(name);
          changed = true;
        }
      }
    });
  }

  /* ─────────────────────────── 3.---Add `async` keyword ────────────────────────── */
  sourceFile.forEachDescendant((n) => {
    if (
      Node.isFunctionDeclaration(n) ||
      Node.isFunctionExpression(n) ||
      Node.isArrowFunction(n)
    ) {
      const fn = n as FunctionDeclaration | FunctionExpression | ArrowFunction;
      const name = getFunctionName(fn);
      if (name && asyncFns.has(name) && !fn.isAsync()) fn.setIsAsync(true);
    }
  });

  /* ─────────────────────────── 4.---Prefix async calls with await ───────────────── */
  sourceFile.forEachDescendant((n) => {
    if (!Node.isCallExpression(n)) return;

    const callee = n.getExpression().getText();
    if (!ASYNC_PRIMITIVES.includes(callee) && !asyncFns.has(callee)) return;

    // Already awaited?
    if (Node.isAwaitExpression(n.getParent())) return;

    // Preserve precedence
    n.replaceWithText(`(await ${n.getText()})`);
  });

  /* ─────────────────────────── 5.---Wrap top-level in async IIFE ────────────────── */
  const wrapped = `(async () => {\n${sourceFile.getFullText()}\n})().catch(e => console.error('Error: ' + e));`;
  return wrapped;
};

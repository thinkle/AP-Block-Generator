import * as TS from "ts-morph";
import type {
  ProcedureDefinition,
  CodeElement,
  Variable,
  Assignment,
  EmptyNode,
  ProcedureCall,
  Value,
  MathExpression,
  WhileLoopExpression,
  ForEachExpression,
  IfStatement,
  ReturnStatement,
  List,
  ExpressionElement,
  StatementElement,
  GenericForExpression,
  RepeatExpression,
  Block,
  AnyElement,
} from "./pseudocode";
import type { Expression } from "@ts-morph/common/lib/typescript";
import MathExpression from "../components/APCSP/MathExpression.svelte";

type NodeHandler = (node: TS.Node) => AnyElement;
const ASSIGN = "←";
export function parseCode(code: string): AnyElement {
  const project = new TS.Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile("temp.ts", code);
  try {
    let result = processNode(sourceFile, nodeHandlers);
    if (Array.isArray(result)) {
      return {
        element: "code",
        children: result,
      };
    } else {
      return result;
    }
  } catch (err) {
    console.log("Error processing code", err);
    console.log("Code was: ", code);
    return {
      element: "empty",
    };
  }
}

/******************************************************************************
 *   Map all of our handlers!                                                 *
 *
 *
 *   This is the map you'll need to modify to add new parsing features!
 *
 *
 ********************/

// Handlers for different node types

const nodeHandlers: Record<TS.SyntaxKind, NodeHandler> = {
  [TS.SyntaxKind.FunctionDeclaration]: handleFunctionDeclaration,
  [TS.SyntaxKind.VariableDeclaration]: handleVariableDeclaration,
  [TS.SyntaxKind.Identifier]: handleIdentifier,
  [TS.SyntaxKind.StringLiteral]: handleStringLiteral,
  [TS.SyntaxKind.NumericLiteral]: handleNumericLiteral,
  [TS.SyntaxKind.BinaryExpression]: handleBinaryExpression,
  [TS.SyntaxKind.CallExpression]: handleCallExpression,
  [TS.SyntaxKind.IfStatement]: handleIfStatement,
  [TS.SyntaxKind.ArrayLiteralExpression]: handleArrayLiteralExpression,
  [TS.SyntaxKind.ForStatement]: handleForLoop,
  [TS.SyntaxKind.ForOfStatement]: handleForOfLoop,
  [TS.SyntaxKind.Block]: handleBlock,
  [TS.SyntaxKind.ElementAccessExpression]: handleListIndex,
  [TS.SyntaxKind.PropertyAccessExpression]: handlePropertyAccessExpression,
  [TS.SyntaxKind.PrefixUnaryExpression]: handlePrefixUnaryExpression,
  [TS.SyntaxKind.PostfixUnaryExpression]: handlePostfixUnaryExpression,
  [TS.SyntaxKind.TrueKeyword]: () => ({
    element: "value",
    type: "boolean",
    value: "true",
  }),
  [TS.SyntaxKind.FalseKeyword]: () => ({
    element: "value",
    type: "boolean",
    value: "false",
  }),
  // ... Add more handlers as needed
};

function processNode(
  node: TS.Node,
  handlers: Record<TS.SyntaxKind, NodeHandler> = nodeHandlers
): CodeElement | CodeElement[] {
  const handler = handlers[node.getKind()];
  if (handler) {
    return handler(node);
  } else {
    if (shouldFlatten(node)) {
      return node.getChildren().flatMap((child) => processNode(child));
    } else {
      return {
        element: node.getKindName(),
        children: node
          .getChildren()
          .map((child) => processNode(child, handlers)),
      };
    }
  }
}

function shouldFlatten(node: TS.Node): boolean {
  // Add logic to determine if the node is of a type that should be flattened
  return [
    TS.SyntaxKind.SyntaxList,
    TS.SyntaxKind.VariableDeclarationList,
    TS.SyntaxKind.VariableStatement,
    TS.SyntaxKind.ConstKeyword,
    TS.SyntaxKind.LetKeyword,
    TS.SyntaxKind.VarKeyword,
    TS.SyntaxKind.SourceFile,
    TS.SyntaxKind.ExpressionStatement,
    TS.SyntaxKind.SemicolonToken,
    TS.SyntaxKind.EndOfFileToken,
    // Add other kinds as needed
  ].includes(node.getKind());
}

function handleFunctionDeclaration(node: TS.Node): ProcedureDefinition {
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

function handleArrowFunction(
  name: string,
  initializer: Expression
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

function handleVariableDeclaration(
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
    console.log("Ignoring uninitialized variable!", varName);
    return {
      element: "empty",
    };
  }
}

function handleStringLiteral(node: TS.StringLiteral): Value {
  if (!TS.Node.isStringLiteral(node)) {
    throw new Error("Node is not a String Literal");
  }

  return {
    element: "value",
    type: "string",
    value: node.getLiteralValue(),
  };
}

function handleNumericLiteral(node: TS.NumericLiteral): Value {
  if (!TS.Node.isNumericLiteral(node)) {
    throw new Error("Node is not a Numeric Literal");
  }

  return {
    element: "value",
    type: "number",
    value: node.getLiteralValue().toString(),
  };
}

/* Can we add correct type definitions here  - these will all return ProcedureCall */

const treatAsOutput = (args: ExpressionElement[]) => ({
  name: "OUTPUT",
  args,
  element: "procedureCall",
});
const treatAsInput = (args: ExpressionElement[]) => ({
  name: "INPUT",
  args,
  element: "procedureCall",
});

const methodHandlers = {
  push: (
    objectNode: TS.LeftHandSideExpression,
    args: ExpressionElement[],
    fullNode: TS.Node
  ) => {
    return {
      name: "APPEND",
      args: [processNode(objectNode), args[0] || { element: "empty" }],
      element: "procedureCall",
    };
  },
  splice: (
    objectNode: TS.LeftHandSideExpression,
    args: ExpressionElement[],
    fullNode: TS.Node
  ) => {
    // Create a special node for the index
    const indexElement = { element: "listIndexElement", value: args[0] };

    // Check for the remove operation
    if (args.length === 2 && args[1].value === "1") {
      return {
        element: "procedureCall",
        name: "REMOVE",
        args: [processNode(objectNode), indexElement],
      };
    }
    // Check for the insert operation
    else if (args.length > 2 && args[1].value === "0") {
      // Map all inserted items (third argument onwards) to the APCSP insert operation
      const inserts = args.slice(2).map((item) => ({
        element: "procedureCall",
        name: "INSERT",
        args: [processNode(objectNode), indexElement, item],
      }));
      // If there are multiple inserts, handle them as multiple insert operations
      return inserts.length === 1 ? inserts[0] : inserts;
    } else {
      return false;
    }
  },
  log: (
    objectNode: TS.LeftHandSideExpression,
    args: ExpressionElement[],
    fullNode: TS.Node
  ) => treatAsOutput(args),
  alert: (
    objectNode: TS.LeftHandSideExpression,
    args: ExpressionElement[],
    fullNode: TS.Node
  ) => treatAsOutput(args),
};

function handleCallExpression(node: TS.Node): ProcedureCall {
  if (!TS.Node.isCallExpression(node)) {
    throw new Error("Node is not a Call Expression");
  }

  const expression = node.getExpression();
  const args = node.getArguments().map((arg) => processNode(arg));
  const callExpressionText = expression.getText();

  // Special case for array methods like push, pop, splice
  if (TS.Node.isPropertyAccessExpression(expression)) {
    const methodName = expression.getName(); // Get the property name (method name)
    const objectNode = expression.getExpression(); // Get the object the property is being accessed on
    if (methodHandlers[methodName]) {
      let val = methodHandlers[methodName](objectNode, args, node);
      if (val) {
        return val;
      }
    }
  }

  // Special case for console.log and window.alert

  // Default case for other call expressions
  return {
    element: "procedureCall",
    name: callExpressionText,
    args,
  };
}

function handleBinaryExpression(node: TS.Node): MathExpression {
  if (!TS.Node.isBinaryExpression(node)) {
    throw new Error("Node is not a Binary Expression");
  }
  debugger;
  const left = processNode(node.getLeft()) as ExpressionElement;
  const operator = node.getOperatorToken().getText();
  const right = processNode(node.getRight()) as ExpressionElement;

  if (operator.length == 2 && operator[1] == "=") {
    console.log("Long operator", operator);
    let apCspOperator = translateOperator(operator[0]);
    return {
      element: "mathExpression",
      operator: ASSIGN,
      left,
      right: {
        element: "mathExpression",
        left,
        operator: apCspOperator,
        right,
      },
    };
  }

  // Translate TypeScript operators to APCSP-style operators if needed
  const apCspOperator = translateOperator(operator);

  return {
    element: "mathExpression",
    operator: apCspOperator,
    left,
    right,
  };
}
function translateOperatorToken(token: number): string {
  switch (token) {
    case TS.SyntaxKind.ExclamationToken:
      return "not";
    case TS.SyntaxKind.MinusToken:
      return "-";
    case TS.SyntaxKind.PlusToken:
      return "";
    default:
      return "?";
  }
}

function translateOperator(operator: string): string {
  switch (operator) {
    case "===":
    case "==":
      return "=";
    case "!==":
    case "!=":
      return "≠";
    // Add cases for other TypeScript operators if needed
    case ">=":
      return "≥";
    case "<=":
      return "≤";
    case "&&":
      return "and";
    case "||":
      return "or";
    case "=":
      return "←";
    default:
      return operator;
  }
}
function handleIfStatement(node: TS.Node): IfStatement {
  if (!TS.Node.isIfStatement(node)) {
    throw new Error("Node is not an If Statement");
  }

  const condition = node.getExpression(); // Get the condition expression
  const thenStatement = node.getThenStatement(); // Get the 'then' block
  const elseStatement = node.getElseStatement(); // Get the 'else' block, if present

  return {
    element: "ifStatement",
    condition: processNode(condition),
    consequent: processNode(thenStatement),
    alternate: elseStatement && processNode(elseStatement),
  };
}

function handleArrayLiteralExpression(node: TS.Node): List {
  if (!TS.Node.isArrayLiteralExpression(node)) {
    throw new Error("Node is not an Array Literal Expression");
  }

  const elements = node
    .getElements()
    .map((element) => processNode(element)) as ExpressionElement[];

  return {
    element: "value",
    type: "list",
    value: elements,
  };
}

function handleForLoop(
  node: TS.Node
): RepeatExpression | ForEachExpression | GenericForExpression {
  if (!TS.Node.isForStatement(node)) {
    throw new Error("Node is not a For Statement");
  }

  const initializer = node.getInitializer();
  const condition = node.getCondition();
  const incrementor = node.getIncrementor();
  const body = node.getStatement();

  // Check if the loop matches the pattern: for (let i = 0; i < N; i++)
  if (
    TS.Node.isVariableDeclarationList(initializer) &&
    initializer.getDeclarations().length === 1 &&
    condition &&
    TS.Node.isNumericLiteral(condition.getRight()) &&
    TS.Node.isPostfixUnaryExpression(incrementor) &&
    incrementor.getOperatorToken() === TS.SyntaxKind.PlusPlusToken
  ) {
    const n = parseInt(condition.getRight().getText());
    return {
      element: "repeatN",
      n: n,
      body: [processNode(node.getStatement())],
    };
  } else {
    return {
      element: "genericFor",
      initializer: initializer ? processNode(initializer) : undefined,
      condition: condition ? processNode(condition) : undefined,
      incrementor: incrementor ? processNode(incrementor) : undefined,
      body: [processNode(node.getStatement())],
    };
  }
}

function handleForOfLoop(node: TS.ForOfStatement): ForEachExpression {
  // Check for a for...of loop

  if (!TS.Node.isForOfStatement(node)) {
    throw new Error("Node is not a For...Of Statement");
  }
  const iterable = processNode(node.getExpression());
  let initializer = node.getInitializer();
  let declaration = initializer.getDeclarations()[0];
  let itemVariable = declaration.getName();

  // How do I get the itemVariable?

  return {
    initializer: processNode(node.getInitializer()),
    element: "forEach",
    list: iterable as Variable | List,
    itemVariable,
    body: [processNode(node.getStatement())],
  };
}

function handleBlock(node: TS.Node): Block {
  if (!TS.Node.isBlock(node)) {
    throw new Error("Node is not a Block");
  }

  // Process each statement in the block
  const children: StatementElement[] = node.getStatements().map((statement) => {
    return processNode(statement) as StatementElement;
  });

  return {
    element: "block",
    children,
  };
}

function handleIdentifier(node: TS.Node): Variable {
  if (!TS.Node.isIdentifier(node)) {
    throw new Error("Node is not an Identifier");
  }

  return {
    element: "variable",
    name: node.getText(),
  };
}

function ignore(node: TS.Node): EmptyNode {
  return {
    element: "empty",
  };
}

function handleListIndex(node: TS.ElementAccessExpression): ListIndex {
  if (!TS.Node.isElementAccessExpression(node)) {
    throw new Error("Node is not an Element Access Expression");
  }

  const expression = node.getExpression(); // The list being accessed
  const argumentExpression = node.getArgumentExpression(); // The index expression

  if (!argumentExpression) {
    throw new Error("Element access expression lacks an index argument");
  }

  return {
    element: "listIndex",
    list: processNode(expression) as Variable | List, // Your processNode should be able to handle TS.Node types to Variable or List
    index: processNode(argumentExpression) as ExpressionElement, // Now index is processed as a general expression
  };
}

function handlePropertyAccessExpression(
  node: TS.Node
): ProcedureCall | Variable {
  if (!TS.Node.isPropertyAccessExpression(node)) {
    throw new Error("Node is not a Property Access Expression");
  }

  const expression = node.getExpression();
  const name = node.getName();

  // Special handling for the 'length' property
  if (name === "length") {
    return {
      element: "procedureCall",
      name: "LENGTH",
      args: [processNode(expression)], // processNode should return a Variable or List
    };
  }

  // Default case, treat the entire property access as a variable name
  return {
    element: "variable",
    name: `${expression.getText()}.${name}`, // This assumes processNode returns a string for the object name
  };
}

function handlePrefixUnaryExpression(
  node: TS.PrefixUnaryExpression
): MathExpression {
  if (!TS.Node.isPrefixUnaryExpression(node)) {
    throw new Error("Node is not a Prefix Unary Expression");
  }
  console.log("Handle unary", node);
  const operator = node.getOperatorToken();
  const operand = processNode(node.getOperand());

  return {
    element: "mathExpression",
    operator: translateOperatorToken(operator),
    left: {
      element: "empty",
    },
    right: operand,
  };
}

function handlePostfixUnaryExpression(
  node: TS.PostfixUnaryExpression
): MathExpression {
  if (!TS.Node.isPostfixUnaryExpression(node)) {
    throw new Error("Node is not a Postfix Unary Expression");
  }

  const operatorToken = node.getOperatorToken();
  const operand = processNode(node.getOperand());
  if (
    operatorToken == TS.SyntaxKind.PlusPlusToken ||
    operatorToken == TS.SyntaxKind.MinusMinusToken
  ) {
    const operator = operatorToken == TS.SyntaxKind.PlusPlusToken ? "+" : "-";
    return {
      element: "mathExpression",
      operator: ASSIGN,
      left: operand,
      right: {
        element: "mathExpression",
        operator,
        left: operand,
        right: {
          element: "value",
          type: "number",
          value: "1",
        },
      },
    };
  }
}

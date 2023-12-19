import * as TS from "ts-morph";
import type {
  ProcedureCall,
  ExpressionElement,
  Value,
  ForEachExpression,
  Block,
  MathExpression,
  ReturnStatement,
  StatementElement,
  AnyElement,
  List,
} from "../pseudocode";
import { ASSIGN, processNode } from ".";
import { handleArrowFunction } from "./handleArrowFunction";
import { handleFunctionDeclaration } from "./handleFunctionDeclaration";

export const push = (
  objectNode: TS.LeftHandSideExpression,
  args: ExpressionElement[],
  fullNode: TS.Node
) => {
  return {
    name: "APPEND",
    args: [processNode(objectNode), args[0] || { element: "empty" }],
    element: "procedureCall",
  };
};

export const splice = (
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
};

export const forEach = (
  objectNode: TS.LeftHandSideExpression,
  args: ExpressionElement[],
  fullNode: TS.CallExpression
): ForEachExpression | ProcedureCall | false => {
  if (args.length !== 1) {
    return false;
  }
  let tsArgs = fullNode.getArguments();

  const callbackFunction = tsArgs[0];
  let [body, itemVariableName] = getBodyAndVarFromFunction(callbackFunction);

  return {
    element: "forEach",
    list: processNode(objectNode),
    itemVariable: itemVariableName,
    body,
  };
}; /*  End forEach! */

export const map = (
  objectNode: TS.LeftHandSideExpression,
  args: ExpressionElement[],
  fullNode: TS.CallExpression
) => {
  let mapArg = fullNode.getArguments()[0];

  // Find what's on the "lefthand side" of the map call
  // (e.g. "let doubled = [1,2,3].map(double);")
  // I'll need this to transform subsequent calls to e.g.
  // APPEND(doubled, double(item))
  let {
    leftHandSideVariable,
    addAssignment,
  }: { leftHandSideVariable: string; addAssignment: boolean } =
    getLeftSideVariable(fullNode);

  // Get body and item variable name from the callback function
  // (e.g. "(item) => item * item") gives me
  // item and the block with return item * item;
  let [body, itemVariableName] = getBodyAndVarFromFunction(mapArg);

  /* Change all return statements from function into APPEND statements */
  crawlAndTransformReturnStatements(
    body,
    (node: ReturnStatement | ProcedureCall) => {
      node.element = "procedureCall";
      node.name = "APPEND";
      node.args = [
        {
          element: "variable",
          name: leftHandSideVariable,
        },
        node.value,
      ];
    }
  );

  // We are going to transform ourselves into an empty list
  // so that what was
  // let foo = [1,2,3].map(double);
  // becomes
  // let foo = [];
  // (and then we'll add the loop...)
  let firstItem: List | MathExpression = {
    element: "value",
    type: "list",
    value: [],
  };
  if (addAssignment) {
    firstItem = {
      element: "mathExpression",
      left: {
        element: "variable",
        name: leftHandSideVariable,
      },
      operator: ASSIGN,
      right: {
        element: "value",
        type: "list",
        value: [],
      },
    };
  }

  return [
    firstItem,
    {
      element: "breakOut",
      levelUp: 1,
    },
    {
      element: "forEach",
      list: processNode(objectNode),
      itemVariable: itemVariableName,
      body,
    },
  ];
};

export const filter = (
  objectNode: TS.LeftHandSideExpression,
  args: ExpressionElement[],
  fullNode: TS.CallExpression
) => {
  let filterArg = fullNode.getArguments()[0];

  // Same as for 'map', we need to know where the result of 'filter' is being stored
  let {
    leftHandSideVariable,
    addAssignment,
  }: { leftHandSideVariable: string; addAssignment: boolean } =
    getLeftSideVariable(fullNode);

  // Get body and item variable name from the filter function
  let [body, itemVariableName] = getBodyAndVarFromFunction(filterArg);

  /* Change all return statements from function into conditional APPEND statements */
  crawlAndTransformReturnStatements(
    body,
    (node: ReturnStatement | ProcedureCall) => {
      node.element = "ifStatement"; // Using an if statement to conditionally append
      node.condition = node.value; // The condition is the return value of the filter callback
      node.consequent = {
        element: "block",
        children: [
          {
            element: "procedureCall",
            name: "APPEND",
            args: [
              {
                element: "variable",
                name: leftHandSideVariable,
              },
              {
                element: "variable",
                name: itemVariableName, // We append the current item being filtered
              },
            ],
          },
        ],
      };
      delete node.value; // Remove the value property as it's now part of the condition
    }
  );

  // Set up the initial empty list for the 'filter' result
  let firstItem: List | MathExpression = {
    element: "value",
    type: "list",
    value: [],
  };
  if (addAssignment) {
    firstItem = {
      element: "mathExpression",
      left: {
        element: "variable",
        name: leftHandSideVariable,
      },
      operator: ASSIGN,
      right: {
        element: "value",
        type: "list",
        value: [],
      },
    };
  }

  // Create the forEach loop structure to iterate and conditionally append items
  return [
    firstItem,
    {
      element: "breakOut",
      levelUp: 1,
    },
    {
      element: "forEach",
      list: processNode(objectNode),
      itemVariable: itemVariableName,
      body,
    },
  ];
};

export const reduce = (
  objectNode: TS.LeftHandSideExpression,
  args: ExpressionElement[],
  fullNode: TS.CallExpression
) => {
  let reduceCallback = fullNode.getArguments()[0];
  let initialValue = fullNode.getArguments()[1]; // The second argument is the initial value for the accumulator

  // Get left-hand side variable name from the parent node or create a unique name
  let { leftHandSideVariable, addAssignment } = getLeftSideVariable(fullNode);

  // Get the body of the reduce function and the names of the accumulator and current item
  let [body, accumulatorVariableName, itemVariableName] =
    getBodyAndVarFromFunction(reduceCallback);

  // Transform return statements in the reduce function body into direct assignments to the accumulator
  crawlAndTransformReturnStatements(
    body,
    (node: ReturnStatement | ProcedureCall) => {
      node.element = "mathExpression";
      node.operator = ASSIGN;
      node.left = {
        element: "variable",
        name: accumulatorVariableName,
      };
      node.right = node.value;
    }
  );

  // If the result of the reduce function is being assigned, ensure we capture that
  return [
    // First off, set our initial value...
    processNode(initialValue),
    {
      element: "breakOut",
      levelUp: 1,
    }, // Then we "break out for the rest..."
    // Assign initial value to accumulator...
    {
      element: "mathExpression",
      operator: ASSIGN,
      left: { element: "variable", name: accumulatorVariableName },
      right: processNode(initialValue) as ExpressionElement,
    },
    {
      element: "forEach",
      list: processNode(objectNode),
      itemVariable: itemVariableName,
      body,
    },
    // Finally, we set our left hand side to the accumulator...
    {
      element: "mathExpression",
      operator: ASSIGN,
      left: { element: "variable", name: leftHandSideVariable },
      right: { element: "variable", name: accumulatorVariableName },
    },
  ];
};

function getBodyAndVarFromFunction(node: TS.Node) {
  let body: Block;
  let itemVariableName: string = "item";
  let secondVariableName: string = "";
  if (TS.Node.isArrowFunction(node)) {
    body = handleArrowFunction("anon", node).body;
    itemVariableName = node.getParameters()[0].getName();
    secondVariableName = node.getParameters()[1]?.getName();
  } else if (TS.Node.isFunctionExpression(node)) {
    let statements = node.getBody()?.getStatements();
    let nodes = statements.map(processNode);
    itemVariableName = node.getParameters()[0].getName();
    secondVariableName = node.getParameters()[1]?.getName();
    body = {
      element: "block",
      children: nodes,
    };
  } else if (TS.Node.isIdentifier(node)) {
    // Named function
    body = {
      element: "block",
      children: [
        {
          element: "returnStatement",
          value: {
            element: "procedureCall",
            name: node.getText(),
            args: [{ element: "variable", name: itemVariableName }],
          },
        },
      ],
    };
  } else if (TS.Node.isPropertyAccessExpression(node)) {
    let functionName = node.getText();
    if (["console.log", "window.alert"].includes(functionName)) {
      functionName = "OUTPUT";
    } else if (["window.prompt"].includes(functionName)) {
      functionName = "INPUT";
    }
    body = {
      element: "block",
      children: [
        {
          element: "returnStatement",
          value: {
            element: "procedureCall",
            name: functionName,
            args: [{ element: "variable", name: itemVariableName }],
          },
        },
      ],
    };
  } else {
    throw new Error("Unsupported callback type");
  }
  return [body, itemVariableName, secondVariableName];
}

function getLeftSideVariable(
  fullNode: TS.CallExpression<TS.ts.CallExpression>
) {
  const binaryExpression = fullNode.getFirstAncestorByKind(
    TS.SyntaxKind.BinaryExpression
  );
  const variableDeclaration = fullNode.getFirstAncestorByKind(
    TS.SyntaxKind.VariableDeclaration
  );
  const elementAccessExpression = fullNode.getFirstAncestorByKind(
    TS.SyntaxKind.ElementAccessExpression
  );
  const propertyAccessExpression = fullNode.getFirstAncestorByKind(
    TS.SyntaxKind.PropertyAccessExpression
  );

  let leftHandSideVariable: string;
  let addAssignment = false;

  if (binaryExpression) {
    leftHandSideVariable = binaryExpression.getLeft().getText();
  } else if (variableDeclaration) {
    leftHandSideVariable = variableDeclaration.getName();
  } else if (elementAccessExpression) {
    leftHandSideVariable = elementAccessExpression.getText();
  } else if (propertyAccessExpression) {
    leftHandSideVariable = propertyAccessExpression.getText();
  } else {
    leftHandSideVariable = generateUniqueVariableName();
    addAssignment = true;
  }
  return { leftHandSideVariable, addAssignment };
}

const crawlAndTransformReturnStatements = (
  node: AnyElement,
  transformer: (statement: ReturnStatement) => void
) => {
  /* Transform all "returnStatements" in node */
  if (node.element === "returnStatement") {
    transformer(node);
  } else if (node.element === "block") {
    /* Crawl sub-blocks */
    node.children.forEach((c) =>
      crawlAndTransformReturnStatements(c, transformer)
    );
  } else if (["forEach", "whileLoop", "repeatN"].includes(node.element)) {
    /* Crawl nested loops */
    crawlAndTransformReturnStatements(node.body, transformer);
  } else if (node.element === "ifStatement") {
    /* Crawl nested if statements */
    crawlAndTransformReturnStatements(node.consequent, transformer);
    if (node.alternate) {
      /* Crawl nested else */
      crawlAndTransformReturnStatements(node.alternate, transformer);
    }
  }
};

function generateUniqueVariableName(): string {
  return "list" + Math.floor(Math.random() * 100000);
}

import * as TS from "ts-morph";
import type {
  ProcedureCall,
  ExpressionElement,
  Value,
  IfStatement,
  ForEachExpression,
  Block,
  MathExpression,
  ReturnStatement,
  ParenthesizedExpression,
  StatementElement,
  AnyElement,
  List,
} from "../pseudocode";
import { ASSIGN, processNode } from ".";
import { handleArrowFunction } from "./handleArrowFunction";
import { handleFunctionDeclaration } from "./handleFunctionDeclaration";
import { get } from "svelte/store";
import { getUniqueName } from "./getUniqueName";

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

  // Get body and item variable name from the callback function
  // (e.g. "(item) => item * item") gives me
  // item and the block with return item * item;
  let [body, itemVariableName] = getBodyAndVarFromFunction(mapArg);
  let leftHandSideVariable = getUniqueName(
    itemVariableName + "sMapping",
    fullNode
  );

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

  // initialize empty list...
  let firstItem = {
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

  return [
    {
      element: "variable",
      name: leftHandSideVariable,
    },
    {
      element: "breakOut",
      direction: "before",
      levelUp: 1,
    },
    firstItem,
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

  // Get body and item variable name from the filter function
  let [body, itemVariableName] = getBodyAndVarFromFunction(filterArg);

  let leftHandSideVariable = getUniqueName(
    "filtered" + itemVariableName[0].toUpperCase() + itemVariableName.slice(1),
    fullNode
  );

  /* Change all return statements from function into conditional APPEND statements */
  crawlAndTransformReturnStatements(
    body,
    (node: ReturnStatement | IfStatement) => {
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
  let initializer = {
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

  // Create the forEach loop structure to iterate and conditionally append items
  return [
    {
      element: "variable",
      name: leftHandSideVariable,
    },
    {
      element: "breakOut",
      direction: "before",
      levelUp: 1,
    },
    initializer,
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
    {
      element: "variable",
      name: accumulatorVariableName,
    },
    {
      element: "breakOut",
      direction: "before",
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
  ];
};

/* Now we handle methods like find/includes/etc */
export const find = (
  objectNode: TS.LeftHandSideExpression,
  args: ExpressionElement[],
  fullNode: TS.CallExpression
) => {
  // grabbing the callable thing from i.e. lst.find(f)
  let [body, itemVariableName] = getBodyAndVarFromFunction(
    fullNode.getArguments()[0]
  );
  // We don't really need the left variable, but we'll use it to generate
  // a function name...
  let leftHandSideVariable = getLeftSideVariable(fullNode).leftHandSideVariable;
  let functionName =
    "find" +
    leftHandSideVariable[0].toUpperCase() +
    leftHandSideVariable.slice(1);
  // Check if functionName already exists in project? If so, append a number
  functionName = getUniqueName(functionName, fullNode);
  // Change all return statements from function into conditional return statements
  crawlAndTransformReturnStatements(
    body,
    (node: ReturnStatement | IfStatement) => {
      node.element = "ifStatement";
      node.condition = node.value;
      node.consequent = {
        element: "block",
        children: [
          {
            element: "returnStatement",
            value: {
              element: "variable",
              name: itemVariableName,
            },
          },
        ],
      };
    }
  );
  // We're constructing a function like this...
  // for each item in list
  //     isItem = false;
  //     BLOCK of previous function, but return statements are replaced with
  //     isItem = RETURNVALUE -- we have a slight problem is the previous function
  //     relied on a falsy return value, but we can probably live with that risk...
  //     if (isItem) return item

  let functionDeclaration = {
    element: "procedureDefinition", // function findX () {...
    name: functionName,
    parameters: [],
    body: {
      element: "block",
      children: [
        {
          element: "forEach", // for each item in list...
          list: processNode(objectNode),
          itemVariable: itemVariableName,
          body, // BLOCK of previous function (will now set isItem)
        }, // end forEach
      ],
    }, // end function body
  }; // end function declaration

  return [
    { element: "procedureCall", name: functionName, args: [] },
    {
      element: "breakOut",
      direction: "before",
    },
    functionDeclaration,
  ];
};

export const includes = (
  objectNode: TS.LeftHandSideExpression,
  args: ExpressionElement[],
  fullNode: TS.CallExpression
) => {
  // grabbing the callable thing from i.e. lst.find(f)

  let includedItem = fullNode.getArguments()[0]?.getText() || "item";
  includedItem = includedItem.replace(/\W/g, "");
  let varName = getUniqueName(
    "includes" + includedItem[0].toUpperCase() + includedItem.slice(1),
    fullNode
  );

  return [
    { element: "variable", name: varName },
    {
      element: "breakOut",
      direction: "before",
    },
    // Initialize variable
    {
      element: "mathExpression",
      operator: ASSIGN,
      left: { element: "variable", name: varName },
      right: {
        element: "value",
        value: "false",
        type: "boolean",
      },
    },
    {
      element: "forEach",
      list: processNode(objectNode),
      itemVariable: "item",
      body: {
        element: "block",
        children: [
          {
            element: "ifStatement",
            condition: {
              element: "mathExpression",
              left: {
                element: "variable",
                name: "item",
              },
              operator: "=",
              right: args[0],
            },
            consequent: {
              element: "block",
              children: [
                {
                  element: "mathExpression",
                  operator: ASSIGN,
                  left: {
                    element: "variable",
                    name: varName,
                  },
                  right: {
                    element: "value",
                    value: "true",
                    type: "boolean",
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ];
};

export const some = (
  objectNode: TS.LeftHandSideExpression,
  args: ExpressionElement[],
  fullNode: TS.CallExpression
) => {
  // grabbing the callable thing from i.e. lst.find(f)
  let [body, itemVariableName] = getBodyAndVarFromFunction(
    fullNode.getArguments()[0]
  );
  // We don't really need the left variable, but we'll use it to generate
  // a function name...
  let leftHandSideVariable = getLeftSideVariable(fullNode).leftHandSideVariable;
  let functionName =
    "find" +
    leftHandSideVariable[0].toUpperCase() +
    leftHandSideVariable.slice(1);
  // Check if functionName already exists in project? If so, append a number
  functionName = getUniqueName(functionName, fullNode);
  // Change all return statements from function into conditional return statements
  crawlAndTransformReturnStatements(
    body,
    (node: ReturnStatement | IfStatement) => {
      node.element = "ifStatement";
      node.condition = node.value;
      node.consequent = {
        element: "returnStatement",
        value: {
          element: "value",
          value: "true",
          type: "boolean",
        },
      };
    }
  );
  // We're constructing a function like this...
  // for each item in list
  //     isItem = false;
  //     BLOCK of previous function, but return statements are replaced with
  //     isItem = RETURNVALUE -- we have a slight problem is the previous function
  //     relied on a falsy return value, but we can probably live with that risk...
  //     if (isItem) return item

  let functionDeclaration = {
    element: "procedureDefinition", // function findX () {...
    name: functionName,
    parameters: [],
    body: {
      element: "block",
      children: [
        {
          element: "forEach", // for each item in list...
          list: processNode(objectNode),
          itemVariable: itemVariableName,
          body: {
            element: "block",
            children: [
              body, // BLOCK of previous function (will now set isItem)
            ],
          }, // end forEach body
        }, // end forEach
      ],
    }, // end function body
  }; // end function declaration

  return [
    { element: "procedureCall", name: functionName, args: [] },
    {
      element: "breakOut",
      direction: "before",
    },
    functionDeclaration,
  ];
};

export const every = (
  objectNode: TS.LeftHandSideExpression,
  args: ExpressionElement[],
  fullNode: TS.CallExpression
) => {
  // grabbing the callable thing from i.e. lst.find(f)
  let [body, itemVariableName] = getBodyAndVarFromFunction(
    fullNode.getArguments()[0]
  );
  // We don't really need the left variable, but we'll use it to generate
  // a function name...
  let leftHandSideVariable = getLeftSideVariable(fullNode).leftHandSideVariable;
  let functionName =
    "find" +
    leftHandSideVariable[0].toUpperCase() +
    leftHandSideVariable.slice(1);
  // Check if functionName already exists in project? If so, append a number
  functionName = getUniqueName(functionName, fullNode);
  // Change all return statements from function into conditional return statements
  crawlAndTransformReturnStatements(
    body,
    (node: ReturnStatement | IfStatement) => {
      node.element = "ifStatement";
      node.condition = {
        element: "mathExpression",
        left: { element: "empty" },
        operator: "NOT",
        right: {
          element: "parentheses",
          expression: node.value,
        },
      };
      node.consequent = {
        element: "block",
        children: [
          {
            element: "returnStatement",
            value: {
              element: "value",
              value: "false",
              type: "boolean",
            },
          },
        ],
      };
    }
  );
  // We're constructing a function like this...
  // for each item in list
  //     isItem = false;
  //     BLOCK of previous function, but return statements are replaced with
  //     isItem = RETURNVALUE -- we have a slight problem is the previous function
  //     relied on a falsy return value, but we can probably live with that risk...
  //     if (isItem) return item

  let functionDeclaration = {
    element: "procedureDefinition", // function findX () {...
    name: functionName,
    parameters: [],
    body: {
      element: "block",
      children: [
        {
          element: "forEach", // for each item in list...
          list: processNode(objectNode),
          itemVariable: itemVariableName,
          body: {
            element: "block",
            children: [
              body, // BLOCK of previous function (will now set isItem)
            ],
          }, // end forEach body
        }, // end forEach
        {
          element: "returnStatement",
          value: {
            element: "value",
            value: "true",
            type: "boolean",
          },
        },
      ],
    }, // end function body
  }; // end function declaration

  return [
    { element: "procedureCall", name: functionName, args: [] },
    {
      element: "breakOut",
      direction: "before",
    },
    functionDeclaration,
  ];
};

function getBodyAndVarFromFunction(node: TS.Node): [Block, string, string] {
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

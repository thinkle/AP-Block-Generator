import * as TS from "ts-morph";
import type {
  ProcedureCall,
  ExpressionElement,
  Value,
  ForEachExpression,
  Block,
} from "../pseudocode";
import { ASSIGN, processNode } from ".";
import { handleArrowFunction } from "./handleArrowFunction";
import { handleFunctionDeclaration } from "./handleFunctionDeclaration";
import type MathExpression from "../../components/APCSP/MathExpression.svelte";

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
  let itemVariableName, bodyNodes;

  if (
    TS.Node.isArrowFunction(callbackFunction) ||
    TS.Node.isFunctionExpression(callbackFunction)
  ) {
    // Arrow function or anonymous function
    const parameters = callbackFunction.getParameters();
    if (parameters.length === 0) {
      throw new Error("Expected at least one parameter in forEach callback");
    }
    itemVariableName = parameters[0].getName();
    // This works if we have a body {} -- but what about a one-liner arrow
    // function? We need to handle that case too.
    if (TS.Node.isBlock(callbackFunction.getBody())) {
      bodyNodes = callbackFunction.getBody().getStatements().map(processNode);
    } else {
      bodyNodes = [processNode(callbackFunction.getBody())];
    }
  } else if (TS.Node.isIdentifier(callbackFunction)) {
    // Named function
    itemVariableName = "item"; // Arbitrary name for item variable
    bodyNodes = [
      {
        element: "procedureCall",
        name: callbackFunction.getText(),
        args: [{ element: "variable", name: itemVariableName }],
      },
    ];
  } else {
    return false; // Unsupported callback type
  }

  return {
    element: "forEach",
    list: processNode(objectNode),
    itemVariable: itemVariableName,
    body: {
      element: "block",
      children: bodyNodes,
    },
  };
}; /*  End forEach! */

export const map = (
  objectNode: TS.LeftHandSideExpression,
  args: ExpressionElement[],
  fullNode: TS.CallExpression
) => {
  let mapArg = fullNode.getArguments()[0];

  // Find what's on the "lefthand side" of the map call
  // I'll need to keep track of this quite a lot...
  // Find the left-hand side of the assignment (if it exists)
  // Find the context of the map call (assignment, variable declaration, etc.)
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
  // We're first going to return an empty list...
  var body: Block;
  let itemVariableName = "item";
  if (TS.Node.isArrowFunction(mapArg)) {
    body = handleArrowFunction("anon", mapArg).body;

    itemVariableName = mapArg.getParameters()[0].getName();
  } else if (TS.Node.isFunctionExpression(mapArg)) {
    let statements = mapArg.getBody()?.getStatements();
    let nodes = statements.map(processNode);
    itemVariableName = mapArg.getParameters()[0].getName();
    body = {
      element: "block",
      children: nodes,
    };
  } else if (TS.Node.isIdentifier(mapArg)) {
    // Named function
    body = {
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
              element: "procedureCall",
              name: mapArg.getText(),
              args: [{ element: "variable", name: itemVariableName }],
            },
          ],
        },
      ],
    };
  }

  // when traversing a function body, we have to handle...
  // IF statement (consequent / alternate)
  // Loops (have a body)
  // And Block (have children)
  // Any time we find a element of type 'returnStatement'
  // we call APPEND instead of returning using the lefthand side
  // from above

  const crawlAndReplaceReturnStatements = (node: ExpressionElement) => {
    if (node.element === "returnStatement") {
      node.element = "procedureCall";
      node.name = "APPEND";
      node.args = [
        {
          element: "variable",
          name: leftHandSideVariable,
        },
        node.value,
      ];
    } else if (node.element === "block") {
      node.children.forEach(crawlAndReplaceReturnStatements);
    } else if (["forEach", "whileLoop", "repeatN"].includes(node.element)) {
      crawlAndReplaceReturnStatements(node.body);
    } else if (node.element === "ifStatement") {
      crawlAndReplaceReturnStatements(node.consequent);
      if (node.alternate) {
        crawlAndReplaceReturnStatements(node.alternate);
      }
    }
  };

  crawlAndReplaceReturnStatements(body);

  let firstItem: Value | MathExpression = {
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

export const filter = () => {};

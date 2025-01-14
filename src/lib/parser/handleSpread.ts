import { ASSIGN } from ".";
import type { MathExpression, ExpressionElement, ProcedureCall, Value, List } from "../pseudocode";


let addedSpreadFunction = false;

const joinArraysDefinition = {
    "element": "procedureDefinition",
    "name": "JOIN_ARRAYS",
    "args": [
        "arrays"
    ],
    "body": {
        "element": "block",
        "children": [
            [
                {
                    "element": "mathExpression",
                    "left": {
                        "element": "variable",
                        "name": "outputArray"
                    },
                    "right": {
                        "element": "value",
                        "type": "list",
                        "value": []
                    },
                    "operator": "←"
                }
            ],
            {
                "initializer": [
                    {
                        "element": "empty"
                    }
                ],
                "element": "forEach",
                "list": {
                    "element": "variable",
                    "name": "arrays"
                },
                "itemVariable": "arr",
                "body": [
                    {
                        "element": "block",
                        "children": [
                            {
                                "initializer": [
                                    {
                                        "element": "empty"
                                    }
                                ],
                                "element": "forEach",
                                "list": {
                                    "element": "variable",
                                    "name": "arr"
                                },
                                "itemVariable": "item",
                                "body": [
                                    {
                                        "element": "block",
                                        "children": [
                                            [
                                                {
                                                    "name": "APPEND",
                                                    "args": [
                                                        {
                                                            "element": "variable",
                                                            "name": "outputArray"
                                                        },
                                                        {
                                                            "element": "variable",
                                                            "name": "item"
                                                        }
                                                    ],
                                                    "element": "procedureCall"
                                                }
                                            ]
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "element": "returnStatement",
                "value": {
                    "element": "variable",
                    "name": "outputArray"
                }
            }
        ]
    }
}

export function handleSpreadAssignment (
  left: ExpressionElement,
  right: List
): MathExpression | ProcedureCall[] | ProcedureCall {
    console.log('Got me spread',left,right);
    if (left.element === 'variable' && right.type === 'list') {
        let result = handleSimpleSpreadCases(left, right);
        if (result) {
            return result;
        }
    }
    
    //{ element: "variable", name },
    //{ element: "breakOut", direction: "before" },
    //definition,
    let arraysToJoin = [];
    for (let  element of right.value) {
        if (element.element === 'SpreadElement') {
            // the child *is* an array in this case...
            arraysToJoin.push(element.children[1]);
        } else {
            arraysToJoin.push(
                {
                    element : 'value',
                    type : 'list',
                    value : [element]
                }
            );
        }
    }    

    // fallback
    let v = {
        element: "mathExpression",
        operator: ASSIGN,
        left,
        right : {
            element: "procedureCall",
            name: "JOIN_ARRAYS",
            args: [{
                element : 'value',
                type : 'list',
                value: arraysToJoin,
            }]
        },
    }
    if (!addedSpreadFunction) {
        v = [            
            joinArraysDefinition,
            v                                   
        ]
    } 
    console.log('Returning',v)
    return v;
}

function handleSimpleSpreadCases (
    left : ExpressionElement,
    right: List
) : ProcedureCall[] | void {
    // Collect the items left and right of the spread element
    let leftOfSpread = [];
    let rightOfSpread = [];
    let spreadItem = null;
    for (let element of right.value) {
        if (element.element === 'SpreadElement') {
            if (spreadItem) {
                // If we have *multiple spread items, 
                // forget it -= this is not simple!
                return;
            }
            spreadItem = element.children[1];
        } else {
            if (!spreadItem) {
                leftOfSpread.push(element);
            } else {
                rightOfSpread.push(element);
            }
        }
    }       
    let calls : ProcedureCall[] = [];
    if (spreadItem.name === left.name) {
        leftOfSpread.reverse();
        for (let element of leftOfSpread) {
            calls.push({
                element: "procedureCall",
                name: "INSERT",
                args: [left, {element: 'value',type : 'number',value: "1"}, element],
            })
        }

        // Check for e.g.
        // foo = [...foo, 1];
        for (let element of rightOfSpread) {                
            // We have a reference to the variable
            // we're spreading, so we can't do this
            // in-place...
            calls.push({
                element: "procedureCall",
                name: "APPEND",
                args: [left, element],
            })
        }
        return calls;            

    }
}
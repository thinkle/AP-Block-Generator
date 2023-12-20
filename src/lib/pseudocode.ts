export interface CodeElement {
  element: string;
  children?: CodeElement[];
}

export type StatementElement =
  | Assignment
  | ProcedureCall
  | IfStatement
  | ReturnStatement
  | UntilLoopExpression
  | ForEachExpression
  | RepeatExpression
  | ParenthesizedExpression
  | Comment
  | ProcedureDefinition; // Add other statement types as needed
export type ExpressionElement =
  | Value
  | Comment
  | Variable
  | MathExpression
  | ParenthesizedExpression
  | ProcedureCall
  | ListIndex
  | List; // Add other expression types as needed
export type AnyElement = StatementElement | ExpressionElement | Block;

export interface EmptyNode extends CodeElement {
  element: "empty";
}

export interface Value extends CodeElement {
  element: "value";
  type: "number" | "string" | "boolean" | "list";
  value: string;
}

export interface List extends CodeElement {
  element: "value";
  type: "list";
  value: ExpressionElement[];
}

export interface Assignment extends CodeElement {
  element: "assignment";
  varname: string;
  value: ExpressionElement;
}

export interface ProcedureCall extends CodeElement {
  element: "procedureCall";
  name: string;
  args: ExpressionElement[];
}

export interface Variable extends CodeElement {
  element: "variable";
  name: string;
}

export interface ProcedureDefinition extends CodeElement {
  element: "procedureDefinition";
  name: string;
  args: string[];
  body: Block;
}

export interface ReturnStatement extends CodeElement {
  element: "returnStatement";
  value: ExpressionElement;
}

export interface MathExpression extends CodeElement {
  element: "mathExpression";
  operator: string;
  left: ExpressionElement;
  right: ExpressionElement;
}

export interface IfStatement extends CodeElement {
  element: "ifStatement";
  condition: ExpressionElement;
  consequent: Block;
  alternate?: Block;
}

export interface UntilLoopExpression extends CodeElement {
  element: "untilLoop";
  condition: ExpressionElement;
  body: Block;
}

export interface ForEachExpression extends CodeElement {
  element: "forEach";
  list: Variable | List;
  itemVariable: string;
  body: Block;
}

export interface RepeatExpression extends CodeElement {
  element: "repeatN";
  n: number;
  body: Block;
}

export interface ListIndex extends CodeElement {
  element: "listIndex";
  list: Variable | List;
  index: ExpressionElement;
}

/* For handling any value meant to represent a list
index, which allows us to handle e.g. 1-based indexing
in APCSP pseudocode */
export interface ListIndexElement extends CodeElement {
  element: "listIndexElement";
  value: ExpressionElement;
}

export interface ListInsertCall extends CodeElement {
  element: "listInsert";
  list: Variable | List;
  index: number;
  value: ExpressionElement;
}

export interface ListLengthCall extends CodeElement {
  element: "listLength";
  list: Variable | List;
}

export interface Block extends CodeElement {
  element: "block";
  children: StatementElement[];
}

export interface ParenthesizedExpression extends CodeElement {
  element: "parentheses";
  expression: ExpressionElement;
}
export interface Comment extends CodeElement {
  element: "comment";
  comment: string;
}

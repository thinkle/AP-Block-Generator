import * as TS from "ts-morph";
import type { Comment } from "./pseudocode";
import { processNode } from ".";

export function handleComment(node: TS.Node): Comment {
  if (!TS.Node.isCommentStatement(node)) {
    throw new Error("Node is not a Block");
  }
  return {
    element: "comment",
    comment: node.getFullText(),
  };
}

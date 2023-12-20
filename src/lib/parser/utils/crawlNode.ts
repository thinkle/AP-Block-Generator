// Recursively crawl node...

import type { AnyElement } from "../../pseudocode";

export const crawl = (node: AnyElement, f: (node: AnyElement) => void) => {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach((n) => crawl(n, f));
    return;
  } else {
    f(node);
    if (node.children) {
      node.children.map((n) => crawl(n, f));
    }
    if (node.value) {
      crawl(node.value, f);
    }
    if (node.condition) {
      crawl(node.condition, f);
    }
    if (node.consequent) {
      crawl(node.consequent, f);
    }
    if (node.alternate) {
      crawl(node.alternate, f);
    }
    if (node.body) {
      crawl(node.body, f);
    }
    if (node.args) {
      node.args.map((n) => crawl(n, f));
    }
  }
};

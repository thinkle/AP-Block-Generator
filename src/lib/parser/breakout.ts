import type { AnyElement } from "../pseudocode";

/**
 * We crawl the CHILDREN of the current NODE.
 * IF we find a BREAKOUT node, that means we will
 * be REPOSITIONING its SIBLINGS to be OUR SIBLINGS.
 * AND we will be REMOVING the BREAKOUT NODE.
 *
 * We also crawl RECURSIVELY...
 */
export function transformTreeWithBreakout(
  node: AnyElement,
  appendSiblings?: (nodes: AnyElement[]) => void
): void {
  // We can only act on great-grandchildren...
  let children: AnyElement[] = [];
  if (node.value && Array.isArray(node.value)) {
    checkChildren(node.value);
  }
  /* We have numerous types of "children" because yours truly was
  too bone-headed to stick with a simple node=>children design...  */
  if (node.element === "code" || node.element === "block") {
    /* Direct children */
    checkChildren(node.children);
  } else if (
    [
      "procedureDefinition",
      "forEach",
      "forEach",
      "genericFor",
      "whileLoop",
      "repeatN",
    ].includes(node.element)
  ) {
    /* Items with a "body" block whose children are our children */
    if (node.body && node.body.children) {
      checkChildren(node.body.children);
    }
  } else if (node.element == "ifStatement") {
    /* "If" statements have *two* sets of children */
    checkChildren(node.condition);
    checkChildren(node.consequent.children);
    if (node.alternate) {
      checkChildren(node.alternate.children);
    }
  } else if (node.element == "mathExpression") {
    /* We expect we may have inserted an array into the "right" branch */
    if (Array.isArray(node.right)) {
      checkChildren(node.right);
    }
  } else if (node.element == "procedureCall") {
    /* We expect we may have inserted an array into one of the "args" */
    for (let arg of node.args) {
      if (Array.isArray(arg)) {
        checkChildren(arg);
      }
    }
  } else if (node.element == "returnStatement") {
    /* We expect we may have inserted an array into the "value" */
    if (Array.isArray(node.value)) {
      checkChildren(node.value);
    }
  }
  function checkChildren(children: (AnyElement | { element: "breakOut" })[]) {
    if (!children) {
      return;
    }
    for (let i = 0; i < children.length; i++) {
      // We define the method we would use to "break out" any grandchildren...
      // when we call ourselves recursively...
      const appendGrandSiblings = (
        nodes: AnyElement[],
        direction: "before" | "after" = "after"
      ) => {
        if (direction === "after") {
          children.splice(i + 1, 0, ...nodes);
        } else {
          children.splice(i, 0, ...nodes);
        }
      };
      let child = children[i];
      // ...and then we call it on each child
      if (child.element === "breakOut") {
        // We need to remove the breakout node, but we don't want to
        // remove the node we just added, so we need to skip it
        if (appendSiblings) {
          let direction = child.direction || "after";
          let deletedNode = children.splice(i, 1);
          let sibsToMove = children.splice(i, children.length - i);
          appendSiblings(sibsToMove, direction);
        } else {
          child.element = "value";
          child.value = "BREAKOUT NODE AT TOP LEVEL???";
          console.log(
            "We are supposed to append siblings from ",
            i,
            children,
            "but no can do"
          );
        }
      } else {
        transformTreeWithBreakout(children[i], appendGrandSiblings);
      }
    }
  }
}

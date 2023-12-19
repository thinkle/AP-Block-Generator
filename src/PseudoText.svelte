<script lang="ts">
  import type {
    AnyElement,
    ListIndex,
    ListIndexElement,
  } from "./lib/pseudocode";
  export let node: AnyElement | AnyElement[];
  let text = "";
  export let indentLevel = 0;

  function indent(indentLevel: number) {
    let s = "";
    for (let i = 0; i < indentLevel; i++) {
      s += "  ";
    }
    return s;
  }

  function handleOneBasedIndex(node: AnyElement): string {
    if (node.element == "value" && node.type == "number") {
      return `${Number(node.value) + 1}`;
    } else {
      return processParsedIntoText({
        element: "mathExpression",
        operator: "+",
        left: node,
        right: {
          element: "value",
          type: "number",
          value: 1,
        },
      });
    }
  }

  function handleListIndex(node: ListIndex) {
    return `${processParsedIntoText(node.list)}[${handleOneBasedIndex(
      node.index
    )}]`;
  }

  function processParsedIntoText(
    node: AnyElement | AnyElement[],
    indentLevel = 0
  ): string {
    const i = indentLevel;

    if (Array.isArray(node)) {
      return node
        .map((n) => processParsedIntoText(n, indentLevel))
        .join(`\n${indent(i)}`);
    } else {
      if (!node?.element) {
        return "?";
      }
      if (node.element === "empty") {
        return "";
      }
      if (node.element === "mathExpression") {
        return `${processParsedIntoText(node.left, indentLevel)} ${
          node.operator
        } ${processParsedIntoText(node.right, indentLevel)}`;
      }
      if (node.element === "procedureCall") {
        return `${node.name}(${node.args
          .map((n) => processParsedIntoText(n, indentLevel))
          .join(", ")})`;
      }
      /* Branching and other fun structures... */
      if (node.element === "ifStatement") {
        let text = `\n${indent(i)}IF ${processParsedIntoText(
          node.condition,
          indentLevel
        )} THEN ${processParsedIntoText(node.consequent, indentLevel)}`;
        if (node.alternate) {
          text += `  ${indent(i)}ELSE${processParsedIntoText(
            node.alternate,
            indentLevel
          )}`;
        }
        return text;
      }
      if (node.element === "repeatN") {
        let text = `${indent(i)}REPEAT ${node.n} TIMES`;
        text += processParsedIntoText(node.body, indentLevel);
        return text;
      }
      if (node.element === "forEach") {
        let text = `\n${indent(i)}FOR EACH ${
          node.itemVariable
        } IN ${processParsedIntoText(node.list, indentLevel)}`;
        text += processParsedIntoText(node.body, indentLevel);
        return text;
      }
      if (node.element === "procedureDefinition") {
        let text = `\n${indent(i)}PROCEDURE ${node.name}`;
        if (node.args && node.args.length) {
          text += `(${node.args.join(", ")})`;
        }
        text += processParsedIntoText(node.body, indentLevel);
        return text;
      }
      /* List stuff */
      if (node.element == "listIndex") {
        return handleListIndex(node);
      } else if (node.element == "listIndexElement") {
        return handleOneBasedIndex(node.value);
      }
      /* Handle variables */
      if (node.element == "variable") {
        return node.name;
      } else if (node.element === "value") {
        if (node.type === "string") {
          return `"${node.value}"`;
        } else if (node.type === "list") {
          return `[${node.value
            .map((n) => processParsedIntoText(n, indentLevel))
            .join(", ")}]`;
        } else {
          return node.value;
        }
        /* Generic handler for "children" */
      }
      if (node.element === "block") {
        let text = `\n${indent(i)}{`;
        for (let child of node.children) {
          text += `\n${indent(i + 1)}${processParsedIntoText(
            child,
            indentLevel + 1
          )}`;
        }
        text += `\n${indent(i)}}`;
        return text;
      }
      /* Fallback */
      if (node.children) {
        let text = "";
        for (let child of node.children) {
          text += `\n${indent(i)}${processParsedIntoText(child, indentLevel)}`;
        }
        return text;
      }
    }
  }

  $: text = processParsedIntoText(node);
  $: console.log("Wrote: ", text);
</script>

<pre>
  {text}
</pre>
Raw:
<pre>
  {JSON.stringify(node)}
</pre>

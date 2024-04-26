<script lang="ts">
  import ReturnStatement from "./ReturnStatement.svelte";

  import ForEach from "./ForEach.svelte";

  import ListIndex from "./ListIndex.svelte";

  import RepeatN from "./RepeatN.svelte";

  import ProcedureCall from "./ProcedureCall.svelte";

  import MathExpression from "./MathExpression.svelte";

  import IfStatement from "./IfStatement.svelte";

  import ProcedureDef from "./ProcedureDef.svelte";

  import * as P from "../../lib/pseudocode";
  import Block from "./Block.svelte";
  import ListIndexValue from "./ListIndexValue.svelte";
  import UntilLoop from "./UntilLoop.svelte";
  export let node: P.AnyElement | P.AnyElement[];

  function jsToString(node) {
    if (!node) return "";
    if (!node.element && Array.isArray(node)) {
      return node
        .map(jsToString)
        .filter((v) => v)
        .join(",\n\t");
    }
    switch (node.element) {
      case "OpenBraceToken":
        return "";
      case "CloseBraceToken":
        return "";
      case "ColonToken":
        return ":";
      case "variable":
        return node.name;
      case "value":
        if (node.type === "string") {
          return `"${node.value}"`;
        } else if (node.type === "list") {
          return `[${node.value.map(jsToString).join(", ")}]`;
        } else {
          return node.value;
        }
      case "ObjectLiteralExpression":
        let properties = node.children
          .map((child) => jsToString(child))
          .filter((child) => child)
          .join(", \n");
        return `{ ${properties} }`;
      case "PropertyAssignment":
        let v = `${jsToString(node.children[0])}: ${jsToString(
          node.children[2]
        )}`;
        console.log("PRoperty assignment", node, "=>", v);
        return v;
      case "NoSubstitutionTemplateLiteral":
        return `"..."`;
      default:
        // Recursively process children if the element is not recognized
        if (node.children && node.children.length) {
          return node.children.map(jsToString).join(", ");
        }
        // Return raw value or name if no specific handling is defined
        return node.value || node.name || "";
    }
  }
</script>

{#if Array.isArray(node)}
  <section>
    {#each node as child}
      <svelte:self node={child} />
    {/each}
  </section>
{:else if node.element != "empty"}
  <div class={node.element}>
    {#if node.element == "variable"}
      <span class="variable">{node.name}</span>
    {:else if node.element == "value"}
      {#if node.type == "string"}
        <span class="value string">"{node.value}"</span>
      {:else if node.type == "list"}
        <span class="value list square-block">
          {#each node.value as item, i}
            <span class="item">
              <svelte:self node={item} />
            </span>
            {#if i < node.value.length - 1},
            {/if}
          {/each}
        </span>
      {:else}
        <span class="value">{node.value}</span>
      {/if}
    {:else if node.element == "returnStatement"}
      <ReturnStatement {node} />
    {:else if node.element == "listIndexElement"}
      <ListIndexValue node={node.value} />
    {:else if node.element == "listIndex"}
      <ListIndex {node} />
    {:else if node.element == "procedureDefinition"}
      <ProcedureDef {node} />
    {:else if node.element == "procedureCall"}
      <ProcedureCall {node} />
    {:else if node.element == "ifStatement"}
      <IfStatement {node}></IfStatement>
    {:else if node.element == "comment"}
      <pre class="comment">{node.comment}</pre>
    {:else if node.element == "mathExpression"}
      <MathExpression {node}></MathExpression>
    {:else if node.element == "parentheses"}
      (<svelte:self node={node.expression} />)
    {:else if node.element == "repeatN"}
      <RepeatN {node} />
    {:else if node.element == "untilLoop"}
      <UntilLoop {node} />
    {:else if node.element == "forEach"}
      <ForEach {node} />
    {:else if node.element == "code" || !node.element}
      {#if node.children}
        <section>
          {#each node.children as child}
            <div><svelte:self node={child} /></div>
          {/each}
        </section>
      {/if}
    {:else if node.element == "block"}
      <Block body={node.children} />
    {:else}
      <div class="unknown">
        {jsToString(node)}
      </div>
      <!-- {#if node.children}
        {#each node.children as child}
          <svelte:self node={child} />
        {/each}
      {/if} -->
    {/if}
  </div>
{/if}

<style>
  :global(div, span) {
    font-size: var(--font-size);
  }
  div {
    display: contents;
  }
  section > div {
    display: block;
  }
  section {
    line-height: 2;
  }
  .comment {
    color: #ef640e;
  }
  .unknown {
    background-color: #ccc;
    border: 2px solid #222;
    display: inline-block;
    padding: 8px;
  }
</style>

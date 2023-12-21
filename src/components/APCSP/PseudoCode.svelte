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
      <div>Unhandled element {node.element}</div>

      {JSON.stringify(node)}
      {#if node.children}
        {#each node.children as child}
          <svelte:self node={child} />
        {/each}
      {/if}
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
</style>

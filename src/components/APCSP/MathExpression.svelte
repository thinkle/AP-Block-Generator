<script lang="ts">
  import type { MathExpression } from "../../lib/pseudocode";
  import PseudoCode from "./PseudoCode.svelte";
  export let node: MathExpression;
</script>

<span class="expression">
  {#if node && node.left}
    <span class="left">
      <PseudoCode node={node.left} />
    </span>
  {/if}
  {#if node?.operator}
    <span class="operator">{node.operator}</span>
  {/if}
  {#if node?.right}
    <span class="right">
      <PseudoCode node={node.right} />
    </span>
  {/if}
</span>

<style>
  .expression {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
</style>

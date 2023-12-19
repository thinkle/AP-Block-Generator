<script lang="ts">
  import type { MathExpression } from "../../lib/pseudocode";
  import PseudoCode from "./PseudoCode.svelte";
  export let node: MathExpression;
</script>

<span class="expression">
  <span class="left">
    <PseudoCode node={node.left} />
  </span>
  <span class="operator">{node.operator}</span>
  <span class="right">
    <PseudoCode node={node.right} />
  </span>
</span>

<style>
  .expression {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
</style>

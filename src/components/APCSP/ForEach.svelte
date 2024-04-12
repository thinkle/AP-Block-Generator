<script lang="ts">
  import * as P from "../../lib/pseudocode";
  import Block from "./Block.svelte";
  import PseudoCode from "./PseudoCode.svelte";
  export let node: P.ForEachExpression;
</script>

<div class="shaded round-block">
  <div class="line">
    <span class="keyword">FOR EACH</span>
    {node.itemVariable}
    <span class="keyword">IN</span>
    <PseudoCode node={node.list} />
  </div>
  <div class="rounded-block">
    <PseudoCode node={node.body} />
  </div>
</div>

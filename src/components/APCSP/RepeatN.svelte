<script lang="ts">
  import * as P from "../../lib/pseudocode";
  import Block from "./Block.svelte";
  import PseudoCode from "./PseudoCode.svelte";
  export let node: P.RepeatExpression;
  console.log("Got node", node);
</script>

<div class="shaded round-block">
  <div class="line">
    <span class="keyword">REPEAT</span>
    {node.n} TIMES
  </div>
  <div class="rounded-block">
    <PseudoCode node={node.body} />
  </div>
</div>

<style>
</style>

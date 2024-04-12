<script lang="ts">
  import * as P from "../../lib/pseudocode";
  import Block from "./Block.svelte";
  import PseudoCode from "./PseudoCode.svelte";
  export let node: P.UntilLoopExpression;
</script>

<div class="shaded round-block">
  <div class="line">
    <span class="keyword">REPEAT UNTIL</span>
    <PseudoCode node={node.condition} />
  </div>
  <div class="rounded-block">
    <PseudoCode node={node.body} />
  </div>
</div>

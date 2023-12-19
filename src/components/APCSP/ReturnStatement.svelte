<script lang="ts">
  import PseudoCode from "./PseudoCode.svelte";

  import * as P from "../../lib/pseudocode";

  export let node: P.ReturnStatement;
  console.log("Got node", node);
</script>

<div class="line">
  <span class="keyword"> RETURN </span>
  <span class="return-value square-block">
    <PseudoCode node={node.value} />
  </span>
</div>

<style>
  div {
    display: contents;
  }
  section > div {
    display: block;
  }
  section {
    line-height: 2;
  }
</style>

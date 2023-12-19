<script lang="ts">
  import type { StatementElement, Block } from "../../lib/pseudocode";
  export let body: StatementElement[] | Block;
  let children = body.children || body;
  $: children = body.children || body;
  console.log("Got block body", body);
  import PseudoCode from "./PseudoCode.svelte";
</script>

<div class="indented round-block white">
  {#each children as node}
    <div class="line">
      <PseudoCode {node} />
    </div>
  {/each}
</div>

<style>
  .indented {
    margin-left: 1em;
  }
</style>

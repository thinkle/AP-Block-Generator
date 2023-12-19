<script lang="ts">
  import Block from "./Block.svelte";

  import type { ProcedureDefinition } from "../../lib/pseudocode";
  export let node: ProcedureDefinition;
</script>

<div class="round-block shaded">
  <div class="line">
    <span class="keyword">PROCEDURE</span>
    {node.name}
    {#if node.args && node.args.length}
      <div class="square-block">
        {node.args.join(", ")}
      </div>
    {/if}
  </div>
  <Block body={node.body} />
</div>

<script lang="ts">
  import type { IfStatement } from "../../lib/pseudocode";
  import Block from "./Block.svelte";
  import PseudoCode from "./PseudoCode.svelte";

  export let node: IfStatement;
  console.log("Got me an if statement", node);
</script>

{#if node}
  {#if node.condition && node.consequent}
    <div class="round-block shaded">
      <div class="line">
        <span class="keyword">IF</span>
        <span class="rounded-inline condition">
          <PseudoCode node={node.condition} />
        </span>
      </div>
      <PseudoCode node={node.consequent} />
      {#if node.alternate}
        <div class="line">
          <span class="keyword">ELSE</span>
        </div>
        <PseudoCode node={node.alternate} />
      {/if}
    </div>
  {/if}
{/if}

<script lang="ts">
  import type { ProcedureCall } from "../../lib/pseudocode";
  import PseudoCode from "./PseudoCode.svelte";
  export let node: ProcedureCall;
  console.log("Got me a procedure call", node);
</script>

<div class="line rounded-inline">
  {node.name}<span class="square-block"
    >{#each node.args as arg, i}<span class="arg"
        ><PseudoCode node={arg} /></span
      >{#if i < node.args.length - 1},
      {/if}{/each}</span
  >
</div>

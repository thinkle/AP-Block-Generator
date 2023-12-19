<script lang="ts">
  import ListIndexValue from "./ListIndexValue.svelte";

  import * as P from "../../lib/pseudocode";
  import PseudoCode from "./PseudoCode.svelte";
  export let node: P.ListIndex;
  console.log("Got node", node);
</script>

<span>
  <PseudoCode node={node.list} /><span class="square-block"
    ><ListIndexValue node={node.index} /></span
  >
</span>

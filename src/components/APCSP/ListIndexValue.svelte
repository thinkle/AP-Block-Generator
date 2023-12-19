<script lang="ts">
  import * as P from "../../lib/pseudocode";
  import InfoTip from "./InfoTip.svelte";
  import MathExpression from "./MathExpression.svelte";
  import PseudoCode from "./PseudoCode.svelte";
  export let node: P.ExpressionElement;
</script>

{#if node.element == "value" && node.type == "number"}
  <PseudoCode node={{ ...node, value: Number(node.value) + 1 }} />
{:else}
  <MathExpression
    node={{
      ...node,
      operator: "+",
      left: node,
      right: { element: "value", type: "number", value: 1 },
    }}
  />
  <InfoTip>
    Note: Adding 1 because APCSP PseudoCode uses 1-based indices where
    JavaScript uses 0-based indices.
  </InfoTip>
{/if}

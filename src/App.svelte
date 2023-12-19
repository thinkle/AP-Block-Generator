<script lang="ts">
  import PseudoText from "./PseudoText.svelte";

  import ThreeColumn from "./components/ThreeColumn.svelte";
  import CodeMirror from "./components/CodeMirror.svelte";
  import { javascript } from "@codemirror/lang-javascript";
  import { code } from "./stores/work";
  import { parseCode } from "./lib/parseCode";
  import PseudoCode from "./components/APCSP/PseudoCode.svelte";
  import type { AnyElement } from "./lib/pseudocode";

  let parsed: AnyElement | AnyElement[] = [];
  $: parsed = parseCode($code);
</script>

<h1>TypeScript => APCSP PseudoCode Generator</h1>
<main>
  <ThreeColumn>
    <div slot="left"><CodeMirror bind:value={$code} lang={javascript()} /></div>
    <div slot="center"><PseudoCode node={parsed} /></div>
    <div slot="right">
      <PseudoText node={parsed}></PseudoText>
      <!--   <PseudoCodeText node={parseCode($code)} /> -->
    </div>
  </ThreeColumn>
</main>

<h2>Debug: JSON Parse Tree Belwo:</h2>
<pre>
  {JSON.stringify(parseCode($code), null, 2)}
</pre>

<style>
  h1 {
    text-align: center;
  }
  main {
    width: 100vw;
    height: 100vh;
  }
  .two-col {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>

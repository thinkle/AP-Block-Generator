<script lang="ts">
  import PseudoText from "./PseudoText.svelte";

  import ThreeColumn from "./components/ThreeColumn.svelte";
  import CodeMirror from "./components/CodeMirror.svelte";
  import { javascript } from "@codemirror/lang-javascript";
  import { code } from "./stores/work";
  import { parseCode } from "./lib/parser/index";
  import PseudoCode from "./components/APCSP/PseudoCode.svelte";
  import type { AnyElement } from "./lib/pseudocode";
  import CodeResult from "./components/CodeResult.svelte";

  let parsed: AnyElement | AnyElement[] = [];
  $: parsed = parseCode($code);
  $: console.log("parsed: ", parsed);
  let showResult = false;
</script>

<h1>TypeScript => APCSP PseudoCode Generator</h1>

<main>
  <ThreeColumn>
    <div slot="left">
      <div class="bar">
        <h2>JavaScript</h2>
        {#if showResult}
          <button on:click={() => (showResult = false)}>Reset</button>
        {:else}
          <button on:click={() => (showResult = true)}>Run</button>
        {/if}
      </div>
      <CodeMirror bind:value={$code} lang={javascript()} />
    </div>
    <div slot="center">
      <div class="bar"><h2>APCSP Blocks</h2></div>
      <PseudoCode node={parsed} />
    </div>
    <div slot="right">
      <div class="bar"><h2>APCSP PseudoCode</h2></div>
      <PseudoText node={parsed}></PseudoText>
    </div>
  </ThreeColumn>
</main>
<section>
  {#if showResult}
    <section class="result">
      <button on:click={() => (showResult = false)}>Hide</button>
      <CodeResult
        height={200}
        js={$code}
        onWindowLoaded={() => console.log("Loaded code")}
      />
    </section>
  {/if}
</section>

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
  .bar {
    height: 38px;
    background-color: #888;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  .bar h2 {
    margin: 0;
  }
  .bar button {
    position: absolute;
    right: 8px;
    top: 8px;
    height: 22px;
    border: none;
    background-color: #646cff;
    color: white;
    border-radius: 4px;
    padding: 0 8px;
    cursor: pointer;
  }
</style>

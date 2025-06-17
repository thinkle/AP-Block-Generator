<script lang="ts">
  import "contain-css-svelte/vars/defaults.css";
  import "contain-css-svelte/themes/typography-airy.css";
  import "contain-css-svelte/themes/light.css";
  import PseudoText from "./PseudoText.svelte";

  import ThreeColumn from "./components/ThreeColumn.svelte";
  import CodeMirror from "./components/CodeMirror.svelte";
  import { javascript } from "@codemirror/lang-javascript";
  import { code } from "./stores/work";
  import { parseCode } from "./lib/parser/index";
  import PseudoCode from "./components/APCSP/PseudoCode.svelte";
  import type { AnyElement } from "./lib/pseudocode";
  import CodeResult from "./components/CodeResult.svelte";
  import {
    Page,
    SplitPane,
    TabBar,
    TabItem,
    Bar,
    Button,
    Container,
    Code,
    MiniButton,
  } from "contain-css-svelte";
  let parsed: AnyElement | AnyElement[] = [];
  $: parsed = parseCode($code);
  let showResult = false;
  let showMode: "pseudo" | "blocks" | "result" = "pseudo";
  let showBlocks = true;

  let resultFontSize = 16;
</script>

<h1>TypeScript => APCSP PseudoCode Generator</h1>

<Page>
  <SplitPane>
    <div slot="left">
      <Bar class="bar">
        <h2>JavaScript</h2>
        {#if showResult}
          <Button on:click={() => (showResult = false)}>Reset</Button>
        {:else}
          <Button
            on:click={() => {
              showResult = true;
              showMode = "result";
            }}>Run</Button
          >
        {/if}
      </Bar>
      <CodeMirror bind:value={$code} lang={javascript()} />
    </div>
    <div slot="right">
      <TabBar>
        <TabItem
          on:click={() => (showMode = "blocks")}
          active={showMode == "blocks"}
        >
          APCSP Blocks
        </TabItem>
        <TabItem
          on:click={() => (showMode = "pseudo")}
          active={showMode == "pseudo"}
        >
          APCSP PseudoCode
        </TabItem>
        {#if showMode}
          <TabItem
            on:click={() => (showMode = "result")}
            active={showMode === "result"}
          >
            Result
          </TabItem>
        {/if}
        <div style="display: flex; align-items: center;  margin-left: auto;">
          <MiniButton on:click={() => resultFontSize++}>+</MiniButton>
          <MiniButton on:click={() => resultFontSize--}>-</MiniButton>
        </div>
      </TabBar>
      <div style:--font-size="{resultFontSize}px" style="display:contents;">
        {#if showMode == "blocks"}
          <PseudoCode node={parsed} />
        {:else if showMode == "pseudo"}
          <PseudoText node={parsed}></PseudoText>
        {:else if showMode == "result"}
          {#if showResult}
            <section class="result">
              <Button on:click={() => (showResult = false)}>Hide</Button>

              <CodeResult
                height={1200}
                js={$code}
                onWindowLoaded={() => console.log("Loaded code")}
              />
            </section>
          {:else}
            <Button
              on:click={() => {
                showResult = true;
                showMode = "result";
              }}>Run</Button
            >
          {/if}
        {/if}
      </div>
    </div>
  </SplitPane>
  <Container>
    <h2>How to Use</h2>
    <p>
      Just type JavaScript in the JavaScript side, and you should see code
      appear on the right. If I implemented the syntax you're using (which
      should be most syntax), it should show up translated into APCSP code.
    </p>
    <p>
      We also support some APCSP functions, such as RANDOM, DISPLAY, and INPUT.
    </p>
    <p>
      I've also inputted APCSP style robot code, which you can access by calling
      methods such as ROTATE_RIGHT or MOVE_FORWARD or the more JS-like
      alternatives I've put in which are forward(), right(), left(), etc.
    </p>
    <p>For problems, try typing:</p>
    <ul>
      <li>PROBLEM_1()</li>
      <li>PROBLEM_2()</li>
      <li>PROBLEM_3()</li>
      <li>etc.</li>
    </ul>
    <p>The full list of robot functions is:</p>
    <ul>
      <li>forward() or MOVE_FORWARD()</li>
      <li>left() or ROTATE_LEFT()</li>
      <li>right() or ROTATE_RIGHT()</li>
      <li>canMove() or CAN_MOVE()</li>
    </ul>
    <p>
      Some structures, such as objects, aren't supported in the APCSP syntax, so
      YMMV.
    </p>
    <p>
      If you want to try <em>running</em> the code, I recommend using
      <b>window.prompt</b>
      (for input) and <b>window.alert</b> (for DISPLAY) so you can see the results
      when you click the "run" button (you have to reset to run again, so that we
      destroy and re-create an iFrame to give you a fresh JavaScript context to run
      your code in).
    </p>
    <p>
      You can also use console.log for DISPLAY but you'll have to pop open an
      inspector to see your log statements and I'll warn you I probably spammed
      the inspector with my own debug messages.
    </p>
    <p>
      If you want to be impressed with my overachieving in creating this tools,
      take some of the list methods for a spin.
    </p>
    <p>For example, the following code fragments should work.</p>
    <Code
      code={`
let fruits = ['apple','pear','persimmon','banana'];
let pfruits = fruits.filter(fruit => fruit[0]=='p');
`}
    />
    <p>List methods I've implemented include:</p>
    <ul>
      <li>forEach</li>
      <li>map</li>
      <li>filter</li>
      <li>some</li>
      <li>includes</li>
      <li>find</li>
    </ul>
  </Container>
</Page>

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

<script lang="ts">
  import { onMount } from "svelte";
  export let onWindowLoaded: ((w: Window) => void) | null;
  // ... [Rest of the Code]
  import robotLibrary from "../lib/robotLibrary.js?raw";
  import baseLibrary from "../lib/baseLibrary.js?raw";
  import { sanitize } from "../lib/sanitizer";
  export let js = "";
  export let css = "";
  export let html = "";
  export let height: number;

  let iframe: HTMLIFrameElement;

  const updateIframe = () => {
    if (!iframe || !iframe.contentWindow) {
      return;
    }
    const doc = iframe.contentWindow.document;
    const sanitizedJs = sanitize(js);
    console.log("Sanitized JS is :", sanitizedJs);
    doc.open();
    doc.write(
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              ${css}
          </style>
      </head>
      <body>
          ${html}
          <div id="robots"></div>
          <scr` +
        `ipt type="module">
              ${robotLibrary}
              ${baseLibrary}
              ${sanitizedJs}
          </scr` +
        `ipt>
      </body>
      </html>
    `
    );
    doc.close();
  };

  $: js && updateIframe();
  $: css && updateIframe();
  $: html && updateIframe();

  onMount(() => {
    updateIframe();
    if (onWindowLoaded) {
      onWindowLoaded(iframe.contentWindow);
    }
  });
</script>

<iframe style:--height={`${height}px`} bind:this={iframe}></iframe>

<style>
  iframe {
    width: 100%;
    height: var(--height, 400px);
    border: none;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  }
</style>

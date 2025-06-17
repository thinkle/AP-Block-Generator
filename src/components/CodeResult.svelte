<script lang="ts">
  import { onMount } from "svelte";
  export let onWindowLoaded: ((w: Window) => void) | null;
  // ... [Rest of the Code]
  import robotLibrary from "../lib/robotLibrary.js?raw";
  import baseLibrary from "../lib/baseLibrary.js?raw";
  import textInterfaceBundle from "../lib/text-interface.bundle.iife.js?raw";
  import textUtilityFunctions from "../lib/textLibrary.js?raw";
  import { sanitize } from "../lib/sanitizer";
  export let js = "";
  export let css = "";
  export let html = "";
  export let height: number;

  let iframe: HTMLIFrameElement;

  const updateIframe = () => {
    if (!iframe) {
      return;
    }
    const sanitizedJs = sanitize(js);
    console.log("Sanitized JS is :", sanitizedJs);
    const jsString = `
      console.log('Loading script');             
      ${textInterfaceBundle}
      console.log('Loading TI');
      ${textUtilityFunctions}
      console.log('Loading robots');
      ${robotLibrary}
      console.log('Loading base');
      ${baseLibrary}
      console.log('Injecting sanitized JS');
      ${sanitizedJs}
      `;
    console.log("Full JS String is :", jsString);
    console.log("User JS is : ", sanitizedJs);
    const htmlString =
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
          <div id="text"></div>
          <div id="robots"></div>          
          ` +
      ` <scr` +
      `ipt type="module"> 
          ${jsString}
        </scr` +
      `ipt>
    </body>
    </html>
    `;

    iframe.srcdoc = htmlString;
  };

  $: js && updateIframe();
  $: css && updateIframe();
  $: html && updateIframe();

  onMount(() => {
    updateIframe();
    if (onWindowLoaded && iframe.contentWindow) {
      onWindowLoaded(iframe.contentWindow);
    }
  });
</script>

<iframe
  style:--height={`${height}px`}
  bind:this={iframe}
  title="Code execution result"
></iframe>

<style>
  iframe {
    width: 100%;
    height: var(--height, 400px);
    border: none;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  }
</style>

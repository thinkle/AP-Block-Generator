# APCSP PseudoCode Generator (JS -> Pseudocode)

This project is designed to make it easy to create APCSP style pseudocode in either written or blocky format. This makes it much easier to make custom sample test questions, for example.

The initial language support is for TypeScript or JavaScript. Typing in either of those languages will generate a blocky translation of code. It is also possible to run code in the browser, allowing this to be used as a simple teaching tool.

Additional functionality includes the implementation of a "robot" library for Robot-Style exam questions which makes it possible to practice robot problems.

## Stack

This project was build with Svelte for the front-end stack. The look and feel is managed by my own UI library contain-css-svelte. The coding has autocomplete etc. provided by the CodeMirror library. Code parsing is handled by ts-morph.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Build for production:

   ```bash
   npm run build
   ```

4. Preview the production build:

   ```bash
   npm run preview
   ```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) with the [Svelte extension](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).

## TypeScript Support

Type definitions for Svelte and Vite are included via `global.d.ts`.

## HMR (Hot Module Replacement)

HMR is enabled for a better development experience, but local component state may not always be preserved.

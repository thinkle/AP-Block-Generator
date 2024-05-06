<script>
  import { onMount } from "svelte";
  import { EditorView } from "@codemirror/view";
  import { EditorState } from "@codemirror/state";
  import { basicSetup } from "codemirror";
  import { autocompletion, completionKeymap } from "@codemirror/autocomplete";

  export let value = "";
  export let lang;
  export let extensions = [];

  let editorContainer;
  let editorView;

  function myCompletions(context) {
    let word = context.matchBefore(/\w*/);
    if (word.from === word.to) return null;

    let completions = [
      ...["forward", "left", "right", "canMove", "randInt", "goalReached"].map(
        (name) => ({
          label: name,
          type: "function",
          apply: `${name}()`,
        })
      ),
      ...[
        "INPUT",
        "DISPLAY",
        "CONCAT",
        "ROTATE_LEFT",
        "ROTATE_RIGHT",
        "MOVE_FORWARD",
        "CAN_MOVE",
        "RANDOM",
        "GOAL_REACHED",
        "RIGHT",
        "LEFT",
        "FORWARD",
        "BACKWARD",
      ].map((name) => ({
        label: name,
        type: "function",
        apply: `${name}()`,
      })),
      // Add more completions here
    ];

    return {
      from: word.from,
      options: completions.filter((item) => item.label.startsWith(word.text)),
    };
  }

  extensions = [
    basicSetup,
    lang,
    autocompletion({ override: [myCompletions] }),
    ...extensions,
  ];

  onMount(() => {
    editorView = new EditorView({
      parent: editorContainer,
      state: EditorState.create({
        doc: value,
        extensions: extensions,
      }),
      dispatch: (tr) => {
        if (tr.docChanged) {
          value = tr.newDoc.toString();
        }
        editorView.update([tr]);
      },
    });
    return () => {
      editorView.destroy();
    };
  });

  $: if (editorView && value !== editorView.state.doc.toString()) {
    const tr = {
      changes: { from: 0, to: editorView.state.doc.length, insert: value },
    };
    editorView.dispatch(tr);
  }

  function replaceFIXMEAndSetCursor() {
    const docContent = editorView.state.doc.toString();
    const fixmePos = docContent.indexOf("FIXME");

    if (fixmePos !== -1) {
      const transaction = editorView.state.update({
        selection: { anchor: fixmePos, head: fixmePos + 5 },
      });
      editorView.dispatch(transaction);
      editorView.focus();
    }
  }
  $: value && editorView && replaceFIXMEAndSetCursor();
</script>

<div bind:this={editorContainer}></div>

<style>
  /* Your styles here */
</style>

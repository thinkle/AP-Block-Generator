import { writable } from "svelte/store";

export const code = writable(`
let name = window.prompt("What is your name?");
if (name === 'Alice') {
  window.alert('Welcome to Wonderland!');
} else {
  window.alert('Why hello, ' + name + '!');
}

`);
//`);

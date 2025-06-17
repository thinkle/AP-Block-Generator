import { writable } from "svelte/store";

export const code = writable(`
let name = INPUT("What is your name?");
if (name === 'Alice') {
  DISPLAY('Welcome to Wonderland!');
} else {
  DISPLAY('Why hello, ' + name + '!');
}

`);
//`);

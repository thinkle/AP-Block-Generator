import { writable } from "svelte/store";

export const code = writable(`
const greetUser = (name, age) => {
  if (age < 18) {
    window.alert(name + ": It's nice to meet you; you're still a kid!");
  } else {
    window.alert(name + " - Why hello. You're all grown up!");
  }
}

let name = window.prompt("What's your name?");
let age = window.prompt("How old are you?");
if (name != 'Tom') {
  greetUser(name, age);
} else {
  window.alert("Crazy, that's my name!");
}
`);

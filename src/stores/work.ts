import { writable } from "svelte/store";

export const code = writable(`
const greetUser = (name, age) => {
  if (age < 18) {
    window.alert("Hello " + name + " - You're still a kid!");
  } else {
    window.alert("Hello " + name + " - You're all grown up!");
  }
}

let name = window.prompt("What's your name?");
let age = window.prompt("How old are you?");
if (name != 'Tom') {
  greetUser(name, age);
} else {
  window.alert("Crazy, the teacher who programmed this site is also named Tom!");
}
`);

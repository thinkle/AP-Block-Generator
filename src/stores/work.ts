import { writable } from "svelte/store";

export const code = writable(`
const sayHello = (name) => {
  var mood;
  if (name === 'Tom') {
    mood = 'grouchy';
  } else {
    mood = 'joyful';
  }
  console.log('I am so ' + mood + ' to meet you, ' + name);
}


let fruits = ['Apples','Pears','Bananas','Oranges','Cherries','Dragonfruit'];
fruits.push('Pineapple');
let b = 7;
for (let i=0; i<5; i++) {
  b = b + b;
}

if (b > 4) {
  console.log('Wow!');
} else {
  console.log('No way');
}

console.log('Now we have ',b)
for (let fruit of fruits) {
  console.log('I love to eat ' + fruit);
}
fruits.splice(3,0,'Grapes');


`);
`
let fruits = ['Apples','Pears','Bananas','Oranges','Cherries','Dragonfruit']
let myFruit = fruits[4]
let myIndex = 3;
console.log('Wow this is cool: ' + fruits[myIndex]);
for (let i=0; i<10; i++) {
  console.log('I can count to ' + i);
}
const doSomething = (argument1) => {
  let response = INPUT("What is up?");
  if (response == "Nothing much") {
    OUTPUT("Cool");
  } else {
    OUTPUT("Oh wow");
  }
}
`;

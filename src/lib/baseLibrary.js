// Base library for JS code

let counters = {};

function checkForInfinite(identifier) {
  if (identifier === undefined) {
    identifier = "base";
  }
  if (!counters[identifier]) {
    counters[identifier] = 1;
  } else {
    counters[identifier]++;
  }
  if (counters[identifier] > 10000) {
    throw new Error("Infinite loop detected in loop " + identifier);
  }
}


function RANDOM(a, b) {
  let range = b - a;
  return Math.floor(Math.random() * range) + a;
}

const randInt = RANDOM;

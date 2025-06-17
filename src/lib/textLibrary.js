// textLibrary.js
// Handles DISPLAY and INPUT for APCSP runner using TextInterface
//import { TextInterface } from "text-interface";

let ti = null;

function ensureTI() {
  if (!ti) {
    // Find or create the output area (you may want to customize this selector)
    let outputDiv = document.getElementById("text-output");
    if (!outputDiv) {
      outputDiv = document.createElement("div");
      outputDiv.id = "text-output";
      document.body.appendChild(outputDiv);
    }
    ti = new TextInterface.TextInterface(outputDiv);
    ti.setTitle("Simple Text Interface");
  }
  return ti;
}

export async function DISPLAY(...args) {
  const ti = ensureTI();
  await ti.output(...args);
}

export async function INPUT(prompt) {
  const ti = ensureTI();
  return await ti.prompt(prompt);
}
export const input = INPUT; // Alias for compatibility
export const display = DISPLAY; // Alias for compatibility
export const prompt = INPUT; // Alias for compatibility
export const output = DISPLAY; // Alias for compatibility

// NovaCalc keeps the expression as a friendly display string, then converts
// symbols such as × and ÷ only when it is time to calculate the answer.
const display = document.querySelector("#display");
const buttons = document.querySelectorAll("button");

let expression = "0";
const operators = ["+", "-", "×", "÷", "%"];

function updateDisplay(value = expression) {
  display.textContent = value;
}

function isOperator(character) {
  return operators.includes(character);
}

function getLastCharacter() {
  return expression.slice(-1);
}

function getCurrentNumber() {
  return expression.split(/[+\-×÷%]/).pop();
}

function appendNumber(number) {
  expression = expression === "0" ? number : expression + number;
  updateDisplay();
}

function appendDecimal() {
  const currentNumber = getCurrentNumber();

  if (!currentNumber.includes(".")) {
    expression += currentNumber === "" ? "0." : ".";
    updateDisplay();
  }
}

function appendOperator(operator) {
  const lastCharacter = getLastCharacter();

  // Do not allow an operator to start the expression, except for minus.
  if (expression === "0" && operator !== "-") {
    return;
  }

  // Replace the previous operator instead of creating invalid sequences.
  if (isOperator(lastCharacter)) {
    expression = expression.slice(0, -1) + operator;
  } else {
    expression += operator;
  }

  updateDisplay();
}

function clearCalculator() {
  expression = "0";
  updateDisplay();
}

function deleteLastCharacter() {
  expression = expression.length > 1 ? expression.slice(0, -1) : "0";
  updateDisplay();
}

function toggleSign() {
  if (expression === "0") {
    return;
  }

  const match = expression.match(/([+\-×÷%]?)(\d*\.?\d+)$/);

  if (!match) {
    return;
  }

  const numberStart = match.index + match[1].length;
  const number = match[2];
  const beforeNumber = expression.slice(0, numberStart);
  const previousCharacter = beforeNumber.slice(-1);

  if (previousCharacter === "-") {
    expression = beforeNumber.slice(0, -1) + number;
  } else if (numberStart === 0) {
    expression = `-${number}`;
  } else {
    expression = `${beforeNumber}-${number}`;
  }

  updateDisplay();
}

function prepareExpressionForMath() {
  return expression
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
}

function calculateResult() {
  if (isOperator(getLastCharacter())) {
    expression = expression.slice(0, -1);
  }

  const mathExpression = prepareExpressionForMath();

  if (/\/0(?![\d.])/.test(mathExpression)) {
    expression = "0";
    updateDisplay("Cannot divide by 0");
    return;
  }

  try {
    const result = Function(`"use strict"; return (${mathExpression})`)();

    if (!Number.isFinite(result)) {
      throw new Error("Invalid calculation");
    }

    expression = Number.isInteger(result) ? String(result) : String(Number(result.toFixed(8)));
    updateDisplay();
  } catch (error) {
    expression = "0";
    updateDisplay("Error");
  }
}

function handleButtonClick(button) {
  const { value, action } = button.dataset;

  if (action === "clear") clearCalculator();
  if (action === "delete") deleteLastCharacter();
  if (action === "toggle-sign") toggleSign();
  if (action === "calculate") calculateResult();
  if (/^\d$/.test(value)) appendNumber(value);
  if (value === ".") appendDecimal();
  if (isOperator(value)) appendOperator(value);
}

function flashKeyboardButton(value) {
  const button = document.querySelector(`[data-value="${value}"], [data-action="${value}"]`);

  if (!button) return;

  button.classList.add("is-pressed");
  setTimeout(() => button.classList.remove("is-pressed"), 120);
}

function handleKeyboardInput(event) {
  const keyMap = {
    "/": "÷",
    "*": "×",
    Enter: "calculate",
    Backspace: "delete",
    Escape: "clear",
  };

  const key = keyMap[event.key] || event.key;

  if (/^\d$/.test(key)) appendNumber(key);
  else if (key === ".") appendDecimal();
  else if (isOperator(key)) appendOperator(key);
  else if (key === "calculate") calculateResult();
  else if (key === "delete") deleteLastCharacter();
  else if (key === "clear") clearCalculator();
  else return;

  event.preventDefault();
  flashKeyboardButton(key);
}

buttons.forEach((button) => {
  button.addEventListener("click", () => handleButtonClick(button));
});

document.addEventListener("keydown", handleKeyboardInput);
updateDisplay();

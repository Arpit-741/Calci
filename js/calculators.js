window.CalcMasterMath = (() => {
  const operatorMap = { '×': '*', '÷': '/', '^': '**' };
  const factorial = (number) => {
    if (number < 0 || !Number.isInteger(number)) throw new Error('Factorial requires a positive integer');
    if (number > 170) throw new Error('Number too large');
    return number <= 1 ? 1 : number * factorial(number - 1);
  };

  function normalizeExpression(expression, angleMode = 'deg') {
    let prepared = expression
      .replaceAll('π', 'Math.PI')
      .replaceAll('×', '*')
      .replaceAll('÷', '/')
      .replaceAll('^', '**')
      .replace(/(\d+(?:\.\d+)?)%/g, '($1/100)')
      .replace(/(\d+(?:\.\d+)?)!/g, 'factorial($1)')
      .replace(/√\(/g, 'Math.sqrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/10\^\(/g, 'Math.pow(10,')
      .replace(/e\^\(/g, 'Math.exp(');

    const wrapTrig = (name, fn) => {
      const inputTransform = angleMode === 'deg' ? '(Math.PI/180)*' : '';
      prepared = prepared.replace(new RegExp(`${name}\\(`, 'g'), `${fn}(${inputTransform}`);
    };
    wrapTrig('sin', 'Math.sin');
    wrapTrig('cos', 'Math.cos');
    wrapTrig('tan', 'Math.tan');
    prepared = prepared
      .replace(/asin\(/g, angleMode === 'deg' ? '(180/Math.PI)*Math.asin(' : 'Math.asin(')
      .replace(/acos\(/g, angleMode === 'deg' ? '(180/Math.PI)*Math.acos(' : 'Math.acos(')
      .replace(/atan\(/g, angleMode === 'deg' ? '(180/Math.PI)*Math.atan(' : 'Math.atan(')
      .replace(/\be\b/g, 'Math.E');
    return prepared;
  }

  function evaluate(expression, angleMode = 'deg') {
    if (!expression || /[+\-×÷^.]$/.test(expression)) throw new Error('Incomplete expression');
    const mathExpression = normalizeExpression(expression, angleMode);
    if (/\/0(?![\d.])/.test(mathExpression)) throw new Error('Cannot divide by 0');
    const result = Function('factorial', `"use strict"; return (${mathExpression})`)(factorial);
    if (!Number.isFinite(result)) throw new Error('Invalid calculation');
    return Number.isInteger(result) ? String(result) : String(Number(result.toFixed(10)));
  }

  return { evaluate, operatorMap, factorial };
})();

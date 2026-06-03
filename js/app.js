const app = (() => {
  const state = {
    currentTool: localStorage.getItem('calcmaster-default') || 'standard',
    expression: '0',
    scientificExpression: '0',
    memory: 0,
    angleMode: 'deg',
    history: [],
    exchange: { timestamp: 0, base: 'USD', rates: {} }
  };

  const tools = {
    standard: { title: 'Standard Calculator', subtitle: 'Fast arithmetic with keyboard support.' },
    scientific: { title: 'Scientific Calculator', subtitle: 'Advanced functions, trigonometry, parentheses, constants, powers, and memory.' },
    bmi: { title: 'BMI Calculator', subtitle: 'Metric and imperial body mass index with health category colors.' },
    age: { title: 'Age Calculator', subtitle: 'Years, months, days, total lived time, and next birthday countdown.' },
    currency: { title: 'Currency Converter', subtitle: 'Live exchange rates, search, swap, and conversion history.' },
    length: { title: 'Length Converter', subtitle: 'Instant conversion across metric and imperial length units.' },
    area: { title: 'Area Converter', subtitle: 'Convert square units, acres, and hectares.' },
    weight: { title: 'Weight Converter', subtitle: 'Convert mass and weight units instantly.' },
    temperature: { title: 'Temperature Converter', subtitle: 'Celsius, Fahrenheit, and Kelvin conversion.' },
    speed: { title: 'Speed Converter', subtitle: 'Meters per second, kilometers per hour, mph, and knots.' },
    data: { title: 'Data Storage Converter', subtitle: 'Bits, bytes, KB, MB, GB, and TB conversion.' },
    percentage: { title: 'Percentage Calculator', subtitle: 'X% of Y, increase, decrease, and difference.' },
    cgpa: { title: 'CGPA Calculator', subtitle: 'Dynamic semesters, subject credits, GPA, and overall CGPA.' },
    'number-system': { title: 'Number System Converter', subtitle: 'Binary, decimal, octal, hexadecimal, and binary arithmetic.' },
    emi: { title: 'EMI Calculator', subtitle: 'Monthly EMI, total interest, total payment, and repayment chart.' },
    sip: { title: 'SIP Calculator', subtitle: 'Investment value, wealth generated, and growth chart.' },
    compound: { title: 'Compound Interest Calculator', subtitle: 'Final amount, interest earned, and growth visualization.' },
    settings: { title: 'Settings', subtitle: 'Theme, default calculator, and history controls.' }
  };

  const currencies = ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'SGD', 'AED', 'CNY', 'NZD', 'ZAR', 'BRL', 'MXN', 'KRW', 'SEK', 'NOK'];
  const panel = document.querySelector('#tool-panel');
  const shell = document.querySelector('.app-shell');

  const format = (value) => CalcMasterConverters.formatNumber(Number(value));
  const debounce = (callback, delay = 400) => {
    let timeout;
    return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => callback(...args), delay); };
  };

  function titleBlock(toolKey) {
    const tool = tools[toolKey];
    return `<div class="panel-heading"><div><p class="eyebrow">${tool.subtitle}</p><h2>${tool.title}</h2></div></div>`;
  }

  function setActiveNav() {
    document.querySelectorAll('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.tool === state.currentTool));
  }

  function record(type, input, result) {
    CalcMasterHistory.add(type, input, result).then(refreshHistory);
  }

  function renderStandard() {
    state.expression = '0';
    panel.innerHTML = `${titleBlock('standard')}<div class="calculator-display" id="calcDisplay" aria-live="polite">0</div><div class="keypad" id="standardKeys">${[
      ['AC', 'clear', 'danger'], ['DEL', 'delete', 'utility'], ['%', '%', 'operator'], ['÷', '÷', 'operator'],
      ['7', '7'], ['8', '8'], ['9', '9'], ['×', '×', 'operator'],
      ['4', '4'], ['5', '5'], ['6', '6'], ['-', '-', 'operator'],
      ['1', '1'], ['2', '2'], ['3', '3'], ['+', '+', 'operator'],
      ['+/-', 'sign', 'utility'], ['0', '0'], ['.', '.'], ['=', 'equals', 'equal']
    ].map(([label, value, cls = '']) => `<button class="calc-key ${cls}" data-value="${value}" type="button">${label}</button>`).join('')}</div>`;
    panel.querySelector('#standardKeys').addEventListener('click', (event) => handleCalculatorInput(event.target.dataset.value, 'expression'));
  }

  function renderScientific() {
    state.scientificExpression = '0';
    panel.innerHTML = `${titleBlock('scientific')}
      <div class="calculator-display" id="sciDisplay" aria-live="polite">0</div>
      <div class="mode-toggle" role="group" aria-label="Angle mode">
        <button class="chip active" data-angle="deg" type="button">Degree</button><button class="chip" data-angle="rad" type="button">Radian</button>
        <button class="chip" data-memory="MC" type="button">MC</button><button class="chip" data-memory="MR" type="button">MR</button><button class="chip" data-memory="M+" type="button">M+</button><button class="chip" data-memory="M-" type="button">M-</button>
      </div>
      <div class="keypad scientific" id="scientificKeys">${[
        'AC','DEL','(',')','÷','sin(','cos(','tan(','π','×','asin(','acos(','atan(','e','-','x²','x³','xʸ','√(','+','log(','ln(','10^(','e^(','=','abs(','!','ⁿ√','%','.' ,'7','8','9','4','5','6','1','2','3','0'
      ].map((label) => `<button class="calc-key ${/AC/.test(label) ? 'danger' : /=/.test(label) ? 'equal' : /[+\-×÷%]/.test(label) ? 'operator' : ''}" data-value="${label}" type="button">${label}</button>`).join('')}</div>`;
    panel.querySelectorAll('[data-angle]').forEach((button) => button.addEventListener('click', () => {
      state.angleMode = button.dataset.angle;
      panel.querySelectorAll('[data-angle]').forEach((item) => item.classList.toggle('active', item === button));
    }));
    panel.querySelectorAll('[data-memory]').forEach((button) => button.addEventListener('click', () => handleMemory(button.dataset.memory)));
    panel.querySelector('#scientificKeys').addEventListener('click', (event) => handleScientificInput(event.target.dataset.value));
  }

  function updateCalcDisplay(key = 'expression', displayId = 'calcDisplay', value) {
    const display = panel.querySelector(`#${displayId}`);
    if (display) display.textContent = value || state[key];
  }

  function appendToExpression(key, value) {
    const operators = ['+', '-', '×', '÷', '%', '^'];
    const current = state[key];
    const last = current.slice(-1);
    if (/^\d$/.test(value)) state[key] = current === '0' ? value : current + value;
    else if (value === '.') {
      const currentNumber = current.split(/[+\-×÷%^()]/).pop();
      if (!currentNumber.includes('.')) state[key] += currentNumber ? '.' : '0.';
    } else if (operators.includes(value)) {
      if (current === '0' && value !== '-') return;
      state[key] = operators.includes(last) ? current.slice(0, -1) + value : current + value;
    } else state[key] = current === '0' ? value : current + value;
  }

  function handleCalculatorInput(value, key) {
    if (!value) return;
    if (value === 'clear') state[key] = '0';
    else if (value === 'delete') state[key] = state[key].length > 1 ? state[key].slice(0, -1) : '0';
    else if (value === 'sign') state[key] = state[key].startsWith('-') ? state[key].slice(1) : `-${state[key]}`;
    else if (value === 'equals') {
      try { const result = CalcMasterMath.evaluate(state[key]); record('Standard Calculator', state[key], result); state[key] = result; }
      catch (error) { updateCalcDisplay(key, 'calcDisplay', error.message); state[key] = '0'; return; }
    } else appendToExpression(key, value);
    updateCalcDisplay(key);
  }

  function handleScientificInput(value) {
    if (!value) return;
    if (value === 'AC') state.scientificExpression = '0';
    else if (value === 'DEL') state.scientificExpression = state.scientificExpression.length > 1 ? state.scientificExpression.slice(0, -1) : '0';
    else if (value === '=') {
      try { const result = CalcMasterMath.evaluate(state.scientificExpression, state.angleMode); record('Scientific Calculator', state.scientificExpression, result); state.scientificExpression = result; }
      catch (error) { updateCalcDisplay('scientificExpression', 'sciDisplay', error.message); state.scientificExpression = '0'; return; }
    } else if (value === 'x²') appendToExpression('scientificExpression', '^2');
    else if (value === 'x³') appendToExpression('scientificExpression', '^3');
    else if (value === 'xʸ') appendToExpression('scientificExpression', '^');
    else if (value === 'ⁿ√') appendToExpression('scientificExpression', '^(1/');
    else appendToExpression('scientificExpression', value);
    updateCalcDisplay('scientificExpression', 'sciDisplay');
  }

  function handleMemory(action) {
    const current = Number(state.scientificExpression) || 0;
    if (action === 'MC') state.memory = 0;
    if (action === 'MR') state.scientificExpression = String(state.memory);
    if (action === 'M+') state.memory += current;
    if (action === 'M-') state.memory -= current;
    updateCalcDisplay('scientificExpression', 'sciDisplay');
  }

  function renderBmi() {
    panel.innerHTML = `${titleBlock('bmi')}<div class="grid two"><label><span class="field-label">System</span><select id="bmiSystem" class="select"><option value="metric">Metric (cm, kg)</option><option value="imperial">Imperial (inch, lb)</option></select></label><label><span class="field-label">Height</span><input id="bmiHeight" class="input" type="number" min="0" placeholder="175" /></label><label><span class="field-label">Weight</span><input id="bmiWeight" class="input" type="number" min="0" placeholder="70" /></label></div><div id="bmiResult" class="result-card" aria-live="polite">Enter height and weight.</div>`;
    ['bmiSystem', 'bmiHeight', 'bmiWeight'].forEach((id) => panel.querySelector(`#${id}`).addEventListener('input', calculateBmi));
  }

  function calculateBmi() {
    const system = panel.querySelector('#bmiSystem').value;
    const height = Number(panel.querySelector('#bmiHeight').value);
    const weight = Number(panel.querySelector('#bmiWeight').value);
    if (!height || !weight) return;
    const bmi = system === 'metric' ? weight / ((height / 100) ** 2) : (703 * weight) / (height ** 2);
    const category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
    const className = category === 'Normal' ? 'success' : category === 'Obese' ? 'error' : 'warning';
    panel.querySelector('#bmiResult').innerHTML = `<span>BMI Value</span><strong class="${className}">${bmi.toFixed(1)}</strong><p>Category: ${category}</p><div class="bmi-indicator"></div>`;
    record('BMI Calculator', { system, height, weight }, `${bmi.toFixed(1)} ${category}`);
  }

  function renderAge() {
    panel.innerHTML = `${titleBlock('age')}<label><span class="field-label">Date of Birth</span><input id="dob" class="input" type="date" /></label><div id="ageResult" class="card-grid"></div>`;
    panel.querySelector('#dob').addEventListener('input', calculateAge);
  }

  function calculateAge() {
    const dobValue = panel.querySelector('#dob').value;
    if (!dobValue) return;
    const dob = new Date(dobValue); const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();
    if (days < 0) { months -= 1; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (months < 0) { years -= 1; months += 12; }
    const totalDays = Math.floor((today - dob) / 86400000);
    const nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
    const nextDays = Math.ceil((nextBirthday - today) / 86400000);
    panel.querySelector('#ageResult').innerHTML = card('Age', `${years}y ${months}m ${days}d`) + card('Total days lived', format(totalDays)) + card('Total weeks lived', format(totalDays / 7)) + card('Next birthday', `${nextDays} days`);
    record('Age Calculator', dobValue, `${years} years, ${months} months, ${days} days`);
  }

  function card(label, value) { return `<div class="result-card"><span>${label}</span><strong>${value}</strong></div>`; }

  async function renderCurrency() {
    panel.innerHTML = `${titleBlock('currency')}<div class="grid three"><label><span class="field-label">Amount</span><input id="currencyAmount" class="input" type="number" value="1" min="0" /></label><label><span class="field-label">From currency</span><input id="currencyFromSearch" class="input" list="currencyList" value="USD" /></label><label><span class="field-label">To currency</span><input id="currencyToSearch" class="input" list="currencyList" value="INR" /></label></div><datalist id="currencyList">${currencies.map((currency) => `<option value="${currency}"></option>`).join('')}</datalist><div class="mode-toggle"><button id="swapCurrency" class="chip" type="button">⇄ Swap</button><span id="rateStatus" class="chip">Loading live rates...</span></div><div id="currencyResult" class="result-card"></div>`;
    await loadRates();
    const run = debounce(convertCurrency, 300);
    ['currencyAmount', 'currencyFromSearch', 'currencyToSearch'].forEach((id) => panel.querySelector(`#${id}`).addEventListener('input', run));
    panel.querySelector('#swapCurrency').addEventListener('click', () => { const from = panel.querySelector('#currencyFromSearch'); const to = panel.querySelector('#currencyToSearch'); [from.value, to.value] = [to.value, from.value]; convertCurrency(); });
    convertCurrency();
  }

  async function loadRates() {
    if (Date.now() - state.exchange.timestamp < 1000 * 60 * 30) return;
    try {
      const response = await fetch('/api/rates?base=USD');
      const data = await response.json();
      state.exchange = { timestamp: Date.now(), base: data.base, rates: data.rates };
      panel.querySelector('#rateStatus').textContent = `Live rates cached: ${new Date(data.timestamp).toLocaleTimeString()}`;
    } catch {
      state.exchange = { timestamp: Date.now(), base: 'USD', rates: { USD: 1, INR: 83, EUR: 0.92, GBP: 0.79, JPY: 150, AUD: 1.52, CAD: 1.35, CHF: 0.88, SGD: 1.34, AED: 3.67 } };
      panel.querySelector('#rateStatus').textContent = 'Offline fallback rates';
    }
  }

  function convertCurrency() {
    const amount = Number(panel.querySelector('#currencyAmount').value || 0);
    const from = panel.querySelector('#currencyFromSearch').value.toUpperCase();
    const to = panel.querySelector('#currencyToSearch').value.toUpperCase();
    const rates = state.exchange.rates;
    if (!rates[from] || !rates[to]) { panel.querySelector('#currencyResult').textContent = 'Choose supported major currencies.'; return; }
    const result = (amount / rates[from]) * rates[to];
    panel.querySelector('#currencyResult').innerHTML = `<span>${amount} ${from}</span><strong>${format(result)} ${to}</strong>`;
    record('Currency Converter', `${amount} ${from} to ${to}`, `${format(result)} ${to}`);
  }

  function renderUnit(category) {
    const isTemp = category === 'temperature';
    const unitNames = isTemp ? ['Celsius', 'Fahrenheit', 'Kelvin'] : Object.keys(CalcMasterConverters.units[category].units);
    panel.innerHTML = `${titleBlock(category)}<div class="grid three"><label><span class="field-label">Value</span><input id="unitValue" class="input" type="number" value="1" /></label><label><span class="field-label">From</span><select id="unitFrom" class="select">${unitNames.map((u) => `<option>${u}</option>`).join('')}</select></label><label><span class="field-label">To</span><select id="unitTo" class="select">${unitNames.map((u, i) => `<option ${i === 1 ? 'selected' : ''}>${u}</option>`).join('')}</select></label></div><div id="unitResult" class="result-card"></div>`;
    const run = () => {
      const value = Number(panel.querySelector('#unitValue').value || 0);
      const from = panel.querySelector('#unitFrom').value; const to = panel.querySelector('#unitTo').value;
      const result = isTemp ? CalcMasterConverters.convertTemperature(value, from, to) : CalcMasterConverters.convertLinear(value, from, to, category);
      panel.querySelector('#unitResult').innerHTML = `<span>${value} ${from}</span><strong>${format(result)} ${to}</strong>`;
    };
    ['unitValue', 'unitFrom', 'unitTo'].forEach((id) => panel.querySelector(`#${id}`).addEventListener('input', run));
    run();
  }

  function renderPercentage() {
    panel.innerHTML = `${titleBlock('percentage')}<div class="grid two"><label><span class="field-label">X (%)</span><input id="pctX" class="input" type="number" value="10" /></label><label><span class="field-label">Y / Original</span><input id="pctY" class="input" type="number" value="100" /></label><label><span class="field-label">New value</span><input id="pctNew" class="input" type="number" value="120" /></label></div><div id="pctResults" class="card-grid"></div>`;
    ['pctX', 'pctY', 'pctNew'].forEach((id) => panel.querySelector(`#${id}`).addEventListener('input', calculatePercentage));
    calculatePercentage();
  }

  function calculatePercentage() {
    const x = Number(panel.querySelector('#pctX').value); const y = Number(panel.querySelector('#pctY').value); const next = Number(panel.querySelector('#pctNew').value);
    const increase = y ? ((next - y) / y) * 100 : 0; const difference = ((Math.abs(next - y) / ((next + y) / 2)) * 100) || 0;
    panel.querySelector('#pctResults').innerHTML = card(`${x}% of ${y}`, format((x / 100) * y)) + card('Percentage Increase', `${format(increase)}%`) + card('Percentage Decrease', `${format(-increase)}%`) + card('Percentage Difference', `${format(difference)}%`);
  }

  function renderCgpa() {
    panel.innerHTML = `${titleBlock('cgpa')}<div class="mode-toggle"><button id="addSemester" class="chip" type="button">Add Semester</button><button id="calculateCgpa" class="chip active" type="button">Calculate CGPA</button></div><div id="semesters" class="grid"></div><div id="cgpaResult" class="result-card">Add subjects with credits and grades.</div>`;
    panel.querySelector('#addSemester').addEventListener('click', addSemester);
    panel.querySelector('#calculateCgpa').addEventListener('click', calculateCgpa);
    addSemester();
  }

  function addSemester() {
    const container = panel.querySelector('#semesters'); const index = container.children.length + 1;
    container.insertAdjacentHTML('beforeend', `<div class="semester"><div class="panel-heading"><h3>Semester ${index}</h3><button class="mini-button add-subject" type="button">Add Subject</button></div><div class="subjects"></div></div>`);
    const semester = container.lastElementChild;
    semester.querySelector('.add-subject').addEventListener('click', () => addSubject(semester));
    addSubject(semester); addSubject(semester);
  }

  function addSubject(semester) {
    semester.querySelector('.subjects').insertAdjacentHTML('beforeend', `<div class="subject-row"><input class="input credit" type="number" min="0" placeholder="Credits" /><input class="input grade" type="number" min="0" max="10" step="0.1" placeholder="Grade" /><button class="mini-button danger" type="button" aria-label="Remove subject">×</button></div>`);
    semester.querySelector('.subjects').lastElementChild.querySelector('button').addEventListener('click', (event) => event.currentTarget.closest('.subject-row').remove());
  }

  function calculateCgpa() {
    let totalCredits = 0; let totalPoints = 0; const semesterSummaries = [];
    panel.querySelectorAll('.semester').forEach((semester, i) => {
      let semCredits = 0; let semPoints = 0;
      semester.querySelectorAll('.subject-row').forEach((row) => { const credits = Number(row.querySelector('.credit').value); const grade = Number(row.querySelector('.grade').value); semCredits += credits; semPoints += credits * grade; });
      totalCredits += semCredits; totalPoints += semPoints; semesterSummaries.push(`Sem ${i + 1}: ${semCredits ? (semPoints / semCredits).toFixed(2) : '0.00'}`);
    });
    const cgpa = totalCredits ? totalPoints / totalCredits : 0;
    panel.querySelector('#cgpaResult').innerHTML = `<strong>Overall CGPA: ${cgpa.toFixed(2)}</strong><p>${semesterSummaries.join(' • ')}</p>`;
    record('CGPA Calculator', `${totalCredits} credits`, cgpa.toFixed(2));
  }

  function renderNumberSystem() {
    panel.innerHTML = `${titleBlock('number-system')}<div class="grid two"><label><span class="field-label">Number</span><input id="numInput" class="input" value="1010" /></label><label><span class="field-label">Base</span><select id="numBase" class="select"><option value="2">Binary</option><option value="10">Decimal</option><option value="8">Octal</option><option value="16">Hexadecimal</option></select></label><label><span class="field-label">Binary A</span><input id="binA" class="input" value="1010" /></label><label><span class="field-label">Binary B</span><input id="binB" class="input" value="11" /></label></div><div id="numResults" class="card-grid"></div>`;
    ['numInput', 'numBase', 'binA', 'binB'].forEach((id) => panel.querySelector(`#${id}`).addEventListener('input', calculateNumberSystem));
    calculateNumberSystem();
  }

  function calculateNumberSystem() {
    const value = panel.querySelector('#numInput').value.trim(); const base = Number(panel.querySelector('#numBase').value); const decimal = parseInt(value, base);
    const a = parseInt(panel.querySelector('#binA').value || '0', 2); const b = parseInt(panel.querySelector('#binB').value || '0', 2);
    panel.querySelector('#numResults').innerHTML = card('Binary', decimal.toString(2)) + card('Decimal', decimal.toString(10)) + card('Octal', decimal.toString(8)) + card('Hexadecimal', decimal.toString(16).toUpperCase()) + card('Binary Addition', (a + b).toString(2)) + card('Binary Subtraction', Math.max(a - b, 0).toString(2));
  }

  function renderFinance(type) {
    const fields = type === 'emi'
      ? [['loan', 'Loan Amount', 500000], ['rate', 'Interest Rate (%)', 9], ['time', 'Loan Tenure (years)', 5]]
      : type === 'sip'
        ? [['monthly', 'Monthly Investment', 10000], ['rate', 'Expected Return (%)', 12], ['time', 'Duration (years)', 10]]
        : [['principal', 'Principal', 100000], ['rate', 'Interest Rate (%)', 8], ['frequency', 'Compounding Frequency', 4], ['time', 'Time (years)', 5]];
    panel.innerHTML = `${titleBlock(type)}<div class="grid two">${fields.map(([id, label, value]) => `<label><span class="field-label">${label}</span><input id="${id}" class="input" type="number" value="${value}" /></label>`).join('')}</div><div id="financeResult" class="card-grid"></div><canvas id="financeChart" class="chart" width="700" height="180" aria-label="Financial visualization"></canvas>`;
    fields.forEach(([id]) => panel.querySelector(`#${id}`).addEventListener('input', () => calculateFinance(type)));
    calculateFinance(type);
  }

  function calculateFinance(type) {
    let cards = ''; let chartValues = [];
    if (type === 'emi') {
      const principal = Number(panel.querySelector('#loan').value); const monthlyRate = Number(panel.querySelector('#rate').value) / 1200; const months = Number(panel.querySelector('#time').value) * 12;
      const emi = principal * monthlyRate * ((1 + monthlyRate) ** months) / (((1 + monthlyRate) ** months) - 1); const total = emi * months; const interest = total - principal;
      cards = card('Monthly EMI', `₹${format(emi)}`) + card('Total Interest', `₹${format(interest)}`) + card('Total Payment', `₹${format(total)}`); chartValues = [principal, interest, total]; record('EMI Calculator', { principal, months }, `EMI ${format(emi)}`);
    } else if (type === 'sip') {
      const monthly = Number(panel.querySelector('#monthly').value); const monthlyRate = Number(panel.querySelector('#rate').value) / 1200; const months = Number(panel.querySelector('#time').value) * 12;
      const total = monthly * ((((1 + monthlyRate) ** months) - 1) / monthlyRate) * (1 + monthlyRate); const invested = monthly * months; const gain = total - invested;
      cards = card('Invested Amount', `₹${format(invested)}`) + card('Wealth Generated', `₹${format(gain)}`) + card('Total Value', `₹${format(total)}`); chartValues = [invested, gain, total];
    } else {
      const principal = Number(panel.querySelector('#principal').value); const rate = Number(panel.querySelector('#rate').value) / 100; const frequency = Number(panel.querySelector('#frequency').value); const time = Number(panel.querySelector('#time').value);
      const finalAmount = principal * ((1 + rate / frequency) ** (frequency * time)); const interest = finalAmount - principal;
      cards = card('Final Amount', `₹${format(finalAmount)}`) + card('Interest Earned', `₹${format(interest)}`); chartValues = [principal, interest, finalAmount];
    }
    panel.querySelector('#financeResult').innerHTML = cards; drawChart(chartValues);
  }

  function drawChart(values) {
    const canvas = panel.querySelector('#financeChart'); if (!canvas) return; const ctx = canvas.getContext('2d'); const max = Math.max(...values, 1);
    ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = 'rgba(59,130,246,.16)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    values.forEach((value, index) => { const width = (value / max) * (canvas.width - 70); ctx.fillStyle = ['#3B82F6', '#10B981', '#F97316'][index % 3]; ctx.fillRect(32, 30 + index * 48, width, 28); });
  }

  function renderSettings() {
    panel.innerHTML = `${titleBlock('settings')}<div class="grid two"><label><span class="field-label">Default Calculator</span><select id="defaultTool" class="select">${Object.entries(tools).filter(([key]) => key !== 'settings').map(([key, tool]) => `<option value="${key}">${tool.title}</option>`).join('')}</select></label><div class="result-card"><strong>Theme</strong><p>Use the top-right toggle to switch Dark Mode and Light Mode.</p></div></div><div class="mode-toggle"><button id="saveDefault" class="chip active" type="button">Save Default</button><button id="settingsClearHistory" class="chip danger" type="button">Clear History</button></div>`;
    panel.querySelector('#defaultTool').value = localStorage.getItem('calcmaster-default') || 'standard';
    panel.querySelector('#saveDefault').addEventListener('click', () => { localStorage.setItem('calcmaster-default', panel.querySelector('#defaultTool').value); });
    panel.querySelector('#settingsClearHistory').addEventListener('click', clearHistory);
  }

  function renderTool(toolKey) {
    state.currentTool = toolKey; localStorage.setItem('calcmaster-current', toolKey); setActiveNav(); panel.classList.remove('fade-in'); void panel.offsetWidth; panel.classList.add('fade-in');
    if (toolKey === 'standard') renderStandard(); else if (toolKey === 'scientific') renderScientific(); else if (toolKey === 'bmi') renderBmi(); else if (toolKey === 'age') renderAge(); else if (toolKey === 'currency') renderCurrency(); else if (['length', 'area', 'weight', 'temperature', 'speed', 'data'].includes(toolKey)) renderUnit(toolKey); else if (toolKey === 'percentage') renderPercentage(); else if (toolKey === 'cgpa') renderCgpa(); else if (toolKey === 'number-system') renderNumberSystem(); else if (['emi', 'sip', 'compound'].includes(toolKey)) renderFinance(toolKey); else renderSettings();
    panel.focus({ preventScroll: true });
  }

  async function refreshHistory() {
    state.history = await CalcMasterHistory.load(); renderHistory();
  }

  function renderHistory() {
    const search = document.querySelector('#historySearch').value.toLowerCase(); const list = document.querySelector('#historyList');
    const filtered = state.history.filter((item) => `${item.calculator_type} ${item.input_data} ${item.result}`.toLowerCase().includes(search));
    list.innerHTML = filtered.map((item) => `<li><strong>${item.calculator_type}</strong><p>${item.result}</p><small>${item.input_data}<br>${new Date(item.timestamp).toLocaleString()}</small></li>`).join('') || '<li>No history yet. Calculations are saved locally and to MySQL when configured.</li>';
  }

  async function clearHistory() { await CalcMasterHistory.clear(); await refreshHistory(); }

  function handleKeyboard(event) {
    if (!['standard', 'scientific'].includes(state.currentTool) || ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
    const map = { '*': '×', '/': '÷', Enter: 'equals', Backspace: 'delete', Escape: 'clear' };
    const value = map[event.key] || event.key;
    if (/^\d$/.test(value) || ['+', '-', '×', '÷', '%', '.', 'equals', 'delete', 'clear'].includes(value)) {
      event.preventDefault();
      if (state.currentTool === 'standard') handleCalculatorInput(value, 'expression'); else handleScientificInput(value === 'equals' ? '=' : value === 'clear' ? 'AC' : value === 'delete' ? 'DEL' : value);
    }
  }

  function init() {
    document.querySelectorAll('.nav-item').forEach((button) => button.addEventListener('click', () => { renderTool(button.dataset.tool); document.querySelector('#sidebar').classList.remove('open'); }));
    document.querySelector('#menuToggle').addEventListener('click', () => { const sidebar = document.querySelector('#sidebar'); sidebar.classList.toggle('open'); document.querySelector('#menuToggle').setAttribute('aria-expanded', sidebar.classList.contains('open')); });
    document.querySelector('#themeToggle').addEventListener('click', (event) => { const light = shell.dataset.theme !== 'light'; shell.dataset.theme = light ? 'light' : 'dark'; event.currentTarget.textContent = light ? '☀️ Light' : '🌙 Dark'; localStorage.setItem('calcmaster-theme', shell.dataset.theme); });
    document.querySelector('#historySearch').addEventListener('input', renderHistory);
    document.querySelector('#clearHistory').addEventListener('click', clearHistory);
    document.querySelector('#refreshHistory').addEventListener('click', refreshHistory);
    document.querySelector('#exportHistory').addEventListener('click', () => CalcMasterHistory.exportCsv(state.history));
    document.addEventListener('keydown', handleKeyboard);
    shell.dataset.theme = localStorage.getItem('calcmaster-theme') || 'dark';
    renderTool(state.currentTool); refreshHistory();
  }

  return { init, renderTool };
})();

document.addEventListener('DOMContentLoaded', app.init);

const fs = require('fs');
const vm = require('vm');

const context = { window: {}, Number, Math, Function, Error, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/converters.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('js/calculators.js', 'utf8'), context);

const { CalcMasterConverters, CalcMasterMath } = context.window;

const standard = CalcMasterMath.evaluate('12+8×2');
if (standard !== '28') throw new Error(`Expected 28, received ${standard}`);

try {
  CalcMasterMath.evaluate('9÷0');
  throw new Error('Divide-by-zero was not rejected');
} catch (error) {
  if (!/divide by 0/i.test(error.message)) throw error;
}

const scientific = CalcMasterMath.evaluate('sin(30)', 'deg');
if (Math.abs(Number(scientific) - 0.5) > 0.000001) throw new Error(`Expected sin(30°)=0.5, received ${scientific}`);

const meters = CalcMasterConverters.convertLinear(1, 'km', 'm', 'length');
if (meters !== 1000) throw new Error(`Expected 1 km = 1000 m, received ${meters}`);

const fahrenheit = CalcMasterConverters.convertTemperature(0, 'Celsius', 'Fahrenheit');
if (fahrenheit !== 32) throw new Error(`Expected 0°C = 32°F, received ${fahrenheit}`);

console.log('CalcMaster Pro smoke tests passed');

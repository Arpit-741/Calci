window.CalcMasterConverters = (() => {
  const units = {
    length: {
      label: 'Length Converter', base: 'm', units: { mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, foot: 0.3048, yard: 0.9144, mile: 1609.344 }
    },
    area: {
      label: 'Area Converter', base: 'sq m', units: { 'sq mm': 0.000001, 'sq cm': 0.0001, 'sq m': 1, 'sq km': 1000000, acre: 4046.8564224, hectare: 10000 }
    },
    weight: {
      label: 'Weight Converter', base: 'g', units: { mg: 0.001, g: 1, kg: 1000, tonne: 1000000, pound: 453.59237, ounce: 28.349523125 }
    },
    speed: {
      label: 'Speed Converter', base: 'm/s', units: { 'm/s': 1, 'km/h': 0.2777777778, mph: 0.44704, knot: 0.5144444444 }
    },
    data: {
      label: 'Data Storage Converter', base: 'byte', units: { bit: 0.125, byte: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776 }
    }
  };

  function convertLinear(value, from, to, category) {
    const unitSet = units[category].units;
    return (Number(value) * unitSet[from]) / unitSet[to];
  }

  function convertTemperature(value, from, to) {
    const input = Number(value);
    let celsius = input;
    if (from === 'Fahrenheit') celsius = (input - 32) * (5 / 9);
    if (from === 'Kelvin') celsius = input - 273.15;
    if (to === 'Fahrenheit') return celsius * (9 / 5) + 32;
    if (to === 'Kelvin') return celsius + 273.15;
    return celsius;
  }

  function formatNumber(value) {
    if (!Number.isFinite(value)) return 'Invalid input';
    return Number.parseFloat(value.toFixed(10)).toLocaleString(undefined, { maximumFractionDigits: 10 });
  }

  return { units, convertLinear, convertTemperature, formatNumber };
})();

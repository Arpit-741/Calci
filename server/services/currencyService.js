const cache = new Map();
const ttlMs = 1000 * 60 * 30;
const fallbackRates = {
  USD: 1, INR: 83, EUR: 0.92, GBP: 0.79, JPY: 150, AUD: 1.52, CAD: 1.35,
  CHF: 0.88, SGD: 1.34, AED: 3.67, CNY: 7.2, NZD: 1.64, ZAR: 18.2,
  BRL: 4.95, MXN: 17.1, KRW: 1320, SEK: 10.5, NOK: 10.6
};

async function getRates(base = 'USD') {
  const normalizedBase = base.toUpperCase();
  const cached = cache.get(normalizedBase);
  if (cached && Date.now() - cached.timestamp < ttlMs) return cached.data;

  try {
    const endpoint = process.env.EXCHANGE_RATE_API_URL || `https://api.exchangerate-api.com/v4/latest/${normalizedBase}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    const response = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`Exchange API returned ${response.status}`);
    const data = await response.json();
    const payload = {
      base: data.base || normalizedBase,
      rates: data.rates,
      source: 'live',
      timestamp: new Date().toISOString()
    };
    cache.set(normalizedBase, { timestamp: Date.now(), data: payload });
    return payload;
  } catch (error) {
    return { base: 'USD', rates: fallbackRates, source: 'fallback', timestamp: new Date().toISOString() };
  }
}

module.exports = { getRates };

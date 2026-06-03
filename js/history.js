window.CalcMasterHistory = (() => {
  const storageKey = 'calcmaster-history';
  let cached = [];

  function readLocal() {
    try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch { return []; }
  }

  function writeLocal(items) {
    cached = items;
    localStorage.setItem(storageKey, JSON.stringify(items));
  }

  async function api(path, options = {}) {
    const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
    if (!response.ok) throw new Error(`API error ${response.status}`);
    return response.json();
  }

  async function load() {
    try {
      const data = await api('/api/history');
      cached = data.history || [];
      return cached;
    } catch {
      cached = readLocal();
      return cached;
    }
  }

  async function add(calculatorType, inputData, result) {
    const item = {
      id: Date.now(),
      calculator_type: calculatorType,
      input_data: typeof inputData === 'string' ? inputData : JSON.stringify(inputData),
      result: String(result),
      timestamp: new Date().toISOString()
    };
    writeLocal([item, ...readLocal()].slice(0, 100));
    try { await api('/api/history', { method: 'POST', body: JSON.stringify(item) }); } catch { /* local history is the offline fallback */ }
    return item;
  }

  async function clear() {
    writeLocal([]);
    try { await api('/api/history', { method: 'DELETE' }); } catch { /* offline fallback already cleared */ }
  }

  function exportCsv(items = cached) {
    const header = ['id', 'calculator_type', 'input_data', 'result', 'timestamp'];
    const rows = items.map((item) => header.map((key) => `"${String(item[key] || '').replaceAll('"', '""')}"`).join(','));
    const blob = new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'calcmaster-history.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return { load, add, clear, exportCsv };
})();

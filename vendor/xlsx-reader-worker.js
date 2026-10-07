/* Mobo-Vault — reads a spreadsheet (a bank statement for Reconciliation) in an isolated worker.
   SheetJS 0.18.5 has published flaws in READING crafted files (prototype pollution, and a pattern
   that can freeze the reader). Here they are contained: this worker shares nothing with the app,
   so anything a malicious file does stays inside it, and the app receives only plain rows of
   text. The app also shuts this worker down if it takes too long. */
importScripts('xlsx.full.min.js');
self.onmessage = function (e) {
  try {
    var wb = XLSX.read(e.data, { type: 'array', cellDates: true });
    var sheet = wb.Sheets[wb.SheetNames[0]];
    var rows = sheet ? XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' }) : [];
    // Plain text only crosses back: rows of strings, rebuilt from scratch.
    var clean = rows.map(function (r) { return (Array.isArray(r) ? r : []).map(function (c) { return c == null ? '' : String(c); }); });
    self.postMessage({ ok: true, rows: clean });
  } catch (err) {
    self.postMessage({ ok: false, error: String(err && err.message || err) });
  }
};

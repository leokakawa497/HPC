// HPC Health Parser — Web Worker
// Parses Apple Health export XML and returns daily summaries.
// Runs off the main thread so the UI never freezes.

const ASLEEP = new Set([
  'HKCategoryValueSleepAnalysisAsleep',
  'HKCategoryValueSleepAnalysisAsleepCore',
  'HKCategoryValueSleepAnalysisAsleepDeep',
  'HKCategoryValueSleepAnalysisAsleepREM',
]);
const STAGES = new Set([
  'HKCategoryValueSleepAnalysisAsleepCore',
  'HKCategoryValueSleepAnalysisAsleepDeep',
  'HKCategoryValueSleepAnalysisAsleepREM',
]);

// ── Find end of opening tag, respecting quoted attribute values ───────────────
// Apple Health 'device' attribute contains literal '>' chars (unescaped HKDevice)
// so we must skip '>' characters that appear inside "..." attribute values.
function findTagEnd(text, start) {
  let i = start;
  let inQuote = false;
  const len = text.length;
  while (i < len) {
    const c = text[i];
    if (c === '"') { inQuote = !inQuote; }
    else if (!inQuote && c === '>') { return i; }
    i++;
  }
  return -1;
}

// ── Attribute parser ──────────────────────────────────────────────────────────
function parseAttrs(tag) {
  const attrs = {};
  const re = /(\w+)="([^"]*)"/g;
  let m;
  while ((m = re.exec(tag)) !== null) attrs[m[1]] = m[2];
  return attrs;
}

// ── Date helpers — read local time directly from the string ──────────────────
// Apple Health dates: "2026-07-05 23:10:00 -0300"
function localHour(str) {
  const m = str && str.match(/\d{4}-\d{2}-\d{2} (\d{2}):/);
  return m ? parseInt(m[1]) : 0;
}
function localDate(str) {
  const m = str && str.match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : '';
}
function toUTC(str) {
  if (!str) return null;
  try {
    return new Date(str.replace(' ', 'T').replace(/([+-]\d{2})(\d{2})$/, '$1:$2')).getTime();
  } catch(e) { return null; }
}
function pad(n) { return String(n).padStart(2, '0'); }
function fmtHHMM(ms) {
  const d = new Date(ms);
  return pad(d.getHours()) + ':' + pad(d.getMinutes());
}

// Night date = the calendar day the user woke up on.
// Window: 15:00 one day → 14:59 next day.
function nightDate(startDateStr) {
  const h = localHour(startDateStr);
  const d = localDate(startDateStr);
  if (h >= 15) {
    // Sleep started in the evening — woke up the following calendar day
    const dt = new Date(d + 'T12:00:00Z');
    dt.setUTCDate(dt.getUTCDate() + 1);
    return dt.toISOString().slice(0, 10);
  }
  return d;
}

// ── Interval merge ────────────────────────────────────────────────────────────
function mergeIntervals(intervals) {
  if (!intervals.length) return [];
  const sorted = [...intervals].sort((a, b) => a.s - b.s);
  const out = [{ s: sorted[0].s, e: sorted[0].e }];
  for (let i = 1; i < sorted.length; i++) {
    const last = out[out.length - 1];
    if (sorted[i].s <= last.e) last.e = Math.max(last.e, sorted[i].e);
    else out.push({ s: sorted[i].s, e: sorted[i].e });
  }
  return out;
}

// ── Main parse ────────────────────────────────────────────────────────────────
self.onmessage = function(e) {
  const { buffer } = e.data;

  try {
    post(5, 'Decodificando arquivo...');
    const text = new TextDecoder('utf-8').decode(buffer);
    const len = text.length;

    post(15, 'Extraindo registros...');

    // Accumulators
    const sleepNights = {}; // date → { all: [], stages: [] }
    const weight      = {}; // date → kg (last wins — XML is chronological)
    const steps       = {}; // date → total count
    const hr          = {}; // date → min resting HR

    let total = 0;
    let pos = 0;

    while (pos < len) {
      const rs = text.indexOf('<Record ', pos);
      if (rs === -1) break;
      // Find end of opening tag, skipping '>' inside quoted attribute values
      const re = findTagEnd(text, rs);
      if (re === -1) break;

      const a = parseAttrs(text.slice(rs, re + 1));
      total++;
      pos = re + 1;

      if (total % 20000 === 0) {
        post(Math.round(15 + (pos / len) * 65), `Processando... ${total.toLocaleString()} registros`);
      }

      const t = a.type;

      // ── Sleep ──────────────────────────────────────────────────────────────
      if (t === 'HKCategoryTypeIdentifierSleepAnalysis') {
        if (!ASLEEP.has(a.value)) continue;
        const s = toUTC(a.startDate);
        const en = toUTC(a.endDate);
        if (!s || !en || en <= s) continue;
        const nd = nightDate(a.startDate);
        if (!sleepNights[nd]) sleepNights[nd] = { all: [], stages: [] };
        const interval = { s, e: en };
        sleepNights[nd].all.push(interval);
        if (STAGES.has(a.value)) sleepNights[nd].stages.push(interval);
        continue;
      }

      // ── Weight ─────────────────────────────────────────────────────────────
      if (t === 'HKQuantityTypeIdentifierBodyMass') {
        const d = localDate(a.startDate);
        const v = parseFloat(a.value);
        if (d && !isNaN(v) && v > 20 && v < 300) weight[d] = v;
        continue;
      }

      // ── Steps ──────────────────────────────────────────────────────────────
      if (t === 'HKQuantityTypeIdentifierStepCount') {
        const d = localDate(a.startDate);
        const v = parseInt(a.value);
        if (d && !isNaN(v) && v >= 0) steps[d] = (steps[d] || 0) + v;
        continue;
      }

      // ── Resting HR ─────────────────────────────────────────────────────────
      if (t === 'HKQuantityTypeIdentifierRestingHeartRate') {
        const d = localDate(a.startDate);
        const v = Math.round(parseFloat(a.value));
        if (d && !isNaN(v) && v > 20 && v < 250) {
          if (!hr[d] || v < hr[d]) hr[d] = v; // take lowest (most rested)
        }
        continue;
      }
    }

    post(82, 'Calculando noites de sono...');

    // ── Process sleep nights ──────────────────────────────────────────────────
    const sleepSummaries = {};
    for (const [date, data] of Object.entries(sleepNights)) {
      // Prefer granular stages (Core/Deep/REM) over generic Asleep
      const relevant = data.stages.length > 0 ? data.stages : data.all;
      const merged = mergeIntervals(relevant);
      const totalMs = merged.reduce((sum, r) => sum + (r.e - r.s), 0);
      const totalMin = Math.round(totalMs / 60000);
      if (totalMin < 30) continue; // ignore noise

      const allS = relevant.map(r => r.s);
      const allE = relevant.map(r => r.e);
      sleepSummaries[date] = {
        sleep_minutes: totalMin,
        sleep_start: fmtHHMM(Math.min(...allS)),
        sleep_end:   fmtHHMM(Math.max(...allE)),
      };
    }

    post(92, 'Montando resumos diários...');

    // ── Build per-day summaries ───────────────────────────────────────────────
    const allDates = new Set([
      ...Object.keys(sleepSummaries),
      ...Object.keys(weight),
      ...Object.keys(steps),
      ...Object.keys(hr),
    ]);

    const summaries = [];
    for (const date of allDates) {
      const sl = sleepSummaries[date] || {};
      summaries.push({
        date,
        sleep_minutes:      sl.sleep_minutes      || null,
        sleep_start:        sl.sleep_start        || null,
        sleep_end:          sl.sleep_end          || null,
        body_weight_kg:     weight[date]          || null,
        steps:              steps[date]           || null,
        resting_heart_rate: hr[date]              || null,
      });
    }

    summaries.sort((a, b) => (a.date < b.date ? -1 : 1));

    const dates = summaries.map(s => s.date);

    self.postMessage({
      done: true,
      summaries,
      stats: {
        totalRecords:  total,
        sleepNights:   Object.keys(sleepSummaries).length,
        weightDays:    Object.keys(weight).length,
        stepsDays:     Object.keys(steps).length,
        hrDays:        Object.keys(hr).length,
        dateFrom:      dates[0] || null,
        dateTo:        dates[dates.length - 1] || null,
      },
    });

  } catch(err) {
    self.postMessage({ error: err.message });
  }
};

function post(progress, status) {
  self.postMessage({ progress, status });
}

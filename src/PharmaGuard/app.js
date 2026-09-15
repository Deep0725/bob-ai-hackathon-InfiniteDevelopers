/* =====================================================================
   app.js — PharmaGuard Application Logic
   ===================================================================== */

'use strict';

// ── State ────────────────────────────────────────────────────────────
let signalData        = [];   // normalized rows from current upload
let signals           = [];   // all computed PRR results
let chartInstances    = {};
let currentSubmission = null; // parsed dossier modules

// ══════════════════════════════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════════════════════════════
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.remove('hidden');
  const navEl = document.querySelector(`[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');
  // close mobile menu
  document.getElementById('sidebar').classList.remove('open');
}

// ══════════════════════════════════════════════════════════════════════
//  SIGNAL DETECTION — File input
// ══════════════════════════════════════════════════════════════════════
document.getElementById('signal-file-input').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      if (!results.data || results.data.length === 0) {
        showError('No data found in the CSV file. Please check the file format.');
        return;
      }
      processSignalData(results.data);
    },
    error: function (err) {
      showError('Error parsing CSV: ' + err.message);
    }
  });
  // reset so same file can be re-uploaded
  this.value = '';
});

function loadSampleSignalData() {
  processSignalData(SAMPLE_ADVERSE_EVENTS);
}

function resetSignalPage() {
  document.getElementById('signal-results').classList.add('hidden');
  document.getElementById('signal-upload-area').classList.remove('hidden');
  signalData = []; signals = [];
  Object.values(chartInstances).forEach(c => { try { c.destroy(); } catch(_){} });
  chartInstances = {};
}

// ══════════════════════════════════════════════════════════════════════
//  SIGNAL DETECTION — Core processing
// ══════════════════════════════════════════════════════════════════════
function processSignalData(data) {
  document.getElementById('signal-upload-area').classList.add('hidden');
  document.getElementById('signal-results').classList.add('hidden');
  document.getElementById('signal-loading').classList.remove('hidden');

  setTimeout(() => {
    try {
      signalData = normalizeSignalData(data);
      if (signalData.length === 0) {
        document.getElementById('signal-loading').classList.add('hidden');
        document.getElementById('signal-upload-area').classList.remove('hidden');
        showError('No valid rows found. Ensure the CSV has drug_name and adverse_event columns.');
        return;
      }
      signals = calculatePRR(signalData);
      renderSignalResults();
      document.getElementById('signal-loading').classList.add('hidden');
      document.getElementById('signal-results').classList.remove('hidden');
    } catch (err) {
      // Always hide the spinner — never leave the UI frozen
      document.getElementById('signal-loading').classList.add('hidden');
      document.getElementById('signal-upload-area').classList.remove('hidden');
      showError('Signal Detection error: ' + (err.message || err));
      console.error('processSignalData error:', err);
    }
  }, 200);
}

function normalizeSignalData(data) {
  return data.map(row => {
    const n = {};
    for (const k in row) n[k.trim().toLowerCase().replace(/\s+/g, '_')] = String(row[k] ?? '').trim();
    return {
      drug_name:    n.drug_name    || n.drug    || n.product || '',
      adverse_event:n.adverse_event|| n.reaction|| n.event   || n.pt || '',
      report_id:    n.report_id    || n.id       || '',
      age:          parseInt(n.age) || null,
      sex:          n.sex          || n.gender   || '',
      report_date:  n.report_date  || n.date     || n.receipt_date || '',
      country:      n.country      || '',
      seriousness:  n.seriousness  || n.serious  || '',
      outcome:      n.outcome      || ''
    };
  }).filter(r => r.drug_name && r.adverse_event);
}

// ── PRR Calculation ───────────────────────────────────────────────────
function calculatePRR(data) {
  const totalReports    = data.length;
  const drugEventCounts = {};
  const drugCounts      = {};
  const eventCounts     = {};
  // Pre-build date buckets for trend calculation — one pass, O(n)
  const dateBuckets     = {}; // key -> { first: count, second: count }

  data.forEach(row => {
    const drug  = row.drug_name;
    const event = row.adverse_event;
    const key   = `${drug}|||${event}`;
    drugEventCounts[key] = (drugEventCounts[key] || 0) + 1;
    drugCounts[drug]     = (drugCounts[drug]     || 0) + 1;
    eventCounts[event]   = (eventCounts[event]   || 0) + 1;
    if (row.report_date) {
      if (!dateBuckets[key]) dateBuckets[key] = [];
      dateBuckets[key].push(row.report_date);
    }
  });

  // Pre-compute trends from the date arrays — still O(n) total
  const trendCache = {};
  for (const [key, dates] of Object.entries(dateBuckets)) {
    if (dates.length < 4) { trendCache[key] = 'Insufficient Data'; continue; }
    dates.sort();
    const mid    = Math.floor(dates.length / 2);
    const first  = mid;
    const second = dates.length - mid;
    if (second > first * 1.4)  trendCache[key] = 'Increasing';
    else if (first > second * 1.4) trendCache[key] = 'Decreasing';
    else trendCache[key] = 'Stable';
  }

  const results = [];

  // Only iterate over pairs that actually exist (drugEventCounts keys)
  for (const key of Object.keys(drugEventCounts)) {
    const [drug, event] = key.split('|||');
    const A = drugEventCounts[key];

    const B = drugCounts[drug]   - A;
    const C = eventCounts[event] - A;
    const D = totalReports - A - B - C;

    const denom1 = A + B;  // total reports for this drug
    const denom2 = C + D;  // total reports for other drugs
    if (denom1 === 0 || denom2 === 0) continue;

    const PRR = (A / denom1) / (C / denom2);
    // Chi-square (Pearson 2×2 contingency)
    const expected  = (denom1 * (A + C)) / totalReports;
    const chiSquare = expected > 0 ? Math.pow(A - expected, 2) / expected : 0;

    let severity = 'Low';
    if      (PRR >= 10 && chiSquare >= 10 && A >= 5) severity = 'High';
    else if (PRR >= 5  && chiSquare >= 4  && A >= 3) severity = 'Medium';

    const isSignal = PRR >= 2 && chiSquare >= 4 && A >= 3;
    const trend    = trendCache[key] || 'Insufficient Data';

    results.push({
      drug, event, A, B, C, D,
      PRR:       +PRR.toFixed(2),
      chiSquare: +chiSquare.toFixed(2),
      severity, isSignal, trend,
      explanation: generateExplanation(drug, event, A, B, C, D, PRR, chiSquare, severity, isSignal, trend)
    });
  }

  // Sort: signals first, then by PRR descending
  results.sort((a, b) => {
    if (a.isSignal !== b.isSignal) return b.isSignal - a.isSignal;
    return b.PRR - a.PRR;
  });

  return results;
}

function generateExplanation(drug, event, A, B, C, D, PRR, chiSquare, severity, isSignal, trend) {
  if (!isSignal) {
    return `No signal detected. PRR=${PRR.toFixed(2)} (threshold ≥2), Chi²=${chiSquare.toFixed(2)} (threshold ≥4), Reports=${A} (threshold ≥3). Statistical association thresholds not met.`;
  }
  const totalDrug   = A + B;
  const pctDrug     = (A / totalDrug * 100).toFixed(1);
  const pctOther    = C + D > 0 ? (C / (C + D) * 100).toFixed(1) : '0.0';
  let t = `Potential safety signal (statistical association): ${drug} is reported with "${event}" ${PRR.toFixed(1)}× more than expected. `;
  t    += `${A} of ${totalDrug} ${drug} reports (${pctDrug}%) mention this event vs ${pctOther}% for other drugs. `;
  t    += `Chi²=${chiSquare.toFixed(1)}. `;
  if (trend === 'Increasing') t += 'Reports trending upward. ';
  t    += 'Requires further investigation — does not establish causality.';
  return t;
}

// ══════════════════════════════════════════════════════════════════════
//  SIGNAL DETECTION — Rendering
// ══════════════════════════════════════════════════════════════════════
function renderSignalResults() {
  renderSignalSummary();
  renderSignalFilters();
  const sigs = signals.filter(s => s.isSignal);
  renderSignalTable(sigs);
  renderSignalCharts(sigs);
}

function renderSignalSummary() {
  const total      = signalData.length;
  const drugs      = new Set(signalData.map(r => r.drug_name)).size;
  const events     = new Set(signalData.map(r => r.adverse_event)).size;
  const sigCount   = signals.filter(s => s.isSignal).length;

  document.getElementById('signal-summary').innerHTML = `
    <div class="summary-card">
      <div class="label">Total Reports</div>
      <div class="value">${total}</div>
      <div class="detail">Adverse event reports analyzed</div>
    </div>
    <div class="summary-card">
      <div class="label">Unique Drugs</div>
      <div class="value">${drugs}</div>
      <div class="detail">Distinct drug products</div>
    </div>
    <div class="summary-card">
      <div class="label">Adverse Events</div>
      <div class="value">${events}</div>
      <div class="detail">Distinct event types</div>
    </div>
    <div class="summary-card">
      <div class="label">Safety Signals</div>
      <div class="value" style="color:${sigCount > 0 ? '#e74c3c' : '#27ae60'}">${sigCount}</div>
      <div class="detail">Potential signals requiring review</div>
    </div>
  `;
}

function renderSignalFilters() {
  const drugs  = [...new Set(signalData.map(r => r.drug_name))].sort();
  const events = [...new Set(signalData.map(r => r.adverse_event))].sort();

  const ds = document.getElementById('filter-drug');
  ds.innerHTML = '<option value="">All Drugs</option>';
  drugs.forEach(d => { ds.innerHTML += `<option value="${esc(d)}">${esc(d)}</option>`; });

  const es = document.getElementById('filter-event');
  es.innerHTML = '<option value="">All Events</option>';
  events.forEach(e => { es.innerHTML += `<option value="${esc(e)}">${esc(e)}</option>`; });
}

function applySignalFilters() {
  const drug     = document.getElementById('filter-drug').value;
  const event    = document.getElementById('filter-event').value;
  const prrRange = document.getElementById('filter-prr').value;
  const severity = document.getElementById('filter-severity').value;
  const dateFrom = document.getElementById('filter-date-from').value;
  const dateTo   = document.getElementById('filter-date-to').value;

  const filteredData = signalData.filter(row => {
    if (drug  && row.drug_name    !== drug)  return false;
    if (event && row.adverse_event !== event) return false;
    if (dateFrom && row.report_date && row.report_date < dateFrom) return false;
    if (dateTo   && row.report_date && row.report_date > dateTo)   return false;
    return true;
  });

  const filteredSignals = calculatePRR(filteredData).filter(s => {
    if (!s.isSignal) return false;
    if (severity && s.severity !== severity) return false;
    if (prrRange) {
      if (prrRange === '2-5'  && (s.PRR < 2  || s.PRR >= 5))  return false;
      if (prrRange === '5-10' && (s.PRR < 5  || s.PRR >= 10)) return false;
      if (prrRange === '10+'  && s.PRR < 10)                   return false;
    }
    return true;
  });

  renderSignalTable(filteredSignals);
  renderSignalCharts(filteredSignals);
}

function resetSignalFilters() {
  ['filter-drug','filter-event','filter-prr','filter-severity',
   'filter-date-from','filter-date-to'].forEach(id => {
    document.getElementById(id).value = '';
  });
  const sigs = signals.filter(s => s.isSignal);
  renderSignalTable(sigs);
  renderSignalCharts(sigs);
}

function renderSignalTable(data) {
  const tbody = document.getElementById('signals-tbody');
  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:#7f8c8d;">
      No signals match the current filters.</td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(s => `
    <tr>
      <td><strong>${esc(s.drug)}</strong></td>
      <td>${esc(s.event)}</td>
      <td>${s.A}</td>
      <td><strong>${s.PRR.toFixed(2)}</strong></td>
      <td>${s.chiSquare.toFixed(2)}</td>
      <td><span class="badge badge-${s.severity.toLowerCase()}">${s.severity}</span></td>
      <td class="${s.trend === 'Increasing' ? 'trend-up' : s.trend === 'Decreasing' ? 'trend-down' : 'trend-stable'}">${s.trend}</td>
      <td style="max-width:300px;font-size:12px;line-height:1.4;">${esc(s.explanation)}</td>
    </tr>`).join('');
}

// ── Charts ────────────────────────────────────────────────────────────
function renderSignalCharts(signalList) {
  // If Chart.js hasn't loaded (e.g. CDN blocked), skip charts silently
  if (typeof Chart === 'undefined') return;

  const data = signalList || signals.filter(s => s.isSignal);

  // Destroy previous chart instances
  Object.values(chartInstances).forEach(c => { try { c.destroy(); } catch(_){} });
  chartInstances = {};

  // 1. Top signals by PRR (horizontal bar)
  const top = data.slice(0, 10);
  if (top.length > 0) {
    const ctx = document.getElementById('chart-top-signals');
    clearCanvas(ctx);
    chartInstances.topSignals = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: top.map(s => truncate(`${s.drug} / ${s.event}`, 30)),
        datasets: [{
          label: 'PRR',
          data: top.map(s => s.PRR),
          backgroundColor: top.map(s =>
            s.severity === 'High'   ? '#e74c3c' :
            s.severity === 'Medium' ? '#f39c12' : '#3498db'),
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` PRR: ${ctx.raw}` } } },
        scales: { x: { beginAtZero: true, title: { display: true, text: 'PRR Value' } } }
      }
    });
  }

  // 2. PRR vs Chi-Square grouped bar
  const compare = data.slice(0, 8);
  if (compare.length > 0) {
    const ctx2 = document.getElementById('chart-prr-comparison');
    clearCanvas(ctx2);
    chartInstances.prrComparison = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: compare.map(s => truncate(`${s.drug} + ${s.event}`, 22)),
        datasets: [
          { label: 'PRR', data: compare.map(s => s.PRR),
            backgroundColor: '#2980b9', borderRadius: 4, yAxisID: 'y' },
          { label: 'Chi²', data: compare.map(s => s.chiSquare),
            backgroundColor: '#e74c3c', borderRadius: 4, yAxisID: 'y1' }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          y:  { beginAtZero: true, position: 'left',  title: { display: true, text: 'PRR' } },
          y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Chi²' } }
        }
      }
    });
  }

  // 3. Adverse event frequency (doughnut)
  const freq = {};
  signalData.forEach(r => { freq[r.adverse_event] = (freq[r.adverse_event] || 0) + 1; });
  const sortedFreq = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (sortedFreq.length > 0) {
    const ctx3 = document.getElementById('chart-event-freq');
    clearCanvas(ctx3);
    chartInstances.eventFreq = new Chart(ctx3, {
      type: 'doughnut',
      data: {
        labels: sortedFreq.map(e => e[0]),
        datasets: [{
          data: sortedFreq.map(e => e[1]),
          backgroundColor: ['#1a5276','#2980b9','#3498db','#5dade2','#85c1e9',
                            '#aed6f1','#d4e6f1','#e74c3c','#f39c12','#27ae60']
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 12 } } }
      }
    });
  }

  // 4. Trend over time (line chart)
  const dateTrends = {};
  signalData.filter(r => r.report_date).forEach(r => {
    const month = r.report_date.substring(0, 7);
    const key   = `${r.drug_name}|||${r.adverse_event}`;
    if (!dateTrends[key]) dateTrends[key] = { drug: r.drug_name, event: r.adverse_event, months: {} };
    dateTrends[key].months[month] = (dateTrends[key].months[month] || 0) + 1;
  });

  // Pick the signals from our filtered list that have date data
  const trendCandidates = Object.values(dateTrends)
    .filter(t => Object.keys(t.months).length >= 2)
    .slice(0, 5);

  if (trendCandidates.length > 0) {
    const allMonths = [...new Set(trendCandidates.flatMap(t => Object.keys(t.months)))].sort();
    const colors = ['#1a5276','#e74c3c','#27ae60','#f39c12','#8e44ad'];
    const ctx4 = document.getElementById('chart-trend');
    clearCanvas(ctx4);
    chartInstances.trend = new Chart(ctx4, {
      type: 'line',
      data: {
        labels: allMonths,
        datasets: trendCandidates.map((t, i) => ({
          label: truncate(`${t.drug} — ${t.event}`, 28),
          data: allMonths.map(m => t.months[m] || 0),
          borderColor: colors[i % colors.length],
          backgroundColor: colors[i % colors.length] + '18',
          fill: true, tension: 0.3, pointRadius: 4
        }))
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Report Count' } },
          x: { title: { display: true, text: 'Month' } }
        },
        plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } } }
      }
    });
  }
}

// ══════════════════════════════════════════════════════════════════════
//  SIGNAL DETECTION — Export
// ══════════════════════════════════════════════════════════════════════
function exportSignalCSV() {
  const data = signals.filter(s => s.isSignal);
  if (data.length === 0) { showError('No signals to export.'); return; }
  const headers = ['Drug Name','Adverse Event','Reports (A)','Drug Other Events (B)',
                   'Event Other Drugs (C)','All Other (D)','PRR','Chi-Square','Severity','Trend','Explanation'];
  const rows = data.map(s => [
    s.drug, s.event, s.A, s.B, s.C, s.D, s.PRR, s.chiSquare, s.severity, s.trend,
    `"${s.explanation.replace(/"/g, '""')}"`
  ]);
  let csv = headers.join(',') + '\n';
  rows.forEach(r => { csv += r.join(',') + '\n'; });
  downloadFile(csv, 'safety-signals.csv', 'text/csv');
}

function exportSignalPDF() {
  const data = signals.filter(s => s.isSignal);
  if (data.length === 0) { showError('No signals to export.'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'mm', 'a4');

  doc.setFontSize(16); doc.setTextColor(14, 47, 68);
  doc.text('PharmaGuard — Drug Safety Signal Detection Report', 14, 18);
  doc.setFontSize(9); doc.setTextColor(80, 80, 80);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
  doc.text(`Total Reports: ${signalData.length}  |  Signals Detected: ${data.length}  |  Synthetic Demo Data — Not Real Pharmacovigilance Data`, 14, 32);
  doc.setFontSize(8); doc.setTextColor(150, 100, 0);
  doc.text('These are potential safety signals (statistical associations). They do not establish causality and require expert review.', 14, 38);

  doc.autoTable({
    startY: 44,
    head: [['Drug','Adverse Event','Reports','PRR','Chi²','Severity','Trend']],
    body: data.map(s => [s.drug, s.event, s.A, s.PRR.toFixed(2), s.chiSquare.toFixed(2), s.severity, s.trend]),
    theme: 'grid',
    headStyles: { fillColor: [26, 82, 118], fontSize: 8 },
    styles: { fontSize: 8 },
    columnStyles: { 6: { cellWidth: 22 } }
  });

  doc.save('safety-signals-report.pdf');
}

// ══════════════════════════════════════════════════════════════════════
//  SUBMISSION READINESS — File input
// ══════════════════════════════════════════════════════════════════════
document.getElementById('submission-file-input').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => analyzeDossierText(ev.target.result);
  reader.readAsText(file);
  this.value = '';
});

function loadSampleDossier() {
  analyzeDossierText(SAMPLE_DOSSIER);
}

function showDossierEditor() {
  document.getElementById('submission-upload-area').classList.add('hidden');
  document.getElementById('dossier-editor').classList.remove('hidden');
}

function hideDossierEditor() {
  document.getElementById('dossier-editor').classList.add('hidden');
  document.getElementById('submission-upload-area').classList.remove('hidden');
}

function resetSubmissionPage() {
  document.getElementById('submission-results').classList.add('hidden');
  document.getElementById('submission-upload-area').classList.remove('hidden');
  document.getElementById('dossier-editor').classList.add('hidden');
  currentSubmission = null;
}

// ══════════════════════════════════════════════════════════════════════
//  SUBMISSION READINESS — Core processing
// ══════════════════════════════════════════════════════════════════════
function analyzeDossierText(text) {
  if (!text) text = document.getElementById('dossier-textarea').value;
  if (!text.trim()) { showError('Please enter or upload a dossier outline.'); return; }

  document.getElementById('submission-upload-area').classList.add('hidden');
  document.getElementById('dossier-editor').classList.add('hidden');
  document.getElementById('submission-results').classList.add('hidden');
  document.getElementById('submission-loading').classList.remove('hidden');

  setTimeout(() => {
    currentSubmission = parseDossier(text);
    const analysis    = analyzeDossier(currentSubmission);
    renderSubmissionResults(analysis);
    document.getElementById('submission-loading').classList.add('hidden');
    document.getElementById('submission-results').classList.remove('hidden');
  }, 700);
}

function parseDossier(text) {
  const lines   = text.split('\n').map(l => l.trim()).filter(l => l);
  const modules = {};
  let current   = null;

  lines.forEach(line => {
    const m = line.match(/^Module\s+(\d+)/i);
    if (m) {
      current = `Module ${m[1]}`;
      modules[current] = [];
    } else if (current && /^[\-\*•]/.test(line)) {
      modules[current].push(line.replace(/^[\-\*•]\s*/, '').trim());
    }
  });
  return modules;
}

function analyzeDossier(submitted) {
  const analysis = {
    modules: {}, overallScore: 0, gaps: [], recommendations: [],
    totalSections: 0, presentSections: 0
  };

  for (const [key, expected] of Object.entries(EXPECTED_CTD_STRUCTURE)) {
    const submittedSections = submitted[key] || [];
    const subLow = submittedSections.map(s => s.toLowerCase().trim());

    const mod = {
      name: expected.name,
      expected: expected.sections,
      present: [], missing: [],
      completeness: 0,
      priority: expected.priority
    };

    expected.sections.forEach(section => {
      const sLow = section.toLowerCase();
      const found = subLow.some(s => s.includes(sLow) || sLow.includes(s));
      if (found) mod.present.push(section);
      else       mod.missing.push(section);
    });

    mod.completeness = expected.sections.length > 0
      ? Math.round((mod.present.length / expected.sections.length) * 100)
      : 0;

    analysis.totalSections   += expected.sections.length;
    analysis.presentSections += mod.present.length;
    analysis.modules[key]     = mod;

    mod.missing.forEach(section => {
      // Determine gap priority
      let gapPriority = 'Low';
      if (expected.priority === 'critical') {
        if (/stability|clinical study report|clinical trial/i.test(section)) gapPriority = 'Critical';
        else gapPriority = 'High';
      } else if (expected.priority === 'high') {
        gapPriority = 'Medium';
      }

      analysis.gaps.push({ module: key, section, priority: gapPriority });

      if (gapPriority === 'Critical') {
        analysis.recommendations.push(`URGENT: Complete "${section}" in ${key} — critical for submission.`);
      } else if (gapPriority === 'High') {
        analysis.recommendations.push(`Complete "${section}" in ${key} as soon as possible.`);
      } else {
        analysis.recommendations.push(`Add "${section}" to ${key}.`);
      }
    });
  }

  analysis.overallScore = analysis.totalSections > 0
    ? Math.round((analysis.presentSections / analysis.totalSections) * 100)
    : 0;

  if (analysis.gaps.length === 0) {
    analysis.recommendations.push('All expected CTD sections are present. Perform a detailed content review before submission.');
  } else {
    analysis.recommendations.push('Complete all missing sections and perform another readiness check.');
    analysis.recommendations.push('Consult regulatory experts for official requirements and regional variations.');
  }

  return analysis;
}

// ══════════════════════════════════════════════════════════════════════
//  SUBMISSION READINESS — Rendering
// ══════════════════════════════════════════════════════════════════════
function renderSubmissionResults(analysis) {
  const sc = analysis.overallScore >= 80 ? 'score-high' : analysis.overallScore >= 50 ? 'score-medium' : 'score-low';
  const icon = analysis.overallScore >= 80 ? '✓' : analysis.overallScore >= 50 ? '⚠' : '✗';

  document.getElementById('readiness-overview').innerHTML = `
    <div class="readiness-label">Overall Readiness</div>
    <div class="readiness-score ${sc}">${analysis.overallScore}% ${icon}</div>
    <div class="readiness-label">${analysis.presentSections} of ${analysis.totalSections} expected sections present</div>
  `;

  // Module cards
  let mHTML = '';
  for (const [key, mod] of Object.entries(analysis.modules)) {
    const pc  = mod.completeness >= 80 ? 'progress-high' : mod.completeness >= 50 ? 'progress-medium' : 'progress-low';
    const bc  = mod.completeness === 100 ? 'badge-complete' : mod.completeness >= 50 ? 'badge-partial' : 'badge-missing';
    const st  = mod.completeness === 100 ? '✓ Complete' : `${mod.completeness}%`;
    mHTML += `
      <div class="module-card">
        <h4><span>${key}</span><span class="badge ${bc}">${st}</span></h4>
        <div class="progress-bar"><div class="progress-fill ${pc}" style="width:${mod.completeness}%"></div></div>
        <div class="module-sections"><ul>
          ${mod.present.map(s => `<li class="section-present">✓ ${esc(s)}</li>`).join('')}
          ${mod.missing.map(s => `<li class="section-missing">✗ ${esc(s)}</li>`).join('')}
        </ul></div>
      </div>`;
  }
  document.getElementById('module-progress').innerHTML = mHTML;

  // Gap analysis
  const sorted = analysis.gaps.slice().sort((a, b) => {
    const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return order[a.priority] - order[b.priority];
  });

  if (sorted.length === 0) {
    document.getElementById('gap-section').innerHTML = `
      <h3>Gap Analysis</h3>
      <p style="color:#27ae60;font-weight:600;padding:12px 0;">✓ No gaps detected — all expected CTD sections are present.</p>`;
  } else {
    document.getElementById('gap-section').innerHTML = `
      <h3>Gap Analysis <span style="font-size:14px;font-weight:400;color:#7f8c8d;">(${sorted.length} gap${sorted.length > 1 ? 's' : ''} found)</span></h3>
      ${sorted.map(g => `
        <div class="gap-item ${g.priority.toLowerCase()}">
          <span class="badge badge-${g.priority.toLowerCase()}">${g.priority}</span>
          <span class="gap-module">${esc(g.module)}</span>
          <span class="gap-desc">${esc(g.section)}</span>
        </div>`).join('')}`;
  }

  // Recommendations
  document.getElementById('recommendations-section').innerHTML = `
    <h3>Recommendations</h3>
    ${analysis.recommendations.map(r => `
      <div class="recommendation-item">
        <span class="rec-icon">${r.startsWith('URGENT') ? '🔴' : r.startsWith('Complete') || r.startsWith('Add') ? '⚠️' : '💡'}</span>
        <span>${esc(r)}</span>
      </div>`).join('')}`;

}

// ══════════════════════════════════════════════════════════════════════
//  SUBMISSION READINESS — Export
// ══════════════════════════════════════════════════════════════════════
function exportSubmissionCSV() {
  if (!currentSubmission) return;
  const analysis = analyzeDossier(currentSubmission);
  let csv = 'Module,Section,Status,Priority\n';
  for (const [key, mod] of Object.entries(analysis.modules)) {
    mod.present.forEach(s => { csv += `"${key}","${s}","Present","-"\n`; });
    mod.missing.forEach(s => {
      const g = analysis.gaps.find(x => x.module === key && x.section === s);
      csv += `"${key}","${s}","Missing","${g ? g.priority : '-'}"\n`;
    });
  }
  csv += '\nRecommendations\n';
  analysis.recommendations.forEach(r => { csv += `"${r.replace(/"/g, '""')}"\n`; });
  downloadFile(csv, 'submission-readiness.csv', 'text/csv');
}

function exportSubmissionPDF() {
  if (!currentSubmission) return;
  const { jsPDF } = window.jspdf;
  const doc      = new jsPDF('p', 'mm', 'a4');
  const analysis = analyzeDossier(currentSubmission);

  doc.setFontSize(16); doc.setTextColor(14, 47, 68);
  doc.text('PharmaGuard — Regulatory Submission Readiness Report', 14, 18);
  doc.setFontSize(9); doc.setTextColor(80, 80, 80);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
  doc.setFontSize(12); doc.setTextColor(14, 47, 68);
  doc.text(`Overall Readiness: ${analysis.overallScore}%  (${analysis.presentSections} / ${analysis.totalSections} sections present)`, 14, 38);

  let y = 50;
  for (const [key, mod] of Object.entries(analysis.modules)) {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(11); doc.setTextColor(14, 47, 68);
    doc.text(`${key}: ${mod.completeness}% complete`, 14, y); y += 7;
    doc.setFontSize(8);
    mod.present.forEach(s => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.setTextColor(39, 174, 96); doc.text(`  ✓ ${s}`, 18, y); y += 5;
    });
    mod.missing.forEach(s => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.setTextColor(200, 50, 50); doc.text(`  ✗ ${s}`, 18, y); y += 5;
    });
    doc.setTextColor(0, 0, 0); y += 4;
  }

  if (y > 240) { doc.addPage(); y = 20; }
  doc.setFontSize(11); doc.setTextColor(14, 47, 68);
  doc.text('Recommendations:', 14, y); y += 8;
  doc.setFontSize(8); doc.setTextColor(60, 60, 60);
  analysis.recommendations.forEach(r => {
    if (y > 275) { doc.addPage(); y = 20; }
    const lines = doc.splitTextToSize(`• ${r}`, 180);
    doc.text(lines, 14, y); y += lines.length * 5;
  });

  doc.setFontSize(7); doc.setTextColor(150, 150, 150);
  doc.text('This prototype is for demonstration and decision-support purposes only. It does not establish causality or constitute official regulatory advice.', 14, 285);
  doc.save('submission-readiness-report.pdf');
}

// ══════════════════════════════════════════════════════════════════════
//  DRAG AND DROP
// ══════════════════════════════════════════════════════════════════════
document.querySelectorAll('.upload-area').forEach(area => {
  area.addEventListener('dragover', e => {
    e.preventDefault();
    area.style.borderColor = '#2980b9';
    area.style.background  = '#f0f7ff';
  });
  area.addEventListener('dragleave', () => {
    area.style.borderColor = '';
    area.style.background  = '';
  });
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.style.borderColor = '';
    area.style.background  = '';
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (area.id === 'signal-upload-area') {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: r => processSignalData(r.data),
        error: err => showError('Error parsing CSV: ' + err.message)
      });
    } else if (area.id === 'submission-upload-area') {
      const reader = new FileReader();
      reader.onload = ev => analyzeDossierText(ev.target.result);
      reader.readAsText(file);
    }
  });
});

// ══════════════════════════════════════════════════════════════════════
//  UTILITIES
// ══════════════════════════════════════════════════════════════════════
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showError(msg) {
  alert(msg);
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(str, len) {
  return str.length > len ? str.substring(0, len - 1) + '…' : str;
}

function clearCanvas(ctx) {
  // Chart.js destroy is enough; this is a no-op safety call
}

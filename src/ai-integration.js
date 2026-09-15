/**
 * ai-integration.js
 * PharmaGuard — Generative AI interpretation layer (Groq / LLaMA 3)
 *
 * Responsibilities:
 *   • Send detected signal data to the backend proxy for AI interpretation
 *   • Send regulatory analysis results to the backend proxy for AI interpretation
 *   • Render AI Safety Assessment and AI Regulatory Assessment sections in the UI
 *   • Fail gracefully — all existing deterministic results remain visible if AI is unavailable
 *
 * Architecture:
 *   Frontend (ai-integration.js)
 *   → Express backend (server.js, port 3001)  ← API key lives here only
 *   → Groq Chat Completions API (free tier, OpenAI-compatible)
 *   → Response rendered into dedicated AI sections in the DOM
 */

const AI_BACKEND_URL = 'http://localhost:3001';

// ── Helpers ────────────────────────────────────────────────────────────────

function setAISection(containerId, html) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = html;
}

function aiLoadingHTML(label) {
  return `
    <div class="ai-assessment-box ai-loading">
      <div class="ai-header">
        <span class="ai-badge">Groq AI</span>
        <span class="ai-title">${label}</span>
      </div>
      <div class="ai-body">
        <div class="ai-spinner"></div>
        <p class="ai-status-text">Requesting Groq AI assessment…</p>
      </div>
    </div>`;
}

function aiErrorHTML(label, message) {
  return `
    <div class="ai-assessment-box ai-error">
      <div class="ai-header">
        <span class="ai-badge">Groq AI</span>
        <span class="ai-title">${label}</span>
      </div>
      <div class="ai-body">
        <p class="ai-error-text">⚠ AI assessment unavailable: ${escAI(message)}</p>
        <p class="ai-error-sub">The deterministic analysis above remains fully accurate and unaffected.</p>
      </div>
    </div>`;
}

function aiResultHTML(label, text) {
  // Convert plain-text paragraphs to HTML paragraphs
  const paragraphs = text.trim().split(/\n{2,}/).map(p =>
    `<p>${p.trim().replace(/\n/g, '<br>')}</p>`
  ).join('');
  return `
    <div class="ai-assessment-box ai-result">
      <div class="ai-header">
        <span class="ai-badge">Groq AI</span>
        <span class="ai-title">${label}</span>
        <span class="ai-disclaimer">AI-generated interpretation — not a substitute for expert review</span>
      </div>
      <div class="ai-body ai-prose">${paragraphs}</div>
    </div>`;
}

function escAI(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Core request function ──────────────────────────────────────────────────

async function callBackendEndpoint(endpoint, payload) {
  const response = await fetch(`${AI_BACKEND_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`Server responded ${response.status}: ${errBody || response.statusText}`);
  }
  const data = await response.json();
  if (!data.result) throw new Error('Unexpected response from backend — no result field.');
  return data.result;
}

// ══════════════════════════════════════════════════════════════════════════
//  SIGNAL DETECTION — AI Safety Assessment
// ══════════════════════════════════════════════════════════════════════════

/**
 * Called after calculatePRR() and renderSignalResults() finish.
 * Takes the top detected signals and requests a Groq AI interpretation.
 *
 * @param {Array} signalList  — filtered array of signals where isSignal === true
 */
async function requestSignalAIAssessment(signalList) {
  const containerId = 'ai-signal-assessment';
  setAISection(containerId, aiLoadingHTML('AI Safety Assessment'));

  try {
    // Send top 5 signals to keep the prompt focused and concise
    const topSignals = signalList.slice(0, 5).map(s => ({
      drug:         s.drug,
      adverse_event:s.event,
      reports:      s.A,
      PRR:          s.PRR,
      chi_square:   s.chiSquare,
      severity:     s.severity,
      trend:        s.trend,
      drug_event_pct: s.A + s.B > 0 ? +((s.A / (s.A + s.B)) * 100).toFixed(1) : 0,
      background_pct: s.C + s.D > 0 ? +((s.C / (s.C + s.D)) * 100).toFixed(1) : 0
    }));

    const result = await callBackendEndpoint('/api/signal-assessment', { signals: topSignals });
    setAISection(containerId, aiResultHTML('AI Safety Assessment', result));
  } catch (err) {
    console.warn('[PharmaGuard AI] Signal assessment failed:', err.message);
    setAISection(containerId, aiErrorHTML('AI Safety Assessment', err.message));
  }
}

// ══════════════════════════════════════════════════════════════════════════
//  SUBMISSION READINESS — AI Regulatory Assessment
// ══════════════════════════════════════════════════════════════════════════

/**
 * Called after analyzeDossier() and renderSubmissionResults() finish.
 * Sends the regulatory analysis object to Groq AI for interpretation.
 *
 * @param {Object} analysis  — result object from analyzeDossier()
 */
async function requestRegulatoryAIAssessment(analysis) {
  const containerId = 'ai-regulatory-assessment';
  setAISection(containerId, aiLoadingHTML('AI Regulatory Assessment'));

  try {
    const criticalGaps = analysis.gaps.filter(g => g.priority === 'Critical').map(g => `${g.module}: ${g.section}`);
    const highGaps     = analysis.gaps.filter(g => g.priority === 'High').map(g => `${g.module}: ${g.section}`);
    const mediumGaps   = analysis.gaps.filter(g => g.priority === 'Medium').map(g => `${g.module}: ${g.section}`);
    const lowGaps      = analysis.gaps.filter(g => g.priority === 'Low').map(g => `${g.module}: ${g.section}`);

    const moduleScores = Object.entries(analysis.modules).map(([key, mod]) => ({
      module: key, name: mod.name, completeness: mod.completeness
    }));

    const payload = {
      overallScore:     analysis.overallScore,
      totalSections:    analysis.totalSections,
      presentSections:  analysis.presentSections,
      missingSections:  analysis.totalSections - analysis.presentSections,
      criticalGaps,
      highGaps,
      mediumGaps,
      lowGaps,
      moduleScores,
      existingRecommendations: analysis.recommendations.slice(0, 5)
    };

    const result = await callBackendEndpoint('/api/regulatory-assessment', payload);
    setAISection(containerId, aiResultHTML('AI Regulatory Assessment', result));
  } catch (err) {
    console.warn('[PharmaGuard AI] Regulatory assessment failed:', err.message);
    setAISection(containerId, aiErrorHTML('AI Regulatory Assessment', err.message));
  }
}

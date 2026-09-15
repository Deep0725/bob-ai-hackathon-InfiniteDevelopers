/**
 * server.js
 * PharmaGuard — Express backend proxy for Groq (free LLM API)
 *
 * Architecture:
 *   Frontend → /api/signal-assessment or /api/regulatory-assessment
 *   → Groq Chat Completions API (OpenAI-compatible, free tier)
 *   → JSON response back to frontend
 *
 * Security:
 *   - Groq API key is read from .env — never exposed to the browser
 *   - Get a free key at https://console.groq.com/keys
 */

'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const fetch   = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const app  = express();
const PORT = process.env.PORT || 3001;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL   = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';

if (!GROQ_API_KEY || GROQ_API_KEY === 'YOUR_GROQ_API_KEY') {
  console.warn('[PharmaGuard server] WARNING: GROQ_API_KEY is not set in .env');
  console.warn('[PharmaGuard server] Get a free key at https://console.groq.com/keys');
  console.warn('[PharmaGuard server] AI endpoints will return an error until the key is set.');
}

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000', 'http://127.0.0.1:3000',
    'http://localhost:5500', 'http://127.0.0.1:5500',
    'http://localhost:5501', 'http://127.0.0.1:5501',
    'null'  // file:// origin when opening index.html directly
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '1mb' }));

// ── Groq API call ──────────────────────────────────────────────────────────
async function callGroq(systemPrompt, userPrompt) {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'YOUR_GROQ_API_KEY') {
    throw new Error('GROQ_API_KEY is not configured. Set it in .env (free key at https://console.groq.com/keys).');
  }

  const resp = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type':  'application/json'
    },
    body: JSON.stringify({
      model:       GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   }
      ],
      max_completion_tokens: 600,
      temperature:           0.3
    })
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    // Log the full Groq error to the terminal for easy debugging
    console.error(`[PharmaGuard server] Groq API returned ${resp.status}:`);
    console.error(errText || '(empty response body)');
    throw new Error(`Groq API error (${resp.status}): ${errText}`);
  }

  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Unexpected Groq response — no content in choices[0].message.content.');
  return text.trim();
}

// ── Prompt builders ────────────────────────────────────────────────────────
function buildSignalSystem() {
  return `You are a senior pharmacovigilance expert. You provide concise, practical safety signal assessments for review teams. You interpret statistical results — you do NOT recalculate them. Always note that statistical associations require expert clinical and regulatory review and do not prove causality. Keep responses clear, structured, and under 500 words.`;
}

function buildSignalUser(signals) {
  const lines = signals.map((s, i) =>
    `${i + 1}. Drug: ${s.drug} | Adverse Event: ${s.adverse_event} | Reports: ${s.reports} | PRR: ${s.PRR} | Chi-square: ${s.chi_square} | Severity: ${s.severity} | Trend: ${s.trend} | Drug event rate: ${s.drug_event_pct}% vs background ${s.background_pct}%`
  ).join('\n');

  return `The following safety signals were detected by a deterministic PRR (Proportional Reporting Ratio) algorithm. Do NOT recalculate any values.

Detected signals:
${lines}

Provide an AI Safety Assessment covering:
1. Why each signal may deserve pharmacovigilance attention
2. What the PRR and Chi-square values indicate about association strength
3. The significance of severity classification and trend direction
4. Suggested pharmacovigilance follow-up actions`;
}

function buildRegulatorySystem() {
  return `You are a senior regulatory affairs expert specializing in ICH M4 CTD dossier preparation. You provide concise, actionable regulatory assessments. You interpret gap analysis results — you do NOT recalculate scores. Keep responses clear, structured, and under 500 words.`;
}

function buildRegulatoryUser(data) {
  const criticalList = data.criticalGaps.length > 0 ? data.criticalGaps.join('; ') : 'None';
  const highList     = data.highGaps.length > 0     ? data.highGaps.join('; ')     : 'None';
  const mediumList   = data.mediumGaps.length > 0   ? data.mediumGaps.join('; ')   : 'None';
  const moduleLines  = data.moduleScores.map(m =>
    `  • ${m.module} (${m.name}): ${m.completeness}% complete`
  ).join('\n');

  return `A deterministic CTD gap-detection algorithm produced the following dossier readiness analysis. Do NOT recalculate the score.

Overall Readiness Score: ${data.overallScore}%
Sections Present: ${data.presentSections} of ${data.totalSections}
Sections Missing: ${data.missingSections}

Module Completeness:
${moduleLines}

Gap Summary:
  Critical gaps: ${criticalList}
  High-priority gaps: ${highList}
  Medium-priority gaps: ${mediumList}

Provide an AI Regulatory Assessment covering:
1. Interpretation of the overall readiness score and submission preparedness
2. Significance of critical and high-priority gaps and why they must be resolved first
3. Practical, prioritized next steps to address gaps before submission
4. Broader regulatory strategy considerations given the current dossier state`;
}

// ── API routes ─────────────────────────────────────────────────────────────
app.post('/api/signal-assessment', async (req, res) => {
  try {
    const { signals } = req.body;
    if (!Array.isArray(signals) || signals.length === 0) {
      return res.status(400).json({ error: 'No signals provided.' });
    }
    const result = await callGroq(buildSignalSystem(), buildSignalUser(signals));
    res.json({ result });
  } catch (err) {
    console.error('[PharmaGuard server] /api/signal-assessment error:', err.message);
    res.status(502).json({ error: err.message });
  }
});

app.post('/api/regulatory-assessment', async (req, res) => {
  try {
    const data = req.body;
    if (typeof data.overallScore !== 'number') {
      return res.status(400).json({ error: 'Invalid regulatory assessment payload.' });
    }
    const result = await callGroq(buildRegulatorySystem(), buildRegulatoryUser(data));
    res.json({ result });
  } catch (err) {
    console.error('[PharmaGuard server] /api/regulatory-assessment error:', err.message);
    res.status(502).json({ error: err.message });
  }
});

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'PharmaGuard AI proxy',
    model: GROQ_MODEL,
    apiKeySet: !!(GROQ_API_KEY && GROQ_API_KEY !== 'YOUR_GROQ_API_KEY')
  });
});

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[PharmaGuard server] Listening on http://localhost:${PORT}`);
  if (!GROQ_API_KEY || GROQ_API_KEY === 'YOUR_GROQ_API_KEY') {
    console.warn('[PharmaGuard server] ⚠  Set GROQ_API_KEY in .env to enable AI (free at https://console.groq.com/keys)');
  } else {
    console.log(`[PharmaGuard server] ✓ Groq AI proxy ready (model: ${GROQ_MODEL})`);
  }
});

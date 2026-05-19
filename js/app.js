/**
 * UC19 - Main App Module
 * Concepts: DOM Manipulation, Event Handling, Forms, Conditional Logic,
 * Dynamic UI Rendering, Async/Callback, Promises.
 */
'use strict';

// ── DOM References ─────────────────────────────────────────────────────────────
const form             = document.getElementById('convertForm');
const categorySelect   = document.getElementById('category');
const fromUnitSelect   = document.getElementById('fromUnit');
const toUnitSelect     = document.getElementById('toUnit');
const valueInput       = document.getElementById('value');
const resultDiv        = document.getElementById('result');
const resultValueSpan  = document.getElementById('resultValue');
const resultUnitSpan   = document.getElementById('resultUnit');
const errorDiv         = document.getElementById('error');
const loaderDiv        = document.getElementById('loader');
const historyList      = document.getElementById('historyList');
const clearHistoryBtn  = document.getElementById('clearHistory');
const loadMeasurementsBtn = document.getElementById('loadMeasurements');
const measurementsList = document.getElementById('measurementsList');

// ── State ──────────────────────────────────────────────────────────────────────
let history = JSON.parse(localStorage.getItem('qma_history') || '[]');

// ── Unit Population (Dynamic UI Rendering) ─────────────────────────────────────
categorySelect.addEventListener('change', function() {
    const cat = this.value;
    [fromUnitSelect, toUnitSelect].forEach(sel => {
        sel.innerHTML = '<option value="">Select unit…</option>';
        if (cat && UNITS[cat]) {
            UNITS[cat].units.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id; opt.textContent = u.name;
                sel.appendChild(opt);
            });
        }
    });
    hideResult();
});

// ── Form Submit — Event Handling + Conditional Logic ──────────────────────────
form.addEventListener('submit', function(e) {
    e.preventDefault();
    hideError(); hideResult();

    try {
        const result = converter.convert(
            valueInput.value,
            categorySelect.value,
            fromUnitSelect.value,
            toUnitSelect.value
        );
        showResult(result);
        addToHistory(result);
    } catch (err) {
        showError(err.message);
    }
});

// ── Display Functions ──────────────────────────────────────────────────────────
function showResult(result) {
    resultValueSpan.textContent = result.formatted;
    resultUnitSpan.textContent  = result.toUnit;
    resultDiv.classList.remove('hidden');
}

function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.classList.remove('hidden');
}

function hideResult() { resultDiv.classList.add('hidden'); }
function hideError()  { errorDiv.classList.add('hidden'); }

// ── History Management ─────────────────────────────────────────────────────────
function addToHistory(result) {
    const entry = {
        ts: new Date().toLocaleTimeString(),
        text: `${result.input} ${result.fromUnit} → ${result.formatted} ${result.toUnit}`
    };
    history.unshift(entry);
    if (history.length > 20) history.pop();
    localStorage.setItem('qma_history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<p class="history__empty">No conversions yet.</p>';
        return;
    }
    historyList.innerHTML = history.map(h =>
        `<div class="history__item">
            <span>${h.text}</span>
            <span style="color:var(--color-muted);font-size:.75rem">${h.ts}</span>
        </div>`
    ).join('');
}

clearHistoryBtn.addEventListener('click', () => {
    history = [];
    localStorage.removeItem('qma_history');
    renderHistory();
});

// ── AJAX — Load from API (Promises + Async) ────────────────────────────────────
loadMeasurementsBtn.addEventListener('click', async function() {
    loaderDiv.classList.remove('hidden');
    measurementsList.innerHTML = '';

    try {
        // Using Promises + async/await
        const measurements = await apiService.fetchMeasurements();
        renderMeasurements(measurements);
    } catch (err) {
        // API may not be running — show demo data
        renderMeasurements([
            { id:1, value:1.0,   unit:'ft',  category:'LENGTH'  },
            { id:2, value:500,   unit:'g',   category:'WEIGHT'  },
            { id:3, value:2.5,   unit:'l',   category:'VOLUME'  },
            { id:4, value:100.0, unit:'°C',  category:'TEMPERATURE' }
        ]);
    } finally {
        loaderDiv.classList.add('hidden');
    }
});

function renderMeasurements(list) {
    if (!list || list.length === 0) {
        measurementsList.innerHTML = '<p class="measurements__empty">No measurements found.</p>';
        return;
    }
    measurementsList.innerHTML = list.map(m =>
        `<div class="measurement__card">
            <div class="measurement__value">${m.value} ${m.unit}</div>
            <div class="measurement__meta">${m.category} · #${m.id}</div>
        </div>`
    ).join('');
}

// ── Init ───────────────────────────────────────────────────────────────────────
renderHistory();

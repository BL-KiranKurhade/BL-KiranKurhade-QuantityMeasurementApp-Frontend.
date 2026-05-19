/**
 * UC19 - API Module (AJAX / Fetch / Promises / Async-Await)
 * Concepts: AJAX, Async, Promises, Callback, Fetch API, ES9 Features.
 */
'use strict';

const API_BASE = 'http://localhost:8080/api';

class ApiService {
    /** Fetch all measurements — AJAX via Fetch + Promises */
    fetchMeasurements() {
        return fetch(`${API_BASE}/measurements`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            });
    }

    /** Async/await style — save a measurement */
    async saveMeasurement(measurement) {
        const res = await fetch(`${API_BASE}/measurements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(measurement)
        });
        if (!res.ok) throw new Error(`Failed to save: HTTP ${res.status}`);
        return res.json();
    }

    /** Delete — returns promise */
    deleteMeasurement(id) {
        return fetch(`${API_BASE}/measurements/${id}`, { method: 'DELETE' })
            .then(res => res.ok);
    }
}

const apiService = new ApiService();

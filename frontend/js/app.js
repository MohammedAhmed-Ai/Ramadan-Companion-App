const API_URL = "";

// State
let currentDate = new Date().toISOString().split('T')[0];
let currentRecord = {};

// DOM Elements
const elements = {
    dateDisplay: document.getElementById('display-date'),
    currentDateText: document.getElementById('current-date'),
    prevBtn: document.getElementById('prev-day'),
    nextBtn: document.getElementById('next-day'),
    form: document.getElementById('tracker-form'),
    inputs: document.querySelectorAll('input[type="checkbox"], input[type="text"]'),
    progressBar: document.getElementById('daily-progress'),
    progressText: document.getElementById('progress-text'),
    journalInput: document.getElementById('daily-journal'),
    analyzeBtn: document.getElementById('analyze-btn'),
    aiFeedback: document.getElementById('ai-feedback'),
    aiMessage: document.getElementById('ai-message'),
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateDateDisplay();
    fetchRecord(currentDate);
    setupEventListeners();
});

function setupEventListeners() {
    elements.prevBtn.addEventListener('click', () => changeDate(-1));
    elements.nextBtn.addEventListener('click', () => changeDate(1));

    // Checkbox and Input Listeners
    elements.inputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const field = e.target.name;
            const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            updateRecord(field, value);
        });
    });

    // AI Journal Analysis
    elements.analyzeBtn.addEventListener('click', analyzeJournal);
}

function changeDate(days) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    currentDate = date.toISOString().split('T')[0];
    updateDateDisplay();
    fetchRecord(currentDate);
}

function updateDateDisplay() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', calendar: 'islamic' };
    const dateObj = new Date(currentDate);

    // Hijri date approximation or just standard format with Arabic locale
    elements.dateDisplay.textContent = dateObj.toLocaleDateString('ar-SA', options);
    elements.currentDateText.textContent = dateObj.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' });
}

async function fetchRecord(date) {
    try {
        const response = await fetch(`${API_URL}/records/${date}`);
        if (!response.ok) throw new Error('Failed to fetch');

        currentRecord = await response.json();
        renderRecord(currentRecord);
    } catch (error) {
        console.error("Error fetching record:", error);
        // Reset UI if fetch fails (or new day)
        renderRecord({ date: currentDate });
    }
}

function renderRecord(record) {
    // Update all inputs based on record data
    elements.inputs.forEach(input => {
        const key = input.name;
        if (record[key] !== undefined) {
            if (input.type === 'checkbox') {
                input.checked = record[key];
                // Trigger change event logic manually if needed, but strict rendering is better
            } else {
                input.value = record[key] || '';
            }
        } else {
            // Default reset
            if (input.type === 'checkbox') input.checked = false;
            else input.value = '';
        }
    });

    if (record.daily_journal) {
        elements.journalInput.value = record.daily_journal;
    } else {
        elements.journalInput.value = '';
    }

    if (record.ai_encouraging_message) {
        showAiFeedback(record.ai_encouraging_message);
    } else {
        elements.aiFeedback.classList.add('hidden');
    }

    updateProgress();
    checkJannahStatus(); // Check for animation trigger
}

async function updateRecord(field, value) {
    // Optimistic UI update
    currentRecord[field] = value;
    updateProgress();
    checkJannahStatus(); // Check immediate trigger

    try {
        const response = await fetch(`${API_URL}/records/${currentDate}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [field]: value })
        });

        if (!response.ok) {
            console.error("Failed to save update");
            // Revert UI?
        }
    } catch (error) {
        console.error("Error updating record:", error);
    }
}

function updateProgress() {
    // Calculate progress based on checkboxes only for now
    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
    const total = checkboxes.length;
    const checked = checkboxes.filter(cb => cb.checked).length;

    const percent = total === 0 ? 0 : Math.round((checked / total) * 100);

    elements.progressBar.style.width = `${percent}%`;
    elements.progressText.textContent = `${percent}%`;
}

async function analyzeJournal() {
    const text = elements.journalInput.value;
    if (!text) return;

    elements.analyzeBtn.textContent = "جاري التحليل...";
    elements.analyzeBtn.disabled = true;

    try {
        // Save text first
        await updateRecord('daily_journal', text);

        // Call analysis endpoint
        const response = await fetch(`${API_URL}/sentiment-analysis/?text=${encodeURIComponent(text)}`, {
            method: 'POST'
        });

        const data = await response.json();

        // Save analysis results
        await updateRecord('sentiment_score', data.sentiment_score);
        await updateRecord('ai_encouraging_message', data.ai_encouraging_message);

        showAiFeedback(data.ai_encouraging_message);

    } catch (error) {
        console.error("Error analyzing journal:", error);
    } finally {
        elements.analyzeBtn.textContent = "❤️ تحليل المشاعر (AI)";
        elements.analyzeBtn.disabled = false;
    }
}

function showAiFeedback(message) {
    elements.aiMessage.textContent = message;
    elements.aiFeedback.classList.remove('hidden');
}

// Export for animations.js to use if needed
window.getSunnahStatus = () => {
    return {
        fajr: document.querySelector('input[name="fajr_sunnah"]').checked,
        dhuhr: document.querySelector('input[name="dhuhr_sunnah"]').checked,
        maghrib: document.querySelector('input[name="maghrib_sunnah"]').checked,
        isha: document.querySelector('input[name="isha_sunnah"]').checked,
    };
};

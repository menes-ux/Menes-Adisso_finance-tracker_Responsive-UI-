// This module's ONLY job is to talk to the browser's localStorage.

const RECORDS_KEY = 'studentFinanceRecords';
const BUDGET_KEY = 'studentFinanceBudget'; // New key for the budget

/**
 * Loads the records from localStorage.
 */
export function loadRecords() {
    try {
        const stored = localStorage.getItem(RECORDS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading records:', error);
        return [];
    }
}

/**
 * Saves the records to localStorage.
 */
export function saveRecords(records) {
    try {
        localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    } catch (error) {
        console.error('Error saving records:', error);
    }
}

/**
 * NEW: Loads the budget from localStorage.
 */
export function loadBudget() {
    const stored = localStorage.getItem(BUDGET_KEY);
    return stored ? parseFloat(stored) : 0;
}

/**
 * NEW: Saves the budget to localStorage.
 */
export function saveBudget(amount) {
    localStorage.setItem(BUDGET_KEY, String(amount));
}


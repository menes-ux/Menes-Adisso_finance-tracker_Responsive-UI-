// This module's ONLY job is to talk to the browser's localStorage. 
// It has no other logic, and does not interact with the DOM.
// It works like a memory cache for the records.

const RECORDS_KEY = 'studentFinanceRecords';

/**
 * Loads the records from localStorage.
 * @returns {Array} The array of records, or an empty array if none are found.
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
 * @param {Array} records The array of records to save.
 */
export function saveRecords(records) {
    try {
        localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    } catch (error) {
        console.error('Error saving records:', error);
    }
}


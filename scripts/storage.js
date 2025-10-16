const RECORDS_KEY = 'studentFinanceRecords';
const BUDGET_KEY = 'studentFinanceBudget';
const CURRENCY_KEY = 'studentFinanceCurrency'; // New key for currency settings

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
 * Loads the budget from localStorage.
 */
export function loadBudget() {
    const stored = localStorage.getItem(BUDGET_KEY);
    return stored ? parseFloat(stored) : 0;
}

/**
 * Saves the budget to localStorage.
 */
export function saveBudget(budget) {
    localStorage.setItem(BUDGET_KEY, budget);
}

/**
 * --- NEW: Loads currency settings from localStorage ---
 * Returns default settings if none are found.
 */
export function loadCurrencySettings() {
    const defaults = {
        active: 'USD',
        rates: {
            USD: 1,
            RWF: 1300,
            XOF: 600
        },
        symbols: {
            USD: '$',
            RWF: 'FRw',
            XOF: 'CFA'
        }
    };
    
    try {
        const stored = localStorage.getItem(CURRENCY_KEY);
        // Merge stored settings with defaults to ensure all keys exist
        return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch (error) {
        console.error('Error loading currency settings:', error);
        return defaults;
    }
}

/**
 * --- NEW: Saves currency settings to localStorage ---
 */
export function saveCurrencySettings(settings) {
    try {
        localStorage.setItem(CURRENCY_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving currency settings:', error);
    }
}


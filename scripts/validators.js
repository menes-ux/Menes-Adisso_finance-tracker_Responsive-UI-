// This module contains all the validation logic for the form inputs.

/**
 * Validates the description field.
 * Rules: Required, no leading/trailing spaces, no duplicate words.
 * @param {string} value The description text.
 * @returns {object} An object with 'valid' (boolean) and 'message' (string, optional).
 */
export function validateDescription(value) {
    if (!value.trim()) return { valid: false, message: 'Description is required' };
    if (!/^\S(?:.*\S)?$/.test(value)) return { valid: false, message: 'No leading/trailing spaces' };
    if (/\b(\w+)\s+\1\b/i.test(value)) return { valid: false, message: 'Contains duplicate words' };
    return { valid: true };
}

/**
 * Validates the amount field.
 * Rules: Required, positive number, max two decimal places.
 * @param {string} value The amount as a string.
 * @returns {object} An object with 'valid' (boolean) and 'message' (string, optional).
 */
export function validateAmount(value) {
    if (!value) return { valid: false, message: 'Amount is required' };
    if (!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(value)) return { valid: false, message: 'Invalid number format' };
    if (parseFloat(value) <= 0) return { valid: false, message: 'Amount must be > 0' };
    return { valid: true };
}

/**
 * Validates the category field.
 * Rules: Required for expenses, specific text format.
 * @param {string} value The category text.
 * @param {boolean} isExpense True if the transaction is an expense.
 * @returns {object} An object with 'valid' (boolean) and 'message' (string, optional).
 */
export function validateCategory(value, isExpense) {
    // Category is optional for income, so it's always valid if it's not an expense.
    if (!isExpense) return { valid: true };

    if (!value) return { valid: false, message: 'Category is required for expenses' };
    if (!/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/.test(value)) return { valid: false, message: 'Invalid category format' };
    return { valid: true };
}

/**
 * Validates the date field.
 * Rules: Required, YYYY-MM-DD format, not in the future.
 * @param {string} value The date string.
 * @returns {object} An object with 'valid' (boolean) and 'message' (string, optional).
 */
export function validateDate(value) {
    if (!value) return { valid: false, message: 'Date is required' };
    if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value)) return { valid: false, message: 'Must be in YYYY-MM-DD format' };
    
    const selectedDate = new Date(value);
    const today = new Date();
    // Compare dates only, ignoring time, by setting time to 0.
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) return { valid: false, message: 'Date cannot be in the future' };
    
    return { valid: true };
}


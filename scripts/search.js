/**
 * This module provides helper functions for regex searching.
 * Its only job is to compile regex safely and highlight text.
 */

/**
 * Safely compiles a user-provided string into a Regular Expression.
 * @param {string} input The user's search pattern.
 * @param {boolean} isCaseInsensitive If true, the 'i' flag will be added.
 * @returns {RegExp|null} A RegExp object if valid, or null if invalid.
 */
export function compileRegex(input, isCaseInsensitive) {
    if (!input) return null; // If input is empty, no regex is needed.
    
    // We add 'g' for a global search (to find all matches, not just the first)
    // and 'i' if the user wants a case-insensitive search.
    const flags = isCaseInsensitive ? 'gi' : 'g';
    
    try {
        // Here, we try to create a new RegExp object. If the user's
        // input is a broken pattern (like an unclosed bracket '['),
        // this will throw an error.
        return new RegExp(input, flags);
    } catch (error) {
        // Here, we catch the error and return null, signaling that
        // the pattern was invalid and shouldn't be used.
        console.error("Invalid Regex:", error);
        return null;
    }
}

/**
 * Replaces all matches of a regex in a string with a <mark> tag for highlighting.
 * @param {string} text The text to highlight (e.g., a record's description).
 * @param {RegExp} regex The compiled regular expression to match against.
 * @returns {string} The text with matches wrapped in <mark> tags.
 */
export function highlightMatches(text, regex) {
    // If there's no regex or the text is empty, just return the original text.
    if (!regex || !text) return text; 
    
    // The .replace() method can take a function. It calls this function
    // for every match it finds. We wrap the found match in a <mark> tag.
    return text.replace(regex, (match) => `<mark>${match}</mark>`);
}


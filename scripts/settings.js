import { saveBudget, loadBudget } from './storage.js';

class Settings {
    constructor() {
        this.budgetInput = document.getElementById('budget-input');
        this.saveButton = document.getElementById('save-budget-btn');
        this.savedMessage = document.getElementById('budget-saved-msg');
        
        this.init();
    }

    init() {
        this.loadInitialBudget();
        this.saveButton.addEventListener('click', () => this.handleSave());
    }
    
    loadInitialBudget() {
        const budget = loadBudget();
        if (budget > 0) {
            this.budgetInput.value = budget.toFixed(2);
        }
    }

    handleSave() {
        const budgetValue = parseFloat(this.budgetInput.value);
        if (isNaN(budgetValue) || budgetValue < 0) {
            // A simple validation, could be enhanced
            this.savedMessage.textContent = 'Please enter a valid number.';
            this.savedMessage.style.color = '#dc2626'; // Red
            return;
        }

        saveBudget(budgetValue);

        // Show a confirmation message
        this.savedMessage.textContent = 'Budget saved!';
        this.savedMessage.style.color = '#16a34a'; // Green
        setTimeout(() => {
            this.savedMessage.textContent = '';
        }, 3000);

        // Announce that the budget has been updated for other modules to hear
        document.dispatchEvent(new CustomEvent('budgetUpdated', { detail: { newBudget: budgetValue } }));
    }
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if the element exists before creating the class
    if (document.getElementById('budget-input')) {
        new Settings();
    }
});


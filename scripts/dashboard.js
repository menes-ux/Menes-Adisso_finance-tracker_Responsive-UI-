import { loadBudget } from './storage.js';

class Dashboard {
    constructor(transactionForm) {
        this.transactionForm = transactionForm;
        
        // DOM elements for the dashboard
        this.totalExpensesEl = document.getElementById('total-expenses');
        this.totalRecordsEl = document.getElementById('total-records');
        this.topCategoryEl = document.getElementById('top-category');
        this.budgetRemainingEl = document.getElementById('budget-remaining');
        this.budgetTotalEl = document.getElementById('budget-total');
        this.budgetStatusEl = document.getElementById('budget-status');
        
        this.budget = 0; // Initialize budget property
        this.init();
    }

    init() {
        this.budget = loadBudget(); // Load initial budget from storage
        
        // Initial update with current data
        this.update(this.transactionForm.getRecords());
        
        // Listen for when records are updated (e.g., new transaction added)
        document.addEventListener('recordsUpdated', (e) => this.update(e.detail));
        
        // NEW: Listen for when the budget is updated from the settings page
        document.addEventListener('budgetUpdated', (e) => {
            this.budget = e.detail.newBudget;
            this.update(this.transactionForm.getRecords()); // Re-run calculations with new budget
        });
    }

    update(records) {
        const expenses = records.filter(r => r.type === 'expense');
        const totalExpenses = expenses.reduce((sum, r) => sum + r.amount, 0);
        
        this.totalRecordsEl.textContent = records.length;
        this.totalExpensesEl.textContent = `$${totalExpenses.toFixed(2)}`;
        this.topCategoryEl.textContent = this.calculateTopCategory(expenses);
        
        // NEW: Update budget display and ARIA live region
        this.updateBudgetDisplay(totalExpenses);
    }
    
    updateBudgetDisplay(totalExpenses) {
        if (this.budget > 0) {
            const remaining = this.budget - totalExpenses;
            const remainingText = `$${remaining.toFixed(2)}`;
            
            this.budgetRemainingEl.textContent = remainingText;
            this.budgetTotalEl.textContent = `Budget: $${this.budget.toFixed(2)}`;
            
            // Update color based on remaining amount
            this.budgetRemainingEl.classList.remove('over-budget', 'near-budget'); // reset classes
            if (remaining < 0) {
                this.budgetRemainingEl.classList.add('over-budget');
            } else if (remaining < this.budget * 0.1) { // If less than 10% remains
                this.budgetRemainingEl.classList.add('near-budget');
            }

            // Update ARIA live region
            let statusMessage = `You have ${remainingText} remaining in your budget.`;
            // Set politeness level based on status
            if (remaining < 0) {
                this.budgetStatusEl.setAttribute('aria-live', 'assertive');
                statusMessage = `Warning: You are $${Math.abs(remaining).toFixed(2)} over budget.`;
            } else {
                this.budgetStatusEl.setAttribute('aria-live', 'polite');
            }
            this.budgetStatusEl.textContent = statusMessage;

        } else {
            this.budgetRemainingEl.textContent = 'N/A';
            this.budgetTotalEl.textContent = 'Budget: Not Set';
        }
    }

    calculateTopCategory(expenses) {
        if (expenses.length === 0) return 'N/A';
        
        const categoryCount = expenses.reduce((acc, r) => {
            if (r.category) { // Ensure category exists
                acc[r.category] = (acc[r.category] || 0) + r.amount;
            }
            return acc;
        }, {});
        
        if (Object.keys(categoryCount).length === 0) return 'N/A';

        return Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Make sure transactionForm is available on the window object first
    if (window.transactionForm) {
        new Dashboard(window.transactionForm);
    }
});


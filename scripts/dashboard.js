import { loadBudget, loadCurrencySettings } from './storage.js';

class Dashboard {
    constructor(transactionForm) {
        this.transactionForm = transactionForm;
        
        // Here, we are getting references to all the HTML elements we need to update.
        this.totalExpensesEl = document.getElementById('total-expenses');
        this.totalRecordsEl = document.getElementById('total-records');
        this.topCategoryEl = document.getElementById('top-category');
        this.budgetRemainingEl = document.getElementById('budget-remaining');
        this.budgetTotalEl = document.getElementById('budget-total');
        this.budgetStatusEl = document.getElementById('budget-status');
        this.chartContainer = document.getElementById('trend-chart');
        
        // Here, we are setting up the initial memory for our component.
        this.budget = 0;
        this.currencySettings = null;

        this.init();
    }

    init() {
        // Here, we load the initial budget and currency settings from storage.
        this.budget = loadBudget();
        this.currencySettings = loadCurrencySettings();
        
        // Here, we do the first drawing of the dashboard with the current data.
        this.update(this.transactionForm.getRecords());
        
        // Here, we set up listeners to automatically update the dashboard when data changes.
        document.addEventListener('recordsUpdated', (e) => this.update(e.detail));
        document.addEventListener('budgetUpdated', (e) => {
            this.budget = e.detail.newBudget;
            this.update(this.transactionForm.getRecords());
        });
        document.addEventListener('currencyUpdated', (e) => {
            this.currencySettings = e.detail.newSettings;
            this.update(this.transactionForm.getRecords());
        });
    }

    // This is a helper function to format any dollar amount into the user's chosen currency.
    formatCurrency(amountInUsd) {
        const { active, rates, symbols } = this.currencySettings;
        const convertedAmount = amountInUsd * rates[active];
        
        if (active === 'USD') {
            return `${symbols[active]}${convertedAmount.toFixed(2)}`;
        }
        // For RWF and XOF, we don't usually show decimals.
        return `${Math.round(convertedAmount).toLocaleString()} ${symbols[active]}`;
    }

    // This is the main "update" function that recalculates and redraws everything.
    update(records) {
        const expenses = records.filter(r => r.type === 'expense');
        const totalExpenses = expenses.reduce((sum, r) => sum + r.amount, 0);
        
        this.totalRecordsEl.textContent = records.length;
        this.topCategoryEl.textContent = this.calculateTopCategory(expenses);

        this.totalExpensesEl.textContent = this.formatCurrency(totalExpenses);
        this.updateBudgetDisplay(totalExpenses);
        this.updateTrendChart(expenses);
    }
    
    updateTrendChart(expenses) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const day = new Date(today);
            day.setDate(today.getDate() - i);
            return day;
        }).reverse();

        const dailyTotals = last7Days.map(day => {
            const dayString = day.toISOString().split('T')[0];
            const total = expenses
                .filter(e => e.date === dayString)
                .reduce((sum, e) => sum + e.amount, 0);
            return { date: day, total: total };
        });

        const maxSpending = Math.max(...dailyTotals.map(d => d.total));
        
        this.chartContainer.innerHTML = '';
        
        dailyTotals.forEach(dayData => {
            const barHeight = maxSpending > 0 ? (dayData.total / maxSpending) * 100 : 0;
            const dayLabel = dayData.date.toLocaleDateString('en-US', { weekday: 'short' });

            const barWrapper = document.createElement('div');
            barWrapper.className = 'chart-bar-wrapper';
            barWrapper.innerHTML = `
                <div class="chart-value">${this.formatCurrency(dayData.total)}</div>
                <div class="chart-bar" style="height: ${barHeight}%;"></div>
                <div class="chart-label">${dayLabel}</div>
            `;
            this.chartContainer.appendChild(barWrapper);
        });
    }
    
    updateBudgetDisplay(totalExpenses) {
        if (this.budget > 0) {
            const remaining = this.budget - totalExpenses;
            
            const remainingText = this.formatCurrency(remaining);
            this.budgetRemainingEl.textContent = remainingText;
            this.budgetTotalEl.textContent = `Budget: ${this.formatCurrency(this.budget)}`;
            
            this.budgetRemainingEl.classList.remove('over-budget', 'near-budget');
            if (remaining < 0) this.budgetRemainingEl.classList.add('over-budget');
            else if (remaining < this.budget * 0.1) this.budgetRemainingEl.classList.add('near-budget');
            
            let statusMessage = `You have ${remainingText} remaining in your budget.`;
            if (remaining < 0) {
                this.budgetStatusEl.setAttribute('aria-live', 'assertive');
                statusMessage = `Warning: You are ${this.formatCurrency(Math.abs(remaining))} over budget.`;
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
            if (r.category) acc[r.category] = (acc[r.category] || 0) + r.amount;
            return acc;
        }, {});
        if (Object.keys(categoryCount).length === 0) return 'N/A';
        return Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.transactionForm) {
        new Dashboard(window.transactionForm);
    }
});


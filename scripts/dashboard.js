// This script handles the logic for the dashboard statistics.

class Dashboard {
    constructor(transactionForm) {
        // We pass in the form instance to get the initial records.
        this.transactionForm = transactionForm;

        // Get references to the HTML elements that will display the stats.
        this.totalSpendingEl = document.getElementById('total-spending');
        this.totalIncomeEl = document.getElementById('total-income');
        this.netBalanceEl = document.getElementById('net-balance');
        this.topCategoryEl = document.getElementById('top-category');

        this.init();
    }

    init() {
        // This is the "Radio Receiver". It tunes into the 'recordsUpdated' broadcast.
        // When it hears the broadcast, it calls the this.update method.
        document.addEventListener('recordsUpdated', (event) => {
            const updatedRecords = event.detail; // The new list of records from the broadcast.
            this.update(updatedRecords);
        });

        // Perform an initial update when the page first loads.
        const initialRecords = this.transactionForm.getRecords();
        this.update(initialRecords);
    }

    // The main method to calculate and display all statistics.
    update(records) {
        if (!records) return;

        // --- Calculations ---
        const totalIncome = this.calculateTotal(records, 'income');
        const totalSpending = this.calculateTotal(records, 'expense');
        const netBalance = totalIncome - totalSpending;
        const topCategory = this.findTopCategory(records);
        
        // --- Display Updates ---
        this.totalIncomeEl.textContent = totalIncome.toFixed(2);
        this.totalSpendingEl.textContent = totalSpending.toFixed(2);
        this.netBalanceEl.textContent = netBalance.toFixed(2);
        this.topCategoryEl.textContent = topCategory;

        // Update the color of the net balance based on its value.
        this.netBalanceEl.classList.toggle('positive', netBalance >= 0);
        this.netBalanceEl.classList.toggle('negative', netBalance < 0);
    }

    // A helper method to calculate total income or expenses.
    calculateTotal(records, type) {
        return records
            .filter(record => record.type === type)
            .reduce((sum, record) => sum + record.amount, 0);
    }

    // A helper method to find the most frequent expense category.
    findTopCategory(records) {
        const expenseRecords = records.filter(record => record.type === 'expense' && record.category);
        
        if (expenseRecords.length === 0) {
            return 'N/A';
        }

        // Create a frequency map to count each category.
        const categoryCounts = expenseRecords.reduce((acc, record) => {
            acc[record.category] = (acc[record.category] || 0) + 1;
            return acc;
        }, {});

        // Find the category with the highest count.
        let topCategory = 'N/A';
        let maxCount = 0;
        for (const category in categoryCounts) {
            if (categoryCounts[category] > maxCount) {
                maxCount = categoryCounts[category];
                topCategory = category;
            }
        }
        return topCategory;
    }
}

// Initialize when DOM is loaded, after the form has been initialized.
document.addEventListener('DOMContentLoaded', () => {
    // Ensure window.transactionForm exists before initializing the dashboard.
    if (window.transactionForm) {
        new Dashboard(window.transactionForm);
    } else {
        console.error('TransactionForm not initialized before Dashboard.');
    }
});

import { saveBudget, loadBudget, saveCurrencySettings, loadCurrencySettings } from './storage.js';

class Settings {
    constructor(transactionForm) {
        // Here, we save a reference to the main form manager.
        this.transactionForm = transactionForm;

        // Here, we find all the HTML elements we need to interact with on this page.
        this.budgetInput = document.getElementById('budget-input');
        this.saveBudgetBtn = document.getElementById('save-budget-btn');
        this.budgetSavedMsg = document.getElementById('budget-saved-msg');

        this.currencySelect = document.getElementById('currency-select');
        this.rateRwfInput = document.getElementById('rate-rwf');
        this.rateXofInput = document.getElementById('rate-xof');
        this.saveCurrencyBtn = document.getElementById('save-currency-btn');
        this.currencySavedMsg = document.getElementById('currency-saved-msg');
        
  
        this.exportBtn = document.getElementById('export-btn');
        this.importBtn = document.getElementById('import-btn');
        this.importFileInput = document.getElementById('import-file-input');
        this.importStatusMsg = document.getElementById('import-status-msg');
        
        this.init();
    }

    init() {
        this.loadAndDisplaySettings();
        this.setupEventListeners();
    }

    loadAndDisplaySettings() {
        this.budgetInput.value = loadBudget() || '';
        const settings = loadCurrencySettings();
        this.currencySelect.value = settings.active;
        this.rateRwfInput.value = settings.rates.RWF;
        this.rateXofInput.value = settings.rates.XOF;
    }

    setupEventListeners() {
        this.saveBudgetBtn.addEventListener('click', () => this.handleSaveBudget());
        this.saveCurrencyBtn.addEventListener('click', () => this.handleSaveCurrency());
        

        this.exportBtn.addEventListener('click', () => this.handleExport());
        this.importBtn.addEventListener('click', () => this.importFileInput.click()); // This opens the file picker
        this.importFileInput.addEventListener('change', (e) => this.handleImport(e));
    }

    handleSaveBudget() {
        const newBudget = parseFloat(this.budgetInput.value);
        if (!isNaN(newBudget) && newBudget >= 0) {
            saveBudget(newBudget);
            this.showTempMessage(this.budgetSavedMsg, 'Budget saved!');
            document.dispatchEvent(new CustomEvent('budgetUpdated', { detail: { newBudget } }));
        }
    }

    handleSaveCurrency() {
        const settings = {
            active: this.currencySelect.value,
            rates: { USD: 1, RWF: parseFloat(this.rateRwfInput.value) || 1300, XOF: parseFloat(this.rateXofInput.value) || 600 },
            symbols: { USD: '$', RWF: 'FRw', XOF: 'CFA' }
        };
        saveCurrencySettings(settings);
        this.showTempMessage(this.currencySavedMsg, 'Currency settings saved!');
        document.dispatchEvent(new CustomEvent('currencyUpdated', { detail: { newSettings: settings } }));
    }


    handleExport() {
        const records = this.transactionForm.getRecords();
        const dataStr = JSON.stringify(records, null, 2); // The '2' makes the JSON file readable
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `finance-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url); // Clean up the URL object
    }
    
    handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const records = JSON.parse(e.target.result);
                // Here, we do a simple check to see if the data looks like our transaction data.
                if (this.isValidData(records)) {
                    this.transactionForm.replaceAllRecords(records);
                    this.showTempMessage(this.importStatusMsg, 'Data imported successfully!');
                } else {
                    throw new Error('Invalid data structure in JSON file.');
                }
            } catch (error) {
                this.showTempMessage(this.importStatusMsg, `Error: ${error.message}`, true);
            } finally {
                // Reset the file input so you can import the same file again if needed
                this.importFileInput.value = '';
            }
        };
        reader.readAsText(file);
    }
    
    isValidData(records) {
        // It must be an array, and the first item (if it exists) must have an 'id' and an 'amount'.
        return Array.isArray(records) && (!records.length || (records[0].id && typeof records[0].amount === 'number'));
    }

    // A helper to show temporary messages to the user.
    showTempMessage(element, text, isError = false) {
        element.textContent = text;
        element.style.color = isError ? '#dc2626' : '#16a34a';
        setTimeout(() => element.textContent = '', 4000);
    }
}

// We need to pass the transactionForm instance to the Settings class now.
document.addEventListener('DOMContentLoaded', () => {
    if (window.transactionForm) {
        new Settings(window.transactionForm);
    }
});


// --- STEP 1: Import the specialist tools ---
// This tells the manager (this file) to get its tools from the specialist files.
import { loadRecords, saveRecords } from './storage.js';
import * as validator from './validators.js';

// The rest of the class is now much cleaner.
class TransactionForm {
    constructor() {
        this.form = document.getElementById('transaction-form');
        
        // --- STEP 2: Use the imported storage tool ---
        // Instead of calling its own method, it now calls the function from storage.js
        this.records = loadRecords(); 
        
        this.currentEditId = null;
        
        // Storing these once for better performance
        this.descriptionInput = document.getElementById('description');
        this.amountInput = document.getElementById('amount');
        this.categoryInput = document.getElementById('category');
        this.dateInput = document.getElementById('date');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDate();
        this.updateRecordCounter();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('clear-form').addEventListener('click', () => this.clearForm());
        document.querySelectorAll('input[name="transaction-type"]').forEach(radio => {
            radio.addEventListener('change', () => this.toggleCategoryField());
        });
        document.querySelectorAll('.category-button').forEach(button => {
            button.addEventListener('click', (e) => this.selectCategory(e.currentTarget));
        });

        // The event listeners now call a single, smart helper function.
        this.descriptionInput.addEventListener('input', () => this.validateField(this.descriptionInput, validator.validateDescription));
        this.amountInput.addEventListener('input', () => this.validateField(this.amountInput, validator.validateAmount));
        this.categoryInput.addEventListener('input', () => this.validateField(this.categoryInput, (value) => validator.validateCategory(value, this.isExpense())));
        this.dateInput.addEventListener('change', () => this.validateField(this.dateInput, validator.validateDate));
    }
    
    // This is the new helper function. It runs the check and shows/hides the error.
    validateField(inputElement, validationFunction) {
        const errorElement = document.getElementById(`${inputElement.id}-error`);
        if (!errorElement) return; // Guard clause
        const result = validationFunction(inputElement.value);

        if (!result.valid) {
            this.showError(inputElement, errorElement, result.message);
            return false;
        }
        this.clearError(inputElement, errorElement);
        return true;
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const isDescriptionValid = this.validateField(this.descriptionInput, validator.validateDescription);
        const isAmountValid = this.validateField(this.amountInput, validator.validateAmount);
        const isCategoryValid = this.validateField(this.categoryInput, (value) => validator.validateCategory(value, this.isExpense()));
        const isDateValid = this.validateField(this.dateInput, validator.validateDate);
        const isFormValid = isDescriptionValid && isAmountValid && isCategoryValid && isDateValid;
        
        if (!isFormValid) return;

        const formData = new FormData(this.form);
        const now = new Date().toISOString();
        const record = {
            id: this.currentEditId || this.generateId(),
            description: formData.get('description').trim(),
            amount: parseFloat(formData.get('amount')),
            category: this.isExpense() ? formData.get('category') : null,
            date: formData.get('date'),
            type: formData.get('transaction-type'),
            createdAt: this.currentEditId ? this.records.find(r => r.id === this.currentEditId)?.createdAt || now : now,
            updatedAt: now
        };

        if (this.currentEditId) {
            const index = this.records.findIndex(r => r.id === this.currentEditId);
            if (index !== -1) this.records[index] = record;
        } else {
            this.records.push(record);
        }

        // Call the imported function from storage.js
        saveRecords(this.records);

        this.showSuccessMessage();
        this.clearForm();
        document.dispatchEvent(new CustomEvent('recordsUpdated', { detail: this.records }));
    }

    // --- All Utility Methods are now complete and correct ---
    
    showError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
    }

    clearError(input, errorElement) {
        input.classList.remove('error');
        errorElement.textContent = '';
    }
    
    isExpense() {
        const transactionType = document.querySelector('input[name="transaction-type"]:checked');
        return transactionType && transactionType.value === 'expense';
    }

    toggleCategoryField() {
        const categoryGroup = document.getElementById('category-group');
        if (this.isExpense()) {
            categoryGroup.style.display = 'block';
            this.categoryInput.required = true;
        } else {
            categoryGroup.style.display = 'none';
            this.categoryInput.required = false;
            this.categoryInput.value = '';
            this.clearError(this.categoryInput, document.getElementById('category-error'));
            this.clearCategorySelection();
        }
    }

    selectCategory(button) {
        const category = button.dataset.category;
        this.clearCategorySelection();
        button.classList.add('selected');
        this.categoryInput.value = category;
        this.validateField(this.categoryInput, (value) => validator.validateCategory(value, this.isExpense()));
    }

    clearCategorySelection() {
        document.querySelectorAll('.category-button.selected').forEach(b => b.classList.remove('selected'));
    }

    setDefaultDate() {
        this.dateInput.value = new Date().toISOString().split('T')[0];
    }

    generateId() {
        return `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.textContent = this.currentEditId ? 'Transaction updated successfully!' : 'Transaction added successfully!';
        this.form.insertBefore(message, this.form.firstChild);
        setTimeout(() => message.remove(), 3000);
    }

    clearForm() {
        this.form.reset();
        this.setDefaultDate();
        this.currentEditId = null;
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-input.error, .error').forEach(el => el.classList.remove('error'));
        this.toggleCategoryField();
    }

    updateRecordCounter() {
        document.dispatchEvent(new CustomEvent('recordCountUpdated', { detail: { count: this.records.length } }));
    }

    getRecords() {
        return this.records;
    }

    editRecord(id) {
        const record = this.records.find(r => r.id === id);
        if (!record) return;

        this.currentEditId = id;
        this.descriptionInput.value = record.description;
        this.amountInput.value = record.amount;
        this.dateInput.value = record.date;
        
        document.getElementById(record.type).checked = true;
        this.toggleCategoryField();
        
        if (record.category) {
            this.categoryInput.value = record.category;
            // Also select the button if it exists
            const categoryButton = document.querySelector(`.category-button[data-category="${record.category}"]`);
            if (categoryButton) {
                this.selectCategory(categoryButton);
            }
        }
        
        document.getElementById('add-edit').scrollIntoView({ behavior: 'smooth' });
    }

    deleteRecord(id) {
        this.records = this.records.filter(r => r.id !== id);
        // Call the imported function from storage.js
        saveRecords(this.records);
        this.updateRecordCounter();
        document.dispatchEvent(new CustomEvent('recordsUpdated', { detail: this.records }));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.transactionForm = new TransactionForm();
});


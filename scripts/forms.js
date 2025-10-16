import { loadRecords, saveRecords } from './storage.js';
import * as validator from './validators.js';

class TransactionForm {
    constructor() {
        this.form = document.getElementById('transaction-form');
        this.records = loadRecords(); 
        this.currentEditId = null;
        this.descriptionInput = document.getElementById('description');
        this.amountInput = document.getElementById('amount');
        this.categoryInput = document.getElementById('category');
        this.dateInput = document.getElementById('date');
        this.submitButton = this.form.querySelector('button[type="submit"]');
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
        this.descriptionInput.addEventListener('input', () => this.validateField(this.descriptionInput, validator.validateDescription));
        this.amountInput.addEventListener('input', () => this.validateField(this.amountInput, validator.validateAmount));
        this.categoryInput.addEventListener('input', () => this.validateField(this.categoryInput, (value) => validator.validateCategory(value, this.isExpense())));
        this.dateInput.addEventListener('change', () => this.validateField(this.dateInput, validator.validateDate));
    }
    
    validateField(inputElement, validationFunction) {
        const errorElement = document.getElementById(`${inputElement.id}-error`);
        if (!errorElement) return true;
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
        if (!isDescriptionValid || !isAmountValid || !isCategoryValid || !isDateValid) return;

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
        saveRecords(this.records);
        this.showSuccessMessage();
        this.clearForm();
        document.dispatchEvent(new CustomEvent('recordsUpdated', { detail: this.records }));
    }
    
    showError(input, errorElement, message) { input.classList.add('error'); errorElement.textContent = message; }
    clearError(input, errorElement) { input.classList.remove('error'); errorElement.textContent = ''; }
    isExpense() { const type = document.querySelector('input[name="transaction-type"]:checked'); return type && type.value === 'expense'; }

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

    clearCategorySelection() { document.querySelectorAll('.category-button.selected').forEach(b => b.classList.remove('selected')); }
    setDefaultDate() { this.dateInput.value = new Date().toISOString().split('T')[0]; }
    generateId() { return `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`; }

    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.textContent = this.currentEditId ? 'Transaction updated!' : 'Transaction added!';
        this.form.insertBefore(message, this.form.firstChild);
        setTimeout(() => message.remove(), 3000);
    }

    clearForm() {
        this.form.reset();
        this.setDefaultDate();
        this.currentEditId = null;
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));
        this.toggleCategoryField();
        this.submitButton.textContent = 'Save Transaction';
    }

    updateRecordCounter() { document.dispatchEvent(new CustomEvent('recordCountUpdated', { detail: { count: this.records.length } })); }
    getRecords() { return this.records; }

    editRecord(id) {
        const record = this.records.find(r => r.id === id);
        if (!record) return;
        this.currentEditId = id;
        this.form.elements['description'].value = record.description;
        this.form.elements['amount'].value = record.amount;
        this.form.elements['date'].value = record.date;
        this.form.elements['transaction-type'].value = record.type;
        this.toggleCategoryField();
        if (record.category) {
            this.form.elements['category'].value = record.category;
            document.querySelector(`.category-button[data-category="${record.category}"]`)?.classList.add('selected');
        }
        this.submitButton.textContent = 'Update Transaction';
    }

    deleteRecord(id) {
        this.records = this.records.filter(r => r.id !== id);
        saveRecords(this.records);
        this.updateRecordCounter();
        document.dispatchEvent(new CustomEvent('recordsUpdated', { detail: this.records }));
    }
    
    
    replaceAllRecords(newRecords) {
        this.records = newRecords; // Replace the in-memory array
        saveRecords(this.records);  // Save the new array to localStorage
        this.updateRecordCounter(); // Update any counters
        document.dispatchEvent(new CustomEvent('recordsUpdated', { detail: this.records })); // Broadcast the major update
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.transactionForm = new TransactionForm();
});


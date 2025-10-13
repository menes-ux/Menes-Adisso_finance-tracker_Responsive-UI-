// Form validation and handling for Student Finance Tracker

class TransactionForm {
    constructor() {
        this.form = document.getElementById('transaction-form');
        this.records = this.loadRecords();
        this.currentEditId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDate();
        this.updateRecordCounter();
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Clear form button
        document.getElementById('clear-form').addEventListener('click', () => this.clearForm());
        
        // Transaction type change (show/hide category)
        document.querySelectorAll('input[name="transaction-type"]').forEach(radio => {
            radio.addEventListener('change', () => this.toggleCategoryField());
        });
        
        // Category button clicks
        document.querySelectorAll('.category-button').forEach(button => {
            button.addEventListener('click', () => this.selectCategory(button));
        });
        
        // Real-time validation
        document.getElementById('description').addEventListener('input', (e) => this.validateDescription(e.target.value));
        document.getElementById('amount').addEventListener('input', (e) => this.validateAmount(e.target.value));
        document.getElementById('category').addEventListener('change', (e) => this.validateCategory(e.target.value));
        document.getElementById('date').addEventListener('change', (e) => this.validateDate(e.target.value));
    }

    // Validation Rules
    validateDescription(value) {
        const errorElement = document.getElementById('description-error');
        const input = document.getElementById('description');
        
        // Rule: forbid leading/trailing spaces and collapse doubles
        const regex = /^\S(?:.*\S)?$/;
        
        if (!value.trim()) {
            this.showError(input, errorElement, 'Description is required');
            return false;
        }
        
        if (!regex.test(value)) {
            this.showError(input, errorElement, 'Description cannot have leading/trailing spaces');
            return false;
        }
        
        // Check for duplicate words (advanced regex)
        const duplicateWordsRegex = /\b(\w+)\s+\1\b/i;
        if (duplicateWordsRegex.test(value)) {
            this.showError(input, errorElement, 'Description contains duplicate words');
            return false;
        }
        
        this.clearError(input, errorElement);
        return true;
    }

    validateAmount(value) {
        const errorElement = document.getElementById('amount-error');
        const input = document.getElementById('amount');
        
        // Rule: ^(0|[1-9]\d*)(\.\d{1,2})?$
        const regex = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
        
        if (!value) {
            this.showError(input, errorElement, 'Amount is required');
            return false;
        }
        
        if (!regex.test(value)) {
            this.showError(input, errorElement, 'Amount must be a valid number with max 2 decimal places');
            return false;
        }
        
        if (parseFloat(value) <= 0) {
            this.showError(input, errorElement, 'Amount must be greater than 0');
            return false;
        }
        
        this.clearError(input, errorElement);
        return true;
    }

    validateCategory(value) {
        const errorElement = document.getElementById('category-error');
        const input = document.getElementById('category');
        const transactionType = document.querySelector('input[name="transaction-type"]:checked');
        
        // Only validate category for expenses
        if (transactionType && transactionType.value === 'expense') {
            // Rule: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/
            const regex = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
            
            if (!value) {
                this.showError(input, errorElement, 'Category is required for expenses');
                return false;
            }
            
            if (!regex.test(value)) {
                this.showError(input, errorElement, 'Category can only contain letters, spaces, and hyphens');
                return false;
            }
        }
        
        this.clearError(input, errorElement);
        return true;
    }

    validateDate(value) {
        const errorElement = document.getElementById('date-error');
        const input = document.getElementById('date');
        
        // Rule: ^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$
        const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
        
        if (!value) {
            this.showError(input, errorElement, 'Date is required');
            return false;
        }
        
        if (!regex.test(value)) {
            this.showError(input, errorElement, 'Date must be in YYYY-MM-DD format');
            return false;
        }
        
        // Check if date is not in the future
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        
        if (selectedDate > today) {
            this.showError(input, errorElement, 'Date cannot be in the future');
            return false;
        }
        
        this.clearError(input, errorElement);
        return true;
    }

    // Utility methods
    showError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
    }

    clearError(input, errorElement) {
        input.classList.remove('error');
        errorElement.textContent = '';
    }

    toggleCategoryField() {
        const categoryGroup = document.getElementById('category-group');
        const categoryInput = document.getElementById('category');
        const transactionType = document.querySelector('input[name="transaction-type"]:checked');
        
        if (transactionType && transactionType.value === 'expense') {
            categoryGroup.style.display = 'block';
            categoryInput.required = true;
            categoryInput.classList.add('category-input');
        } else {
            categoryGroup.style.display = 'none';
            categoryInput.required = false;
            categoryInput.value = '';
            categoryInput.classList.remove('category-input');
            this.clearError(categoryInput, document.getElementById('category-error'));
            this.clearCategorySelection();
        }
    }

    selectCategory(button) {
        const category = button.dataset.category;
        const categoryInput = document.getElementById('category');
        
        // Clear previous selection
        this.clearCategorySelection();
        
        // Select current button
        button.classList.add('selected');
        
        // Update input field
        categoryInput.value = category;
        
        // Validate
        this.validateCategory(category);
    }

    clearCategorySelection() {
        document.querySelectorAll('.category-button').forEach(button => {
            button.classList.remove('selected');
        });
    }

    setDefaultDate() {
        const dateInput = document.getElementById('date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    generateId() {
        const count = this.records.length + 1;
        return `rec_${count.toString().padStart(4, '0')}`;
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const transactionData = {
            description: formData.get('description').trim(),
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category') || null,
            date: formData.get('date'),
            type: formData.get('transaction-type')
        };
        
        // Validate all fields
        const isValid = this.validateDescription(transactionData.description) &&
                       this.validateAmount(transactionData.amount.toString()) &&
                       this.validateCategory(transactionData.category) &&
                       this.validateDate(transactionData.date);
        
        if (!isValid) {
            return;
        }
        
        // Create transaction record
        const now = new Date().toISOString();
        const record = {
            id: this.currentEditId || this.generateId(),
            ...transactionData,
            createdAt: this.currentEditId ? this.records.find(r => r.id === this.currentEditId)?.createdAt || now : now,
            updatedAt: now
        };
        
        // Save to records
        if (this.currentEditId) {
            // Update existing record
            const index = this.records.findIndex(r => r.id === this.currentEditId);
            if (index !== -1) {
                this.records[index] = record;
            }
        } else {
            // Add new record
            this.records.push(record);
        }
        
        // Save to localStorage
        this.saveRecords();
        
        // Show success message
        this.showSuccessMessage();
        
        // Clear form
        this.clearForm();
        
        // Update UI
        this.updateRecordCounter();
        
        // Trigger custom event for other components
        document.dispatchEvent(new CustomEvent('recordsUpdated', { detail: this.records }));
    }

    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.textContent = this.currentEditId ? 'Transaction updated successfully!' : 'Transaction added successfully!';
        
        this.form.insertBefore(message, this.form.firstChild);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    clearForm() {
        this.form.reset();
        this.setDefaultDate();
        this.currentEditId = null;
        
        // Clear all errors
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        
        // Hide category field and clear selection
        document.getElementById('category-group').style.display = 'none';
        document.getElementById('category').classList.remove('category-input');
        this.clearCategorySelection();
    }

    // LocalStorage methods
    loadRecords() {
        try {
            const stored = localStorage.getItem('studentFinanceRecords');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading records:', error);
            return [];
        }
    }

    saveRecords() {
        try {
            localStorage.setItem('studentFinanceRecords', JSON.stringify(this.records));
        } catch (error) {
            console.error('Error saving records:', error);
        }
    }

    updateRecordCounter() {
        // This will be used by other components to show record count
        document.dispatchEvent(new CustomEvent('recordCountUpdated', { 
            detail: { count: this.records.length } 
        }));
    }

    // Public methods for other components
    getRecords() {
        return this.records;
    }

    editRecord(id) {
        const record = this.records.find(r => r.id === id);
        if (!record) return;
        
        this.currentEditId = id;
        
        // Populate form
        document.getElementById('description').value = record.description;
        document.getElementById('amount').value = record.amount;
        document.getElementById('date').value = record.date;
        
        // Set transaction type
        document.getElementById(record.type).checked = true;
        this.toggleCategoryField();
        
        if (record.category) {
            document.getElementById('category').value = record.category;
        }
        
        // Scroll to form
        document.getElementById('add-edit').scrollIntoView({ behavior: 'smooth' });
    }

    deleteRecord(id) {
        this.records = this.records.filter(r => r.id !== id);
        this.saveRecords();
        this.updateRecordCounter();
        document.dispatchEvent(new CustomEvent('recordsUpdated', { detail: this.records }));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.transactionForm = new TransactionForm();
});

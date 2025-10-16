class Records {
    constructor(transactionForm) {
        this.transactionForm = transactionForm;
        this.container = document.getElementById('records-container');

        // Modal Elements
        this.modal = document.getElementById('delete-modal');
        this.confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        this.cancelDeleteBtn = document.getElementById('cancel-delete-btn');

        // --- FIX #1: Find the sidebar navigation button for the form ---
        this.addEditNavButton = document.querySelector('button[data-section="add-edit"]');

        this.recordIdToDelete = null;
        
        this.init();
    }

    init() {
        // Initial render
        this.render(this.transactionForm.getRecords());

        // Listen for when records are updated
        document.addEventListener('recordsUpdated', (e) => this.render(e.detail));

        // Setup event listeners for the modal and delete buttons
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Use event delegation for both edit and delete buttons
        this.container.addEventListener('click', (e) => {
            const deleteButton = e.target.closest('.delete-btn');
            const editButton = e.target.closest('.edit-btn');

            if (deleteButton) {
                this.recordIdToDelete = deleteButton.dataset.id;
                this.showModal();
            }

            if (editButton) {
                const recordIdToEdit = editButton.dataset.id;
                this.handleEditClick(recordIdToEdit);
            }
        });

        // Modal button listeners
        this.cancelDeleteBtn.addEventListener('click', () => this.hideModal());
        this.confirmDeleteBtn.addEventListener('click', () => this.handleConfirmDelete());
        
        // Also close modal if user clicks on the overlay
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });
    }

    showModal() {
        this.modal.hidden = false;
    }

    hideModal() {
        this.modal.hidden = true;
        this.recordIdToDelete = null;
    }
    
    // --- FIX #2: Add the missing function for the confirm button ---
    handleConfirmDelete() {
        if (this.recordIdToDelete) {
            // Tell the form module to perform the deletion
            this.transactionForm.deleteRecord(this.recordIdToDelete);
        }
        this.hideModal(); // Close the modal afterwards
    }

    handleEditClick(id) {
        // 1. Tell the form to enter "edit mode" for this record
        this.transactionForm.editRecord(id);
        
        // 2. Programmatically click the sidebar button to switch to the form view
        if (this.addEditNavButton) {
            this.addEditNavButton.click();
        }

        // 3. Scroll the form into view for a smooth user experience
        document.getElementById('add-edit').scrollIntoView({ behavior: 'smooth' });
    }

    render(records) {
        if (records.length === 0) {
            this.container.innerHTML = `<div class="no-records-message">No transactions yet. Add one to get started!</div>`;
            return;
        }

        const tableHtml = this.createTable(records);
        const cardsHtml = this.createCards(records);

        this.container.innerHTML = `
            <div class="records-section">
                ${tableHtml}
                ${cardsHtml}
            </div>
        `;
    }

    createTable(records) {
        const rows = records.map(record => `
            <tr>
                <td>
                    <div class="record-description">${record.description}</div>
                    <div class="record-date">${record.date}</div>
                </td>
                <td>
                    ${record.category ? `<span class="record-category">${record.category}</span>` : ''}
                </td>
                <td class="record-amount ${record.type}">
                    ${record.type === 'income' ? '+' : '-'}$${record.amount.toFixed(2)}
                </td>
                <td class="record-actions">
                    <button class="edit-btn" data-id="${record.id}" aria-label="Edit transaction">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                    </button>
                    <button class="delete-btn" data-id="${record.id}" aria-label="Delete transaction">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                    </button>
                </td>
            </tr>
        `).join('');

        return `
            <table class="records-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    createCards(records) {
        const cards = records.map(record => `
            <div class="record-card">
                <div class="record-card-main">
                    <div class="record-description">${record.description}</div>
                    <div class="record-amount ${record.type}">
                        ${record.type === 'income' ? '+' : '-'}$${record.amount.toFixed(2)}
                    </div>
                </div>
                <div class="record-card-details">
                    <span class="record-date">${record.date}</span>
                    ${record.category ? `| <span class="record-category">${record.category}</span>` : ''}
                </div>
                <div class="record-card-actions">
                    <button class="edit-btn" data-id="${record.id}" aria-label="Edit transaction">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                        <span>Edit</span>
                    </button>
                    <button class="delete-btn" data-id="${record.id}" aria-label="Delete transaction">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        `).join('');

        return `<div class="records-cards">${cards}</div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.transactionForm) {
        new Records(window.transactionForm);
    }
});


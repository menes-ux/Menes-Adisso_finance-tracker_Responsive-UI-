class Records {
    constructor(transactionForm) {
        // Here, we are storing references to other parts of our app.
        this.transactionForm = transactionForm;
        this.container = document.getElementById('records-container');
        this.modal = document.getElementById('delete-modal');
        this.confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        this.cancelDeleteBtn = document.getElementById('cancel-delete-btn');
        this.addEditNavButton = document.querySelector('button[data-section="add-edit"]');
        this.recordIdToDelete = null;
        
        // --- UPGRADE 1: Add a "memory" for sorting ---
        // This object will remember how the user wants the table sorted.
        this.sortState = {
            key: 'date',   // Default sort column
            order: 'desc'  // Default sort direction (newest first)
        };
        
        this.init();
    }

    init() {
        this.render(this.transactionForm.getRecords());
        document.addEventListener('recordsUpdated', (e) => this.render(e.detail));
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.container.addEventListener('click', (e) => {
            const deleteButton = e.target.closest('.delete-btn');
            const editButton = e.target.closest('.edit-btn');
            // --- UPGRADE 2: Listen for clicks on the new sort buttons ---
            const sortButton = e.target.closest('.sort-btn');

            if (deleteButton) this.handleDeleteClick(deleteButton);
            if (editButton) this.handleEditClick(editButton.dataset.id);
            if (sortButton) this.handleSortClick(sortButton.dataset.sort); // New action
        });

        this.cancelDeleteBtn.addEventListener('click', () => this.hideModal());
        this.confirmDeleteBtn.addEventListener('click', () => this.handleConfirmDelete());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hideModal();
        });
    }

    handleDeleteClick(button) {
        this.recordIdToDelete = button.dataset.id;
        this.showModal();
    }
    
    // --- UPGRADE 3: A new method to handle sort clicks ---
    handleSortClick(key) {
        // Here, we check if the user is clicking the same column header again.
        if (this.sortState.key === key) {
            // If they are, we just flip the sort order (e.g., from 'desc' to 'asc').
            this.sortState.order = this.sortState.order === 'asc' ? 'desc' : 'asc';
        } else {
            // If they click a new column, we update our memory to sort by that column.
            this.sortState.key = key;
            // We also set a default sort direction. For text it's A-Z, for numbers/dates it's High-to-Low.
            this.sortState.order = (key === 'description') ? 'asc' : 'desc';
        }
        // Finally, we tell the component to redraw itself using the new sorting rules.
        this.render(this.transactionForm.getRecords());
    }

    showModal() { this.modal.hidden = false; }
    hideModal() { this.modal.hidden = true; this.recordIdToDelete = null; }
    
    handleConfirmDelete() {
        if (this.recordIdToDelete) this.transactionForm.deleteRecord(this.recordIdToDelete);
        this.hideModal();
    }

    handleEditClick(id) {
        this.transactionForm.editRecord(id);
        if (this.addEditNavButton) this.addEditNavButton.click();
        document.getElementById('add-edit').scrollIntoView({ behavior: 'smooth' });
    }

    render(records) {
        if (records.length === 0) {
            this.container.innerHTML = `<div class="no-records-message">No transactions yet. Add one to get started!</div>`;
            return;
        }

        // Here, before drawing, we call our new sorting method to get the records in the correct order.
        const sortedRecords = this.sortRecords(records);

        const tableHtml = this.createTable(sortedRecords);
        const cardsHtml = this.createCards(sortedRecords);

        this.container.innerHTML = `
            <div class="records-section">
                ${tableHtml}
                ${cardsHtml}
            </div>
        `;
    }

    // --- UPGRADE 4: A new method that contains the sorting logic ---
    sortRecords(records) {
        const { key, order } = this.sortState;
        
        // Here, we make a safe copy so we don't change the original order of the records.
        return [...records].sort((a, b) => {
            let valA, valB;
            
            // This switch statement figures out what values to compare based on the sort key.
            switch (key) {
                case 'amount':
                    valA = a.amount; valB = b.amount; break;
                case 'description':
                    valA = a.description.toLowerCase(); valB = b.description.toLowerCase(); break;
                case 'date':
                default:
                    valA = new Date(a.date); valB = new Date(b.date); break;
            }
            
            // This is the core comparison logic.
            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // --- UPGRADE 5: createTable now dynamically builds the sortable headers ---
    createTable(records) {
        const { key: activeKey, order: activeOrder } = this.sortState;

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
                    <button class="edit-btn" data-id="${record.id}" aria-label="Edit transaction"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                    <button class="delete-btn" data-id="${record.id}" aria-label="Delete transaction"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
                </td>
            </tr>
        `).join('');

        // Here, we are building the HTML for the table header.
        // The classes and data-order attribute will change based on our sortState memory.
        return `
            <table class="records-table">
                <thead>
                    <tr>
                        <th>
                            <button class="sort-btn ${activeKey === 'description' ? 'active' : ''}" data-sort="description" data-order="${activeKey === 'description' ? activeOrder : 'asc'}">
                                Description
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                            </button>
                        </th>
                        <th>
                             <button class="sort-btn ${activeKey === 'date' ? 'active' : ''}" data-sort="date" data-order="${activeKey === 'date' ? activeOrder : 'desc'}">
                                Date
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                            </button>
                        </th>
                        <th>
                            <button class="sort-btn ${activeKey === 'amount' ? 'active' : ''}" data-sort="amount" data-order="${activeKey === 'amount' ? activeOrder : 'desc'}">
                                Amount
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                            </button>
                        </th>
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
        // Here, we just create the mobile view cards. Sorting is handled before this function is even called.
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


// --- Here, we are importing the specialist tools for searching ---
import { compileRegex, highlightMatches } from './search.js';

class Records {
    constructor(transactionForm) {
        // Here, we are saving references to all the HTML elements we need to talk to.
        this.transactionForm = transactionForm;
        this.container = document.getElementById('records-container');
        this.modal = document.getElementById('delete-modal');
        this.confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        this.cancelDeleteBtn = document.getElementById('cancel-delete-btn');
        this.addEditNavButton = document.querySelector('button[data-section="add-edit"]');
        this.searchInput = document.getElementById('search-input');
        this.caseToggle = document.getElementById('case-insensitive-toggle');
        this.searchErrorMsg = document.getElementById('search-error-msg');
        
        this.recordIdToDelete = null;

        // Here, we are creating a "memory" for the component's state.
        this.searchTerm = '';
        this.isCaseInsensitive = true;
        this.sortState = { key: 'date', order: 'desc' };
        
        this.init();
    }

    init() {
        this.render(this.transactionForm.getRecords());
        document.addEventListener('recordsUpdated', (e) => this.render(e.detail));
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Here, we are setting up one "spy" to listen for all clicks inside the records area.
        this.container.addEventListener('click', (e) => {
            const deleteButton = e.target.closest('.delete-btn');
            const editButton = e.target.closest('.edit-btn');
            const sortButton = e.target.closest('.sort-btn');

            if (deleteButton) this.handleDeleteClick(deleteButton);
            if (editButton) this.handleEditClick(editButton.dataset.id);
            if (sortButton) this.handleSortClick(sortButton.dataset.sort);
        });

        // Here, we are telling the search inputs to update the table whenever they change.
        this.searchInput.addEventListener('input', () => this.handleSearchChange());
        this.caseToggle.addEventListener('change', () => this.handleSearchChange());

        // Here, we are setting up the listeners for the delete confirmation pop-up.
        this.cancelDeleteBtn.addEventListener('click', () => this.hideModal());
        this.confirmDeleteBtn.addEventListener('click', () => this.handleConfirmDelete());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hideModal();
        });
    }

    // Here, we update our memory with the new search term and redraw the table.
    handleSearchChange() {
        this.searchTerm = this.searchInput.value;
        this.isCaseInsensitive = this.caseToggle.checked;
        this.render(this.transactionForm.getRecords());
    }

    // These methods handle the logic for clicking Edit, Delete, and Sort buttons.
    handleDeleteClick(button) {
        this.recordIdToDelete = button.dataset.id;
        this.showModal();
    }
    
    handleSortClick(key) {
        if (this.sortState.key === key) {
            this.sortState.order = this.sortState.order === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortState.key = key;
            this.sortState.order = (key === 'description') ? 'asc' : 'desc';
        }
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

    // This is the main "drawing" function for the entire component.
    render(records) {
        let recordsToDisplay = records;
        let regex = null;
        
        // Step 1: Filter the records based on the search term.
        if (this.searchTerm.trim()) {
            regex = compileRegex(this.searchTerm, this.isCaseInsensitive);
            if (regex) {
                recordsToDisplay = records.filter(record => regex.test(record.description));
                this.searchErrorMsg.textContent = '';
            } else {
                this.searchErrorMsg.textContent = 'Invalid regular expression.';
                recordsToDisplay = records;
            }
        } else {
            this.searchErrorMsg.textContent = '';
        }

        // Step 2: Check if there's anything left to display.
        if (recordsToDisplay.length === 0) {
            this.container.innerHTML = `<div class="no-records-message">${this.searchTerm ? 'No matching records found.' : 'No transactions yet. Add one to get started!'}</div>`;
            return;
        }

        // Step 3: Sort the filtered records.
        const sortedRecords = this.sortRecords(recordsToDisplay);
        
        // Step 4: Build the final HTML for the table and cards.
        const tableHtml = this.createTable(sortedRecords, regex);
        const cardsHtml = this.createCards(sortedRecords, regex);

        // Step 5: Put the final HTML on the page.
        this.container.innerHTML = `
            <div class="records-section">
                ${tableHtml}
                ${cardsHtml}
            </div>
        `;
    }

    // This method contains the logic for sorting the array.
    sortRecords(records) {
        const { key, order } = this.sortState;
        return [...records].sort((a, b) => {
            let valA, valB;
            switch (key) {
                case 'amount': valA = a.amount; valB = b.amount; break;
                case 'description': valA = a.description.toLowerCase(); valB = b.description.toLowerCase(); break;
                default: valA = new Date(a.date); valB = new Date(b.date); break;
            }
            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // This method builds the HTML for the desktop table view.
    createTable(records, regex) {
        const { key: activeKey, order: activeOrder } = this.sortState;

        const rows = records.map(record => {
            const highlightedDescription = highlightMatches(record.description, regex);
            return `
                <tr>
                    <td>
                        <div class="record-description">${highlightedDescription}</div>
                        <div class="record-date">${record.date}</div>
                    </td>
                    <td>${record.category ? `<span class="record-category">${record.category}</span>` : ''}</td>
                    <td class="record-amount ${record.type}">${record.type === 'income' ? '+' : '-'}$${record.amount.toFixed(2)}</td>
                    <td class="record-actions">
                        <button class="edit-btn" data-id="${record.id}" aria-label="Edit transaction">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                        </button>
                        <button class="delete-btn" data-id="${record.id}" aria-label="Delete transaction">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        return `
            <table class="records-table">
                <thead>
                    <tr>
                        <th><button class="sort-btn ${activeKey === 'description' ? 'active' : ''}" data-sort="description" data-order="${activeKey === 'description' ? activeOrder : 'asc'}">Description<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg></button></th>
                        <th><button class="sort-btn ${activeKey === 'date' ? 'active' : ''}" data-sort="date" data-order="${activeKey === 'date' ? activeOrder : 'desc'}">Date<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg></button></th>
                        <th><button class="sort-btn ${activeKey === 'amount' ? 'active' : ''}" data-sort="amount" data-order="${activeKey === 'amount' ? activeOrder : 'desc'}">Amount<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg></button></th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    // This method builds the HTML for the mobile card view.
    createCards(records, regex) {
        const cards = records.map(record => {
            const highlightedDescription = highlightMatches(record.description, regex);
            return `
                <div class="record-card">
                    <div class="record-card-main">
                        <div class="record-description">${highlightedDescription}</div>
                        <div class="record-amount ${record.type}">
                            ${record.type === 'income' ? '+' : '-'}$${record.amount.toFixed(2)}
                        </div>
                    </div>
                    <div class="record-card-details">
                        <span class="record-date">${record.date}</span>
                        ${record.category ? `| <span class="record-category">${record.category}</span>` : ''}
                    </div>
                    <div class="record-card-actions">
                        <button class="edit-btn" data-id="${record.id}" aria-label="Edit transaction"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg><span>Edit</span></button>
                        <button class="delete-btn" data-id="${record.id}" aria-label="Delete transaction"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg><span>Delete</span></button>
                    </div>
                </div>
            `;
        }).join('');

        return `<div class="records-cards">${cards}</div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.transactionForm) {
        new Records(window.transactionForm);
    }
});


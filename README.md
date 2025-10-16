# Student Finance Tracker

A responsive, accessible, and vanilla JavaScript application for tracking student expenses.  
This project was built as a summative assignment.

**Live Demo:** [https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/](https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/) *(to be filled)*

---

## Features

- **Responsive Design:** Mobile-first layout that adapts to tablet and desktop screens using Flexbox and media queries.  
- **Data Persistence:** All transactions are saved to `localStorage` and reloaded on page visit.  
- **CRUD Operations:** Add, view, edit, and delete financial records.  
- **Sorting & Filtering:** Sort records by date, description, or amount.  
- **Live Regex Search:** Highlights matches in real time with built-in error handling for invalid patterns.  
- **Statistics Dashboard:** View total spending, top expense category, and a simple trend chart.  
- **Budgeting:** Set a spending cap and receive live updates on your progress.  
- **Data Management:** Import and export financial data as a `.json` file.  
- **Accessibility First:** Built with semantic HTML, ARIA landmarks, keyboard navigation, visible focus states, and screen-reader-friendly updates.  

---

## Regex Catalog

This section documents the regular expressions used for form validation and search.

| **Pattern** | **Description** | **Example Match** | **Example Non-Match** |
|--------------|-----------------|------------------|------------------------|
| `^\S(?:.*\S)?$` | Forbids leading or trailing whitespace. | `Coffee` | `" Coffee "` |
| `^(0|[1-9]\d*)(\.\d{1,2})?$` | Validates positive numbers with up to two decimal places. | `12.50`, `100` | `-5`, `12.345` |
| `^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$` | Validates date format `YYYY-MM-DD`. | `2025-10-16` | `25-10-2025` |
| `^[A-Za-z]+(?:[ -][A-Za-z]+)*$` | Allows letters, hyphens, and single spaces. | `Food`, `Books-New` | `Food  Snacks` |
| `\b(\w+)\s+\1\b` (Advanced) | Detects duplicate words in the description field. | `Lunch at at the cafe` | `Lunch at the cafe` |

---

## Keyboard Navigation Map

The application is fully navigable using only a keyboard.

| **Key** | **Action** |
|----------|-------------|
| `Tab` | Move focus forward through all interactive elements (links, buttons, form inputs). |
| `Shift + Tab` | Move focus backward. |
| `Enter` | Activate a focused button (Add, Edit, Delete) or submit a form. |
| `Space` | Toggle checkboxes or activate buttons. |
| `Escape` | Close the edit form or modal dialogs. |

---

## Accessibility (a11y) Notes

- **Semantic HTML:** Uses `<header>`, `<nav>`, `<main>`, `<section>`, and `<footer>` for clear structure.  
- **ARIA Live Regions:** Budget status (`aria-live="polite"` or `assertive`) and search result count (`role="status"`) are announced by screen readers.  
- **Focus Management:** Includes a “Skip to Content” link and visible focus styles for all interactive elements.  
- **Form Labels:** All input fields are associated with a `<label>` for clarity.

---

## How to Run Tests

The regular expression validators can be tested independently:

1. **Clone this repository**  
   ```bash
   git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git

# Student Finance Tracker

A responsive, accessible, and vanilla JavaScript application for tracking student expenses. This project was built as a summative assignment.

**Live Demo Link:** [https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/](https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/) to be filled

---

## Features

* **Responsive Design**: Mobile-first layout that adapts to tablet and desktop screens using Flexbox and media queries.
* **Data Persistence**: All transactions are saved to `localStorage` and reloaded on page visit.
* **CRUD Operations**: Add, view, edit, and delete financial records.
* **Sorting & Filtering**: Sort records by date, description, or amount.
* **Live Regex Search**: A powerful search that highlights matches in real-time, with built-in error handling for invalid patterns.
* **Statistics Dashboard**: View total spending, top expense category, and a simple trend chart.
* **Budgeting**: Set a spending cap and receive live updates on your progress.
* **Data Management**: Import and export your financial data as a JSON file.
* **Accessibility First**: Built with semantic HTML, ARIA landmarks, keyboard navigation, visible focus states, and screen-reader-friendly live updates.

---

## Regex Catalog

This section documents the regular expressions used for form validation and search.

| Pattern                            | Description                                                              | Example Match          | Example Non-Match      |
| ---------------------------------- | ------------------------------------------------------------------------ | ---------------------- | ---------------------- |
| `^\S(?:.*\S)?$`                     | **Description**: Forbids leading/trailing whitespace.                    | `Coffee`               | ` Coffee `             |
| `^(0\|[1-9]\d*)(\.\d{1,2})?$`       | **Amount**: Validates positive numbers with up to two decimal places.      | `12.50` or `100`       | `12.555` or `abc`      |
| `^\d{4}-(0[1-9]\|1[0-2])-...`       | **Date**: Validates a YYYY-MM-DD format.                                   | `2025-09-29`           | `2025-9-29`            |
| `^[A-Za-z]+(?:[ -][A-Za-z]+)*$`   | **Category**: Allows letters, hyphens, and single spaces.                | `Food` or `Books-New`  | `Food  Snacks`         |
| `\b(\w+)\s+\1\b` (Advanced)      | **Duplicate Words**: Catches repeated words in the description field.      | `Lunch at at the cafe` | `Lunch at the cafe`    |

---

## Keyboard Navigation Map

The application is fully navigable using only a keyboard.

| Key     | Action                                                                                             |
| ------- | -------------------------------------------------------------------------------------------------- |
| `Tab`     | Moves focus forward through all interactive elements (links, buttons, form inputs).              |
| `Shift + Tab` | Moves focus backward.                                                                              |
| `Enter`   | Activates a focused button (e.g., Add, Edit, Delete) or submits a form.                          |
| `Space`   | Toggles checkboxes or activates buttons.                                                            |
| `Escape`  | Closes the edit form or modal dialogs.                                                             |

---

## Accessibility (a11y) Notes

* **Semantic HTML**: Uses `<header>`, `<nav>`, `<main>`, `<section>`, and `<footer>` for clear page structure.
* **ARIA Live Regions**: The dashboard budget status (`aria-live="polite"` or `assertive`) and search results count (`role="status"`) announce updates to screen reader users.
* **Focus Management**: A "Skip to Content" link is provided. Visible focus styles are applied to all interactive elements.
* **Form Labels**: All form inputs are associated with a `<label>` for clarity.

---

## How to Run Tests

The regular expression validators can be tested independently:
1.  Clone this repository.
2.  Open the `tests.html` file in your web browser.
3.  Check the browser's developer console (F12 or Ctrl/Cmd+Shift+I) to see the assertion results.
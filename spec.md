# Pathology Rate Manager

## Current State
- Admin dashboard shows a table of tests with Name, Category, MRP, B2B Rate, and Actions columns.
- Subaccount view shows a read-only table with Name, Category, MRP, and B2B Rate columns.
- No way to calculate or see a combined total of MRP + B2B Rate for any test or selection of tests.

## Requested Changes (Diff)

### Add
- A "Total Price" column in the tests table of both Admin Dashboard and Subaccount View that shows MRP + B2B Rate for each row.
- A "Price Calculator" panel/section in both Admin Dashboard (Tests tab) and Subaccount View that lets users select one or more tests using checkboxes, then shows a running total of: sum of selected MRPs, sum of selected B2B rates, and grand total (MRP + B2B) for the selection.

### Modify
- AdminDashboard.tsx: Add a "Total" column header and cell in the tests table. Add checkbox column for multi-select. Add a sticky summary/calculator bar at the bottom or a panel that shows totals when tests are selected.
- SubaccountView.tsx: Same additions as above (Total column, checkbox multi-select, summary bar) but read-only (no edit/delete actions).

### Remove
- Nothing removed.

## Implementation Plan
1. In both AdminDashboard.tsx and SubaccountView.tsx:
   a. Add a `selectedTestIds` state (Set<bigint>) to track checked rows.
   b. Add a checkbox column as the first column of the table (header with select-all, each row with individual checkbox).
   c. Add a "Total" column after B2B Rate showing `formatCurrency(test.mrp + test.b2bRate)`.
   d. When at least one test is selected, show a summary bar (sticky bottom card or inline section below the table) displaying:
      - Number of tests selected
      - Total MRP (sum of selected tests' MRP)
      - Total B2B Rate (sum of selected tests' B2B Rate)
      - Grand Total (MRP + B2B) prominently highlighted
      - A "Clear Selection" button
2. Keep all existing functionality intact (search, filter, add/edit/delete in admin, category pills in subaccount).

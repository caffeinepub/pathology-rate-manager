# Pathology Test Rate Manager

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Admin account with hardcoded credentials (username: 'Arit', password: '12345')
- Admin dashboard to manage pathological tests (add, edit, delete)
- Each test has: name, category, MRP (retail price), B2B rate
- Ability for admin to create subaccounts (name only, no password required)
- Subaccount view: read-only list of tests with MRP and B2B rates
- Subaccount selector on login/home page (no password needed, just pick a subaccount)
- Preloaded sample pathological tests (blood tests, urine tests, imaging, etc.)

### Modify
- N/A

### Remove
- N/A

## Implementation Plan

### Backend
- `PathologyTest` type: id, name, category, mrp, b2bRate
- `SubAccount` type: id, name (created by admin)
- Admin login: validate username/password, return session token
- CRUD for tests: createTest, updateTest, deleteTest, listTests (admin only)
- CRUD for subaccounts: createSubAccount, deleteSubAccount, listSubAccounts (admin only)
- Public read: getTests (accessible without auth, used by subaccounts)

### Frontend
- Login page: Admin login form + subaccount selector list
- Admin dashboard: 
  - Tests table with inline edit/delete, add new test form
  - Subaccounts management panel (create/delete subaccounts)
- Subaccount view: Read-only table of all tests with MRP and B2B rates
- Route guard: admin routes protected, subaccount routes open

# Pathology Rate Manager

## Current State
- Admin can manage pathology tests with global MRP and B2B rates
- Admin can create/edit/delete subaccounts (name + phone)
- Subaccounts view tests with the same global B2B rates for all subaccounts
- No per-subaccount B2B rate customization exists
- Tests have: id, name, category, mrp, b2bRate (global)

## Requested Changes (Diff)

### Add
- **Per-subaccount B2B rates**: Admin can override B2B rate for each test per subaccount
- **Default B2B rates**: The existing global `b2bRate` on each test acts as the default; per-subaccount overrides layer on top
- **Backend**: New `subAccountRates` store mapping `(subAccountId, testId) -> Float` for B2B rate overrides
- **Backend APIs**:
  - `setSubAccountTestRate(sessionToken, subAccountId, testId, b2bRate)` — set a custom B2B rate for a test in a specific subaccount
  - `deleteSubAccountTestRate(sessionToken, subAccountId, testId)` — remove the custom rate, falling back to default
  - `getSubAccountRates(subAccountId)` — returns all custom rate overrides for a subaccount (public, no auth)
- **Admin UI**: In the Subaccounts tab, each subaccount card has a "Set Rates" button that opens a dialog showing all tests with their current effective B2B rate and input to override per test. Shows whether rate is "custom" or "default". A "Reset to Default" option per test row. Also bulk "Reset All to Default" button.
- **Subaccount view**: Fetches `getSubAccountRates` for its own ID on load; uses subaccount-specific B2B rate if available, otherwise uses the global default. The displayed B2B rate reflects the subaccount-specific value.

### Modify
- `SubaccountView` component: receives `subaccountId` prop, fetches custom rates, merges with global rates before display
- Admin Subaccounts tab: each subaccount list item shows a "Set Rates" button alongside existing Edit/Delete
- `HomePage`: pass `subaccountId` when navigating to subaccount view (already has id from cache)

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo`: add `subAccountRates` Map, add `setSubAccountTestRate`, `deleteSubAccountTestRate`, `getSubAccountRates` functions
2. Update `backend.d.ts` to expose new functions
3. Add new hooks in `useQueries.ts`: `useGetSubAccountRates`, `useSetSubAccountTestRate`, `useDeleteSubAccountTestRate`
4. Update `SubaccountView` to accept `subaccountId`, fetch overrides, merge B2B rates before rendering
5. Update `HomePage` to pass `subaccountId` to `SubaccountView`
6. Add "Set Rates" dialog in `AdminDashboard` Subaccounts tab showing all tests with override inputs

# Pathology Rate Manager

## Current State
- Admin login with hardcoded username "Arit" / password "12345"
- No forgot password flow exists on the login page
- Backend has a fixed `adminPassword` variable; no SMS/email service is integrated
- HomePage, AdminDashboard, SubaccountView are the three main pages
- Motion animations on every table row cause perceived slowness
- No lazy loading; all pages are eagerly imported

## Requested Changes (Diff)

### Add
- **Forgot Password flow on the login page**: A "Forgot Password?" link under the password field opens a modal/step flow where the admin enters their registered mobile number. Since there is no SMS backend, the verification is done client-side using a pre-stored mobile number. The admin must first set their mobile number from the Admin Dashboard (stored in localStorage). If the mobile number matches the stored one, they are allowed to set a new password. The new password is saved to localStorage and used for subsequent logins (overrides the default "12345"). If no mobile number has been registered yet, show a prompt telling the admin to first set it in the dashboard settings.
- **Mobile number setting in Admin Dashboard**: Add a "Settings" tab (or a settings card inside the existing tabs) where the admin can enter/update their mobile number (used for forgot password) and also optionally change their password. Both are stored in localStorage.

### Modify
- **Performance**: Reduce or virtualize row animations -- use a single fade-in for the whole table body rather than per-row staggered animations. Lazy-load page components using React.lazy + Suspense.
- **Login page**: Add "Forgot Password?" link below the password input.

### Remove
- Per-row staggered `motion.tr` animations in AdminDashboard and SubaccountView (replace with a single container fade).

## Implementation Plan
1. Add a `useAdminSettings` hook / utility (localStorage-based) to read/write: `adminMobileNumber`, `adminPasswordOverride`.
2. Modify `HomePage.tsx`: add "Forgot Password?" link; add a `ForgotPasswordModal` component with two steps: (a) enter mobile number, (b) if it matches stored number, set new password. Show error if no mobile number is registered.
3. Modify `AdminDashboard.tsx`: add a Settings section (new tab or card) with fields to set mobile number and change password, with Save buttons.
4. Modify `AdminDashboard.tsx` and `SubaccountView.tsx`: replace staggered per-row `motion.tr` with a single wrapper fade animation on the table body.
5. Modify `App.tsx` (or wherever pages are imported): use `React.lazy` + `Suspense` for AdminDashboard and SubaccountView.
6. Modify login handler in `HomePage.tsx` to check `adminPasswordOverride` in localStorage first before comparing against the hardcoded "12345".

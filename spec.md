# Specification

## Summary
**Goal:** Add username/password authentication to the admin dashboard, replacing the current owner-guard access with a login form.

**Planned changes:**
- Add a backend function `verifyAdminCredentials(username, password)` that checks credentials against a stored (stable variable) default username and password, returning true or false.
- Replace the admin dashboard access flow on the frontend with a centered login form (username, password fields, and a Login button) shown before the dashboard is rendered.
- On successful credential verification, store a session flag in `sessionStorage` and display the full dashboard.
- On failed login, show an inline error message ("Invalid username or password").
- Add a Logout button inside the dashboard that clears the session and returns to the login screen.
- Style the login form to match the existing dark theme of the application.

**User-visible outcome:** Navigating to the admin dashboard now shows a login form requiring a valid username and password. Successful login grants access to the dashboard with a logout option; incorrect credentials show an error. The session persists across page refreshes via sessionStorage.

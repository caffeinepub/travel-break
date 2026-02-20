# Specification

## Summary
**Goal:** Hide the admin dashboard link from navigation while keeping the dashboard accessible via direct /admin URL.

**Planned changes:**
- Remove the admin dashboard navigation link from the HeaderNav component
- Ensure the /admin route remains accessible when users type the URL directly in the browser

**User-visible outcome:** The admin dashboard link no longer appears in the main navigation menu, but authorized admins can still access the dashboard by navigating directly to /admin in their browser address bar.

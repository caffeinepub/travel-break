# Specification

## Summary
**Goal:** Reorder the navigation/menu so "Order History" appears directly below "My Account" wherever both are shown together (especially in the mobile slide-out menu).

**Planned changes:**
- Update the menu item ordering in `frontend/src/components/layout/HeaderNav.tsx` so "Order History" is listed immediately after "My Account".
- Verify labels remain in English and navigation behaviors remain unchanged ("Order History" → `/order-history`; "My Account" opens the account/auth modal).

**User-visible outcome:** In menus where both items appear (notably the mobile slide-out menu), users will see "My Account" followed immediately by "Order History", with no change to where either item navigates.

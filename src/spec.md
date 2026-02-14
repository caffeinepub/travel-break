# Specification

## Summary
**Goal:** Use the 3 uploaded travel photos as optimized, readable background images in suitable sections of the app.

**Planned changes:**
- Add the 3 uploaded images as static frontend assets and generate optimized, wide background variants (desktop + mobile) under `frontend/public/assets/generated/`.
- Apply backgrounds in suitable places: Home page hero background (with a dark/soft overlay for readability), Hotels & Stays page subtle background/hero accent, and Sales Store page subtle background accent.
- Implement a reusable CSS background pattern (cover/center + overlay layer) via page/app styling (e.g., global CSS) without modifying any immutable UI component sources; ensure no layout shift and maintain sticky header readability in light/dark mode.

**User-visible outcome:** The Home, Hotels & Stays, and Sales Store pages display the uploaded travel photos as backgrounds/accents with readable text and unchanged English UI content.

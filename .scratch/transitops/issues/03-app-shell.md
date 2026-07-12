# 03 — App shell and protected routes

**What to build:** An authenticated user sees the TransitOps sidebar layout matching the mockup and can only reach app pages when signed in. Sign-in redirects to the dashboard with the split-layout login screen.

**Blocked by:** 02 — Schema and RBAC foundation

**Status:** resolved

- [x] `app/(app)/layout.tsx` with dark sidebar nav (Dashboard, Fleet, Drivers, Trips, Maintenance, Fuel & Expenses, Analytics, Settings)
- [x] Top bar with user avatar/menu; nav items gated by permissions
- [x] `requireSession()` on all authenticated pages
- [x] Sign-in page redesigned to mockup split layout; redirect to `/dashboard` on success
- [x] shadcn components added: sidebar, card, badge, avatar, dropdown-menu, separator

## Answer

App shell, Sidebar layout, gated navigation, user nav dropdown, and split-layout auth screen with quick login role buttons are fully implemented and verified.

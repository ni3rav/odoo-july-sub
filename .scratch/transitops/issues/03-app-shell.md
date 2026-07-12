# 03 — App shell and protected routes

**What to build:** An authenticated user sees the TransitOps sidebar layout matching the mockup and can only reach app pages when signed in. Sign-in redirects to the dashboard with the split-layout login screen.

**Blocked by:** 02 — Schema and RBAC foundation

**Status:** ready-for-agent

- [ ] `app/(app)/layout.tsx` with dark sidebar nav (Dashboard, Fleet, Drivers, Trips, Maintenance, Fuel & Expenses, Analytics, Settings)
- [ ] Top bar with user avatar/menu; nav items gated by permissions
- [ ] `requireSession()` on all authenticated pages
- [ ] Sign-in page redesigned to mockup split layout; redirect to `/dashboard` on success
- [ ] shadcn components added: sidebar, card, badge, avatar, dropdown-menu, separator

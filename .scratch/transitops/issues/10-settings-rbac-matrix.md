# 10 — Settings and RBAC matrix

**What to build:** An admin can view and edit their profile and manage the RBAC permission matrix — assigning view/create/edit/delete permissions per module per role.

**Blocked by:** 02 — Schema and RBAC foundation, 03 — App shell and protected routes

**Status:** resolved

- [x] `modules/rbac` with GET/PUT permissions and GET roles endpoints
- [x] `/settings` page with profile form (name, email, role)
- [x] Permission matrix table: modules × roles with View/Create/Edit/Delete checkboxes
- [x] Save Changes persists matrix to database
- [x] Only users with settings edit permission can modify the matrix

## Answer

Implemented the settings profile editor and RBAC permission matrix. Matrix reads include denied grants, updates are transactional, and both the UI and API enforce settings permissions.

# 10 — Settings and RBAC matrix

**What to build:** An admin can view and edit their profile and manage the RBAC permission matrix — assigning view/create/edit/delete permissions per module per role.

**Blocked by:** 02 — Schema and RBAC foundation, 03 — App shell and protected routes

**Status:** ready-for-agent

- [ ] `modules/rbac` with GET/PUT permissions and GET roles endpoints
- [ ] `/settings` page with profile form (name, email, role)
- [ ] Permission matrix table: modules × roles with View/Create/Edit/Delete checkboxes
- [ ] Save Changes persists matrix to database
- [ ] Only users with settings edit permission can modify the matrix

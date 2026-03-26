## Why

The current POS system utilizes a Static Role-Based Access Control (RBAC) model where permissions are tightly coupled to static roles (MANAGER, CASHIER, WAREHOUSE) within the application codebase. As the supermarket operations grow, management requires the flexibility to grant or revoke specific module access (e.g., allowing a senior cashier to temporarily manage inventory) directly from the dashboard UI without requiring developer intervention or application redeployment.

## What Changes

- Migrate from static codebase roles to a fully database-driven Dynamic Permission (ACL) matrix.
- Introduce advanced relational entities (`GroupRole`, `Permission`, and `Role_Permission` mapping) to the Prisma schema.
- Implement a dedicated "Phân Quyền" (Permission Management) interface within the Manager Dashboard featuring granular toggles for every system module.
- Refactor the global `authorizeRoles` backend Express middleware to validate incoming JWT requests against the dynamic database permission matrix rather than simple string arrays.
- **BREAKING**: Existing static role evaluation logic across Frontend (`App.tsx` routing, `ManagerDashboard.tsx` sidebar menu) and Backend endpoints will be replaced entirely.

## Capabilities

### New Capabilities
- `dynamic-permissions-engine`: The database schema, Prisma models, and core logic supporting granular permission validation.
- `permission-management-ui`: The frontend interface allowing administrators to dynamically toggle permissions for specific roles or individual users.

### Modified Capabilities
- `auth`: JWT payload structures must be updated to embed or securely reference the dynamic permission scopes.
- `rbac-middleware`: Backend middleware logic shifts from checking the static `VaiTro` string to evaluating explicit `Permission` keys from the payload or DB.
- `staff-management`: The staff CRUD interface must expand to support role assignments queried dynamically from the database instead of a hardcoded `<select>` dropdown.

## Impact

- **Database**: `schema.prisma` requires new tables to replace the static `VaiTro` string column.
- **Backend API**: `auth.middleware.ts`, `auth.controller.ts`, and every single router registration in `index.ts`.
- **Frontend App**: The `<PrivateRoute>` evaluation in `App.tsx`, sidebar mapping in `ManagerDashboard.tsx`, and user creation form in `StaffTab.tsx`.

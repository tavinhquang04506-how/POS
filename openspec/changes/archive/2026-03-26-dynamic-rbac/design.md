## Context

The POS system uses a static Role-Based Access Control (RBAC) model driven by hard-coded strings (`MANAGER`, `CASHIER`, `WAREHOUSE`). This static matrix restricts operational flexibility, as granting temporary or cross-functional access to employees requires developers to alter backend middleware arrays and frontend routing constraints.

## Goals / Non-Goals

**Goals:**
- Establish a database-driven Permission system separating Authentication (who you are) from Authorization (what you can do).
- Enable visual CRUD interfaces for assigning module-specific permissions (e.g., `VIEW_INVENTORY`, `EDIT_STAFF`) to specific roles.
- Ensure backend endpoints and frontend sidebars react dynamically to the database permissions.

**Non-Goals:**
- Row-Level Security (RLS) or data-scoping (e.g., Cashier A can only view invoices made by Cashier A) is explicitly out of scope for this RBAC engine. 

## Decisions

- **Decision 1: Relational Schema vs JSON Field**
  We will introduce normalized `GroupRole`, `Permission`, and `Role_Permission` tables instead of simply adding a `permissions: JSON` column to the `NhanVien` table.
  *Rationale*: Deeply relational schemas allow the UI to query all possible modules automatically and ensure database-level referential integrity when roles are assigned or revoked.

- **Decision 2: JWT Permission Payload**
  Permissions will be embedded as an array of permission-keys directly inside the JWT payload during login.
  *Rationale*: Querying the database for permission checks on every single `/api/*` request adds unacceptable latency. Embedding it in the JWT trades real-time exactness for extreme performance.

## Risks / Trade-offs

- **[Risk] JWT Token Staleness** → If a manager revokes access from a cashier, the cashier will still retain access until their current JWT expires.
  *Mitigation*: Enforce a shorter token lifespan (e.g., 4 hours) or require a manual "Logout/Login" action if immediate revocation is required.

## Migration Plan

1. Generate Prisma migrations for the new ACL tables.
2. Seed the database with the default roles (`MANAGER`, `CASHIER`, `WAREHOUSE`) mapped to their legacy permissions.
3. Deploy backend middleware changes.
4. Deploy frontend dynamic sidebar changes.

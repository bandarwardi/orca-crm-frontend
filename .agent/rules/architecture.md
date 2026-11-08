---
trigger: always_on
---

# Architecture & Folder Structure

## Module Boundaries (mirror the CRM's functional modules)

src/app/
├── core/ # auth, tenant context, http interceptors
├── shared/
│ ├── components/ # StatusBadge, KpiCard, DataTable, etc.
│ ├── pipes/
│ └── directives/
├── features/
│ ├── dashboard/
│ ├── leads/ # pipeline (kanban) + table + detail
│ ├── orders/ # list + wizard + detail
│ ├── inbox/ # unified WhatsApp/RingCentral inbox
│ ├── performance/ # employee KPIs/leaderboard
│ ├── subscribers-map/
│ ├── notifications/
│ └── settings/ # team, roles, integrations
└── layout/ # sidebar, header, shell


## Rules
- One feature = one lazy-loaded route/folder. Never let features 
  import each other's internals directly — go through `shared/` or 
  a defined public API (`index.ts`) per feature
- Every list screen (Leads, Orders, Notifications) shares the same 
  `DataTable`/`FilterPanel` components from `shared/` — do not 
  reimplement filtering logic per feature
- Wizard flows (New Order) get their own routed layout that hides the 
  main sidebar, per the design review decision
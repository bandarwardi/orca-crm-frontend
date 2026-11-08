---
trigger: always_on
---

# Tech Stack

## Frontend (this repo)
- Angular (latest stable) with standalone components — no NgModules 
  unless required for a specific library
- State management (Project-Wide): 
  - Use **NgRx SignalStore (`@ngrx/signals`)** for all feature-level and global state management, even for mock data. Use `patchState`, `withComputed`, and `withMethods`.
  - Use raw Angular Signals (`signal`, `computed`) ONLY for purely local component UI state (e.g., toggling a dropdown).
- Modern Angular Practices (Angular 16+ / 18):
  - Always use **Signal Inputs/Outputs** (`input()`, `output()`, `model()`) instead of `@Input` / `@Output`.
  - Always use **New Control Flow** (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`.
  - Use **`inject()`** function for dependency injection instead of constructor injection.
  - Utilize **Deferrable Views** (`@defer`) for heavy UI components (e.g., charts, complex modals) to optimize initial load.
- Styling: Tailwind CSS (to match Stitch's exported Tailwind classes 
  directly) + a small set of custom CSS variables for design tokens
- HTTP: Angular's `HttpClient` with typed interceptors for auth and 
  tenant context injection
- Forms: Reactive Forms only, never Template-driven forms
- i18n: Arabic is the default/only language for now — do not add 
  Angular i18n scaffolding until English is actually requested
- Charts: match whatever library the Stitch design implies (bar 
  charts, funnels) — prefer a lightweight library (e.g. ngx-charts 
  or Chart.js) over building custom SVG charts

## Backend (separate repo, for context only)
- NestJS + PostgreSQL/MySQL (relational, tenant_id on every table)
- This repo only consumes REST/GraphQL APIs from it — do not assume 
  direct DB access from Angular

## Package Management
- Use npm (not yarn/pnpm) unless told otherwise
- Pin exact versions for anything touching RTL/Arabic font rendering 
  to avoid silent breakage on updates
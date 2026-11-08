---
trigger: always_on
---

# Design System

## Source
All colors, spacing, typography, and component styles must come from 
the Stitch-exported screens in `/design/stitch-export/` — extract 
them into Angular/Tailwind design tokens rather than re-guessing values.

## Tokens to Extract and Centralize
Create `src/styles/tokens.scss` (or Tailwind config extension) with:
- Primary accent color (single accent used for primary actions/active states)
- Semantic status colors: green (نشط/success), amber (معلق/تحذير), 
  red (منتهي/خطأ) — used ONLY for status, never decoratively
- Neutral gray scale for backgrounds/borders/text
- Border-radius scale (match Stitch's consistent rounded-corner value)
- Spacing scale (8px grid, as established in the design)
- Font family and Arabic-appropriate line-height values

## Component Rules
- Card-based layout over dense tables, per the established pattern
- Max 4-5 visible elements per list row/card — anything beyond that 
  goes behind a click/hover, per the design review notes
- Bulk-action bars are hidden by default, shown only when items are 
  selected
- Every list/table screen uses ONE filter button pattern (opens a 
  panel) instead of multiple inline dropdowns
- Every modal/detail view has exactly ONE prominent primary action 
  button; secondary actions are icon-only buttons

## Component Reuse
Before creating a new component, check `src/app/shared/components/` — 
build a shared library of: StatusBadge, KpiCard, DataTable, 
FilterPanel, Avatar, Timeline, DeviceCard. These repeat across almost 
every screen in the Stitch design.
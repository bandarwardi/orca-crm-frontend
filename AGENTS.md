# orca CRM — Angular Web Application

## Project Overview
A web-based CRM admin panel for an IPTV subscription company serving 
Arab-American customers in the US. Used internally by Arabic-speaking, 
non-technical sales/support staff. Built to eventually support 
multi-tenant SaaS for other IPTV companies.

## Source of Truth
- UI/UX design reference: Stitch-generated screens exported to 
  `/design/stitch-export/` (HTML/Tailwind) — treat these as the 
  visual source of truth for every screen. Do not invent new layouts; 
  convert what exists there into Angular components faithfully.
- If `/design/DESIGN.md` exists, it is the canonical design token 
  reference (colors, typography, spacing) — read it before writing 
  any component styling.

## Detailed Rules
Read these before working on any related task:
- `.agent/rules/tech-stack.md` — stack, versions, package choices
- `.agent/rules/design-system.md` — design tokens and component styling
- `.agent/rules/rtl-arabic.md` — RTL layout and Arabic text handling
- `.agent/rules/architecture.md` — folder structure and module boundaries
- `.agent/rules/multi-tenant.md` — tenant isolation rules
- `.agent/rules/security.md` — sensitive data handling
- `.agent/rules/git-conventions.md` — commit and PR conventions

## Non-Negotiables
- Every screen is RTL Arabic-first. Never default to LTR or English UI text.
- Never hardcode tenant-specific data — everything flows through the 
  authenticated tenant context.
- Never log or expose device MAC addresses, Device Keys, or usernames 
  in browser console, error trackers, or client-side analytics.
- Match the Stitch design pixel-for-pixel on spacing, colors, and 
  component style — do not "improve" or restyle without being asked.

## Before Making Structural Changes
Always propose the plan first (which files/modules will change) 
before generating code for anything beyond a single component edit.
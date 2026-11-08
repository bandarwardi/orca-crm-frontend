---
trigger: always_on
---

# RTL & Arabic Handling

## Direction
- Set `dir="rtl"` and `lang="ar"` on the root `<html>` element globally — 
  do not toggle it per-component
- Use CSS logical properties everywhere (`margin-inline-start`, 
  `padding-inline-end`, `inset-inline-start`) instead of `left`/`right` 
  — this prevents the classic RTL bugs where things silently break

## Icons & Directional Elements
- Directional icons (arrows, chevrons, "back" navigation) must be 
  mirrored for RTL — verify each one visually, do not assume a UI 
  library auto-mirrors them
- Non-directional icons (search, bell, trash) stay as-is, unmirrored

## Text & Typography
- Use a font stack with solid Arabic glyph support and comfortable 
  line-height for Arabic script (avoid tight line-heights borrowed 
  from Latin-text defaults)
- Numbers: keep Arabic-Indic vs Western Arabic numerals consistent 
  with what's shown in the Stitch designs (the designs used Western 
  numerals — ١٢٣ style — mixed with Arabic text; match that exactly, 
  don't auto-convert)

## Testing
- Every new screen must be visually checked in an actual RTL browser 
  render, not just assumed correct from LTR-mirrored CSS
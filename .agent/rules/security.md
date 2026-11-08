---
trigger: always_on
---

# Security & Sensitive Data

- Device MAC addresses, Device Keys, and usernames are sensitive — 
  never send them to third-party analytics, error trackers (Sentry, 
  etc.), or browser console.log statements, even in development builds
- Customer phone numbers and addresses must not appear in URL query 
  parameters (use route params or POST bodies instead) to avoid 
  leaking them into browser history/logs
- All API calls must go through the authenticated HTTP interceptor — 
  no direct fetch/XHR calls bypassing it
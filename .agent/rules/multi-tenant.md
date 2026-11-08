---
trigger: always_on
---

# Multi-Tenant Rules

- The authenticated user's `tenant_id` is injected once via an HTTP 
  interceptor into every API request header — never pass it manually 
  per-call, and never let a component read/write it directly
- No component should ever hardcode a tenant name, logo, or 
  tenant-specific config — always resolve from the tenant context 
  service, since this system may serve multiple IPTV companies later
- Role-based UI visibility (مدير، مشرف مبيعات، موظف مبيعات، دعم فني) 
  must be driven by a single `PermissionsService`, not scattered 
  `*ngIf` checks on raw role strings throughout components
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../state/auth.store';

/**
 * يضيف X-Tenant-ID لكل طلب HTTP تلقائياً
 * لضمان عزل البيانات بين المستأجرين (Multi-Tenant Isolation).
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const tenantId = authStore.tenantId();

  if (tenantId) {
    const cloned = req.clone({
      setHeaders: {
        'X-Tenant-ID': tenantId,
      },
    });
    return next(cloned);
  }

  return next(req);
};

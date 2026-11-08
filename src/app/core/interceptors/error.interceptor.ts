import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../state/auth.store';

/**
 * يلتقط أخطاء HTTP ويعالجها مركزياً:
 * - 401 Unauthorized → تسجيل خروج وإعادة توجيه لصفحة Login
 * - 403 Forbidden → إعادة توجيه لصفحة رئيسية مع رسالة
 * - 500+ Server Error → تسجيل الخطأ
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          // انتهاء صلاحية الجلسة — تسجيل خروج تلقائي
          authStore.logout();
          router.navigate(['/login']);
          break;

        case 403:
          // صلاحيات غير كافية
          router.navigate(['/dashboard']);
          break;

        case 0:
          // فشل الاتصال بالسيرفر
          console.error('خطأ في الاتصال بالخادم. تأكد من تشغيل الباكند.');
          break;
      }

      return throwError(() => error);
    })
  );
};

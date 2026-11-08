import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../state/auth.store';
import { jwtDecode } from 'jwt-decode';

export const authGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isLoggedIn()) {
    const token = authStore.userToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp && (decoded.exp * 1000) > Date.now()) {
          return true;
        }
      } catch (e) {
        // invalid token
      }
    }
    // Token is invalid or expired, clear state
    authStore.logout();
  }

  return router.createUrlTree(['/login']);
};

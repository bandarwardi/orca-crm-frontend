import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { AuthUser } from '../models/auth.models';

export interface AuthState {
  isLoggedIn: boolean;
  userToken: string | null;
  user: AuthUser | null;
  tenantId: string | null;
}

function loadStoredAuth(): AuthState {
  const token = localStorage.getItem('orca_token');
  const userJson = localStorage.getItem('orca_user');
  const user = userJson ? JSON.parse(userJson) : null;

  return {
    isLoggedIn: !!token,
    userToken: token,
    user,
    tenantId: user?.tenant_id ?? null,
  };
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(loadStoredAuth()),
  withMethods((store) => ({
    loginSuccess(token: string, user: AuthUser) {
      localStorage.setItem('orca_token', token);
      localStorage.setItem('orca_user', JSON.stringify(user));
      patchState(store, {
        isLoggedIn: true,
        userToken: token,
        user,
        tenantId: user.tenant_id,
      });
    },
    logout() {
      localStorage.removeItem('orca_token');
      localStorage.removeItem('orca_user');
      patchState(store, {
        isLoggedIn: false,
        userToken: null,
        user: null,
        tenantId: null,
      });
    },
  }))
);

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AppShell } from './layout/app-shell/app-shell';
import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Leads } from './features/leads/leads';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: '',
    component: AppShell,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'leads', component: Leads },
      {
        path: 'orders',
        loadChildren: () => import('./features/orders/orders.routes').then(m => m.ordersShellRoutes)
      },
      {
        path: 'inbox',
        loadChildren: () => import('./features/inbox/inbox.routes').then(m => m.INBOX_ROUTES)
      },
      {
        path: 'performance',
        loadChildren: () => import('./features/performance/performance.routes').then(m => m.PERFORMANCE_ROUTES)
      },
      {
        path: 'map',
        loadChildren: () => import('./features/subscribers-map/subscribers-map.routes').then(m => m.SUBSCRIBERS_MAP_ROUTES)
      },
      {
        path: 'subscribers-map',
        redirectTo: 'map'
      },
      {
        path: 'notifications',
        loadChildren: () => import('./features/notifications/notifications.routes').then(m => m.NOTIFICATIONS_ROUTES)
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

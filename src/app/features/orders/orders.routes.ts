import { Routes } from '@angular/router';
import { OrdersList } from './components/orders-list/orders-list';
import { OrderDetail } from './components/order-detail/order-detail';

/**
 * Routes for Orders feature within AppShell layout
 */
export const ordersShellRoutes: Routes = [
  {
    path: '',
    component: OrdersList
  },
  {
    path: 'new',
    loadComponent: () => import('./components/order-wizard/order-wizard').then(m => m.OrderWizard)
  },
  {
    path: 'wizard',
    redirectTo: 'new',
    pathMatch: 'full'
  },
  {
    path: ':id',
    component: OrderDetail
  }
];

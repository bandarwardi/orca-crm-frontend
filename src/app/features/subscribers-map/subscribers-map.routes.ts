import { Routes } from '@angular/router';

export const SUBSCRIBERS_MAP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./subscribers-map').then((m) => m.SubscribersMap)
  }
];

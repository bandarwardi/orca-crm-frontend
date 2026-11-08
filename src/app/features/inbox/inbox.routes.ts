import { Routes } from '@angular/router';

export const INBOX_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/inbox-shell/inbox-shell').then(m => m.InboxShellComponent)
  }
];

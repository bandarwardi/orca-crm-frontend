import { Routes } from '@angular/router';
import { PerformanceShell } from './performance-shell';

export const PERFORMANCE_ROUTES: Routes = [
  {
    path: '',
    component: PerformanceShell,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/performance-dashboard/performance-dashboard').then(
            (m) => m.PerformanceDashboard
          )
      },
      {
        path: 'reps/:repId',
        loadComponent: () =>
          import('./pages/rep-detail/rep-detail').then((m) => m.RepDetail)
      },
      {
        path: 'leaderboard',
        loadComponent: () =>
          import('./pages/team-leaderboard/team-leaderboard').then(
            (m) => m.TeamLeaderboard
          )
      },
      {
        path: 'sources',
        loadComponent: () =>
          import('./pages/lead-source-comparison/lead-source-comparison').then(
            (m) => m.LeadSourceComparison
          )
      }
    ]
  }
];

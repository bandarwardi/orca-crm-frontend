import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DateRangeFilter } from '../../models/performance.models';

@Component({
  selector: 'app-performance-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
      <!-- Title, Subtitle & Sub-Nav Tabs Integrated -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-space-md">
        <div class="flex flex-col gap-0.5">
          <div class="flex items-center gap-space-xs">
            <span class="w-2.5 h-6 rounded-full bg-primary-container inline-block"></span>
            <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">أداء الموظفين</h1>
          </div>
          <p class="font-body-sm text-body-sm text-on-surface-variant pr-3.5">
            متابعة إنتاجية ومبيعات فريق المبيعات والتحويلات اللحظية
          </p>
        </div>

        <!-- Sub-Nav Tabs Integrated in Single Row -->
        <div class="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl shadow-xs border border-surface-container">
          <a
            routerLink="/performance"
            [routerLinkActiveOptions]="{ exact: true }"
            routerLinkActive="bg-surface-container-lowest text-primary font-bold shadow-sm"
            class="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm flex items-center gap-1.5 transition-all">
            <span class="material-symbols-outlined text-[17px]">dashboard</span>
            <span>نظرة عامة</span>
          </a>

          <a
            routerLink="/performance/leaderboard"
            routerLinkActive="bg-surface-container-lowest text-primary font-bold shadow-sm"
            class="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm flex items-center gap-1.5 transition-all">
            <span class="material-symbols-outlined text-[17px]">leaderboard</span>
            <span>لوحة الصدارة</span>
          </a>

          <a
            routerLink="/performance/sources"
            routerLinkActive="bg-surface-container-lowest text-primary font-bold shadow-sm"
            class="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm flex items-center gap-1.5 transition-all">
            <span class="material-symbols-outlined text-[17px]">hub</span>
            <span>مقارنة المصادر</span>
          </a>
        </div>
      </div>

      <!-- Actions & Filter Pills -->
      <div class="flex flex-wrap items-center gap-space-xs">
        <!-- Date Range Pills -->
        <div class="bg-surface-container-low p-1 rounded-xl flex items-center shadow-xs border border-surface-container">
          <button
            type="button"
            (click)="rangeChange.emit('this_week')"
            [ngClass]="activeRange() === 'this_week'
              ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'"
            class="px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all">
            هذا الأسبوع
          </button>
          <button
            type="button"
            (click)="rangeChange.emit('this_month')"
            [ngClass]="activeRange() === 'this_month'
              ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'"
            class="px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all">
            هذا الشهر
          </button>
          <button
            type="button"
            (click)="rangeChange.emit('custom')"
            [ngClass]="activeRange() === 'custom'
              ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'"
            class="px-3 py-1.5 rounded-lg font-label-sm text-label-sm flex items-center gap-1.5 transition-all">
            <span class="material-symbols-outlined text-[16px]">calendar_today</span>
            <span>مخصص</span>
          </button>
        </div>

        <div class="h-6 w-px bg-surface-container hidden sm:block mx-1"></div>

        <!-- Export Button -->
        <button
          type="button"
          (click)="exportReport.emit()"
          class="h-9 px-3.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center gap-2 shadow-xs transition-all border border-surface-container">
          <span class="material-symbols-outlined text-[17px] text-primary">download</span>
          <span>تصدير التقرير</span>
        </button>
      </div>
    </div>
  `
})
export class PerformanceHeader {
  activeRange = input<DateRangeFilter>('this_month');
  rangeChange = output<DateRangeFilter>();
  exportReport = output<void>();
}

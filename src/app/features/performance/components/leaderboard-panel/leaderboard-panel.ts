import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ChartMetric,
  CoreMetricType,
  EmployeePerformance,
  SortOption,
  ViewMode
} from '../../models/performance.models';

@Component({
  selector: 'app-leaderboard-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container flex flex-col gap-space-md">
      <!-- Unified Header with View Mode Tabs & Navigation to Full Leaderboard -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-surface-container">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[22px]">leaderboard</span>
          <div>
            <h2 class="font-headline-md text-headline-md text-on-surface font-semibold">ترتيب مسؤولي المبيعات</h2>
            <span class="font-body-sm text-body-sm text-on-surface-variant">مرتبة حسب معدل التحويل العادل والمقاييس الأربعة الأساسية</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- View Mode Tabs (Leaderboard Table vs Chart) -->
          <div class="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
            <button
              type="button"
              (click)="viewModeChange.emit('table')"
              [ngClass]="viewMode() === 'table'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'"
              class="px-3 py-1.5 rounded-md font-label-md text-label-md flex items-center gap-1.5 transition-all">
              <span class="material-symbols-outlined text-[18px]">table_chart</span>
              <span>جدول الترتيب</span>
            </button>
            <button
              type="button"
              (click)="viewModeChange.emit('chart')"
              [ngClass]="viewMode() === 'chart'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'"
              class="px-3 py-1.5 rounded-md font-label-md text-label-md flex items-center gap-1.5 transition-all">
              <span class="material-symbols-outlined text-[18px]">bar_chart</span>
              <span>مخطط بياني</span>
            </button>
          </div>

          <!-- Link to Full Leaderboard Screen -->
          <button
            type="button"
            (click)="goToFullLeaderboard()"
            class="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-label-sm text-label-sm flex items-center gap-1 transition-colors border border-surface-container">
            <span>لوحة الصدارة الكاملة</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>

      <!-- TAB 1: Table View -->
      @if (viewMode() === 'table') {
        <div class="flex flex-col gap-space-md">
          <!-- Search & Sorting Filter Toolbar -->
          <div class="flex flex-wrap items-center justify-between gap-space-xs">
            <div class="relative flex-1 min-w-[200px] max-w-xs">
              <span class="material-symbols-outlined absolute right-3 top-2.5 text-[18px] text-outline pointer-events-none">search</span>
              <input
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="searchChange.emit($event)"
                placeholder="بحث باسم الموظف..."
                class="h-10 w-full pr-9 pl-4 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline"
              />
            </div>

            <!-- Sort By Buttons (Focusing on the 4 Core Metrics) -->
            <div class="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
              <span class="font-label-sm text-label-sm text-outline px-2">ترتيب حسب:</span>
              <button
                type="button"
                (click)="sortChange.emit('conversion')"
                [ngClass]="activeSort() === 'conversion'
                  ? 'bg-surface-container-lowest text-emerald-700 shadow-sm font-bold border-b-2 border-emerald-500'
                  : 'text-on-surface-variant hover:text-on-surface'"
                class="px-2.5 py-1 rounded font-label-sm text-label-sm transition-all flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px]">conversion_path</span>
                <span>معدل التحويل (الأساسي)</span>
              </button>
              <button
                type="button"
                (click)="sortChange.emit('revenue')"
                [ngClass]="activeSort() === 'revenue'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'"
                class="px-2.5 py-1 rounded font-label-sm text-label-sm transition-all">
                الإيرادات
              </button>
              <button
                type="button"
                (click)="sortChange.emit('orders')"
                [ngClass]="activeSort() === 'orders'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'"
                class="px-2.5 py-1 rounded font-label-sm text-label-sm transition-all">
                الطلبات
              </button>
              <button
                type="button"
                (click)="sortChange.emit('customers')"
                [ngClass]="activeSort() === 'customers'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'"
                class="px-2.5 py-1 rounded font-label-sm text-label-sm transition-all">
                العملاء
              </button>
            </div>
          </div>

          <!-- Table Container -->
          <div class="overflow-x-auto">
            <table class="w-full text-right border-collapse">
              <thead>
                <tr class="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm h-11">
                  <th class="px-4 text-center w-14 rounded-r-lg">#</th>
                  <th class="px-4">الموظف والقناة الأبرز</th>
                  <!-- The 4 Core Metrics -->
                  <th class="px-4 text-center" [class.font-bold]="activeSort() === 'conversion'">
                    <div class="flex items-center justify-center gap-1" [class.text-emerald-700]="activeSort() === 'conversion'">
                      <span class="material-symbols-outlined text-[16px]">conversion_path</span>
                      <span>معدل التحويل</span>
                    </div>
                  </th>
                  <th class="px-4 text-center" [class.font-bold]="activeSort() === 'revenue'">
                    <div class="flex items-center justify-center gap-1" [class.text-indigo-700]="activeSort() === 'revenue'">
                      <span class="material-symbols-outlined text-[16px]">payments</span>
                      <span>الإيرادات</span>
                    </div>
                  </th>
                  <th class="px-4 text-center" [class.font-bold]="activeSort() === 'orders'">
                    <div class="flex items-center justify-center gap-1" [class.text-brand-700]="activeSort() === 'orders'">
                      <span class="material-symbols-outlined text-[16px]">shopping_bag</span>
                      <span>عدد الطلبات</span>
                    </div>
                  </th>
                  <th class="px-4 text-center" [class.font-bold]="activeSort() === 'customers'">
                    <div class="flex items-center justify-center gap-1" [class.text-purple-700]="activeSort() === 'customers'">
                      <span class="material-symbols-outlined text-[16px]">person_check</span>
                      <span>العملاء الفريدون</span>
                    </div>
                  </th>
                  <th class="px-4 text-center w-20 rounded-l-lg">التفاصيل</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-container">
                @for (emp of employees(); track emp.id; let idx = $index) {
                  <tr
                    (click)="onRowClick(emp.id)"
                    class="employee-row hover:bg-surface-container-low/70 transition-colors group cursor-pointer">
                    <!-- Rank Column with Gold/Silver/Bronze for Top 3 -->
                    <td class="py-3.5 px-4 text-center">
                      @if (idx === 0) {
                        <div class="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm ring-1 ring-amber-300">
                          <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">emoji_events</span>
                        </div>
                      } @else if (idx === 1) {
                        <div class="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto shadow-sm ring-1 ring-slate-300">
                          <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">military_tech</span>
                        </div>
                      } @else if (idx === 2) {
                        <div class="w-7 h-7 rounded-full bg-amber-900/10 text-amber-800 flex items-center justify-center mx-auto shadow-sm ring-1 ring-amber-700/30">
                          <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">military_tech</span>
                        </div>
                      } @else {
                        <span class="font-label-md text-label-md text-outline font-semibold">{{ idx + 1 }}</span>
                      }
                    </td>

                    <!-- Employee Name & Context Tag -->
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-3">
                        @if (emp.avatarUrl) {
                          <div class="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-sm border border-surface-container">
                            <img [src]="emp.avatarUrl" [alt]="emp.name" class="w-full h-full object-cover" />
                          </div>
                        } @else {
                          <div class="w-9 h-9 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-label-md font-semibold shrink-0">
                            {{ emp.initials }}
                          </div>
                        }
                        <div class="flex flex-col">
                          <div class="flex items-center gap-1.5">
                            <span class="font-headline-sm text-headline-sm text-on-surface font-semibold group-hover:text-primary transition-colors">
                              {{ emp.name }}
                            </span>
                            @if (emp.isTopPerformer) {
                              <span class="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
                            }
                            @if (emp.needsSupportAlert) {
                              <span class="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-label-sm text-[10px] font-semibold">
                                يحتاج دعم
                              </span>
                            }
                          </div>
                          <div class="flex items-center gap-2 text-on-surface-variant font-body-sm text-[11px]">
                            <span>{{ emp.role }}</span>
                            <span>•</span>
                            <span class="text-outline">أغلب العملاء: {{ emp.dominantSource }}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <!-- Metric 1: معدل التحويل (Hero Metric - always emphasized) -->
                    <td class="py-3.5 px-4 text-center">
                      <span
                        [ngClass]="activeSort() === 'conversion'
                          ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-400 font-bold scale-105'
                          : emp.conversionRate >= 40
                            ? 'bg-secondary/10 text-secondary'
                            : 'bg-surface-container text-on-surface-variant'"
                        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-label-md transition-all shadow-xs">
                        <span
                          [ngClass]="emp.conversionRate >= 40 ? 'bg-secondary' : 'bg-outline'"
                          class="w-1.5 h-1.5 rounded-full"></span>
                        <span dir="ltr">{{ emp.conversionRateFormatted }}</span>
                      </span>
                    </td>

                    <!-- Metric 2: الإيرادات -->
                    <td class="py-3.5 px-4 text-center">
                      <span
                        [ngClass]="activeSort() === 'revenue' ? 'text-primary font-bold text-[16px]' : 'text-on-surface-variant'"
                        class="font-headline-sm text-headline-sm"
                        dir="ltr">
                        {{ emp.revenueFormatted }}
                      </span>
                    </td>

                    <!-- Metric 3: عدد الطلبات -->
                    <td class="py-3.5 px-4 text-center">
                      <span
                        [ngClass]="activeSort() === 'orders' ? 'text-brand-600 font-bold text-[16px]' : 'text-on-surface-variant'"
                        class="font-body-md text-body-md font-medium">
                        {{ emp.orderCountLabel }}
                      </span>
                    </td>

                    <!-- Metric 4: العملاء الفريدون -->
                    <td class="py-3.5 px-4 text-center">
                      <span
                        [ngClass]="activeSort() === 'customers' ? 'text-purple-700 font-bold text-[16px]' : 'text-on-surface-variant'"
                        class="font-body-md text-body-md">
                        {{ emp.uniqueCustomersLabel }}
                      </span>
                    </td>

                    <!-- Action Link to Rep Detail Screen -->
                    <td class="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        (click)="onRowClick(emp.id)"
                        class="w-8 h-8 rounded-lg flex items-center justify-center text-outline group-hover:text-primary group-hover:bg-primary-container/10 transition-all mx-auto">
                        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 2: Clean Bar Chart View -->
      @if (viewMode() === 'chart') {
        <div class="flex flex-col gap-5 pt-2">
          <!-- Metric Scale Selector -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
              <button
                type="button"
                (click)="chartMetricChange.emit('conversion')"
                [ngClass]="chartMetric() === 'conversion'
                  ? 'bg-surface-container-lowest text-emerald-700 shadow-sm font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'"
                class="px-3 py-1 rounded font-label-sm text-label-sm transition-all flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px]">conversion_path</span>
                <span>معدل التحويل (%)</span>
              </button>
              <button
                type="button"
                (click)="chartMetricChange.emit('revenue')"
                [ngClass]="chartMetric() === 'revenue'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'"
                class="px-3 py-1 rounded font-label-sm text-label-sm transition-all">
                الإيرادات ($)
              </button>
              <button
                type="button"
                (click)="chartMetricChange.emit('orders')"
                [ngClass]="chartMetric() === 'orders'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'"
                class="px-3 py-1 rounded font-label-sm text-label-sm transition-all">
                الطلبات (عدد)
              </button>
            </div>
          </div>

          <!-- Scale Axis precisely aligned with bar tracks -->
          <div class="flex items-center gap-4">
            <div class="w-40 shrink-0"></div>
            <div class="flex-1 flex justify-between items-center px-2 text-on-surface-variant font-code-sm text-code-sm">
              @if (chartMetric() === 'conversion') {
                <span>0%</span>
                <span>15%</span>
                <span>30%</span>
                <span>45%</span>
                <span>60%</span>
              } @else if (chartMetric() === 'revenue') {
                <span>$0</span>
                <span>$4,500</span>
                <span>$9,000</span>
                <span>$13,500</span>
                <span>$18,000</span>
              } @else {
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              }
            </div>
          </div>

          <!-- Employee Bars -->
          <div class="flex flex-col gap-4">
            @for (emp of employees(); track emp.id) {
              <div
                (click)="onRowClick(emp.id)"
                class="flex items-center gap-4 group cursor-pointer hover:bg-surface-container-low/40 p-1.5 rounded-lg transition-colors">
                <!-- Employee Identifier -->
                <div class="w-40 shrink-0 flex items-center gap-2.5">
                  @if (emp.avatarUrl) {
                    <div class="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-sm border border-surface-container">
                      <img [src]="emp.avatarUrl" [alt]="emp.name" class="w-full h-full object-cover" />
                    </div>
                  } @else {
                    <div class="w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-label-sm shrink-0">
                      {{ emp.initials }}
                    </div>
                  }
                  <div class="flex flex-col overflow-hidden">
                    <span class="font-label-md text-label-md text-on-surface font-semibold truncate group-hover:text-primary transition-colors">
                      {{ emp.name }}
                    </span>
                    <span class="text-[10px] text-outline truncate">{{ emp.dominantSource }}</span>
                  </div>
                </div>

                <!-- Bar Track -->
                <div class="flex-1 bg-surface-container-low h-8 rounded-lg overflow-hidden relative flex items-center p-1">
                  <div
                    [style.width.%]="getBarWidth(emp)"
                    [ngClass]="getBarColorClass(emp)"
                    class="h-full rounded flex items-center justify-end px-3 transition-all duration-500 shadow-xs">
                    <span class="font-code-sm text-code-sm font-semibold" dir="ltr">
                      {{ getBarLabel(emp) }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class LeaderboardPanel {
  viewMode = input<ViewMode>('table');
  searchQuery = input<string>('');
  sortBy = input<SortOption>('conversion');
  activeSort = input<SortOption>('conversion');
  chartMetric = input<ChartMetric>('conversion');
  employees = input<EmployeePerformance[]>([]);

  viewModeChange = output<ViewMode>();
  searchChange = output<string>();
  sortChange = output<SortOption>();
  chartMetricChange = output<ChartMetric>();
  employeeSelect = output<string>();

  constructor(private router: Router) {}

  onRowClick(empId: string): void {
    this.router.navigate(['/performance/reps', empId]);
  }

  goToFullLeaderboard(): void {
    this.router.navigate(['/performance/leaderboard']);
  }

  getBarWidth(emp: EmployeePerformance): number {
    switch (this.chartMetric()) {
      case 'conversion':
        // Map 0-60% to 0-100% width
        return Math.min(Math.round((emp.conversionRate / 60) * 100), 100);
      case 'revenue':
        return emp.chartPercentageRevenue;
      case 'orders':
        return emp.chartPercentageOrders;
      default:
        return emp.chartPercentageConversion;
    }
  }

  getBarLabel(emp: EmployeePerformance): string {
    switch (this.chartMetric()) {
      case 'conversion':
        return emp.conversionRateFormatted;
      case 'revenue':
        return emp.revenueFormatted;
      case 'orders':
        return `${emp.orderCount} طلب`;
      default:
        return emp.conversionRateFormatted;
    }
  }

  getBarColorClass(emp: EmployeePerformance): string {
    if (this.chartMetric() === 'conversion') {
      return emp.conversionRate >= 40
        ? 'bg-emerald-600 text-white'
        : emp.conversionRate >= 30
          ? 'bg-emerald-500/80 text-white'
          : 'bg-amber-500 text-white';
    }
    switch (emp.rank) {
      case 1: return 'bg-primary-container text-on-primary';
      case 2: return 'bg-primary text-on-primary';
      case 3: return 'bg-surface-tint text-on-primary';
      default: return 'bg-primary-fixed-dim text-on-primary-fixed';
    }
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { PerformanceStore } from '../../store/performance.store';
import { CoreMetricType, EmployeePerformance } from '../../models/performance.models';

@Component({
  selector: 'app-team-leaderboard',
  standalone: true,
  host: { class: 'block w-full' },
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  template: `
    <div class="flex flex-col w-full gap-space-lg" dir="rtl">
      <!-- HEADER & SEGMENTED METRIC CONTROL -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div class="flex flex-col sm:flex-row sm:items-center gap-space-md">
          <div class="flex flex-col gap-0.5">
            <div class="flex items-center gap-space-xs">
              <span class="material-symbols-outlined text-amber-500 text-[26px]">emoji_events</span>
              <h2 class="font-headline-lg text-headline-lg text-on-surface font-bold">لوحة الصدارة والتكريم</h2>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant pr-1">
              ترتيب أعضاء الفريق وتتويج أصحاب الأداء الأعلى بناءً على معايير الأداء الأربعة
            </p>
          </div>

          <!-- Sub-Nav Tabs -->
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

        <!-- Metric Selector Dropdown -->
        <div class="flex items-center gap-2 self-start lg:self-auto bg-surface-container-low px-3 py-1.5 rounded-xl border border-surface-container shadow-xs">
          <div class="flex items-center gap-1.5 text-outline">
            <span class="material-symbols-outlined text-[18px]">tune</span>
            <span class="font-label-sm text-label-sm font-medium whitespace-nowrap">معيار الصدارة:</span>
          </div>
          <select
            [ngModel]="store.rankingMetric()"
            (ngModelChange)="onMetricChange($event)"
            class="h-9 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md font-semibold border border-surface-container outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
            <option value="conversion">معدل التحويل (الأساسي)</option>
            <option value="revenue">الإيرادات</option>
            <option value="orders">الطلبات</option>
            <option value="customers">العملاء</option>
          </select>
        </div>
      </div>

      <!-- TOP 3 PODIUM TREATMENT (ELEVATED CARDS) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md items-end">
        @for (rep of store.podiumEmployees(); track rep.id; let idx = $index) {
          <div
            (click)="onRepClick(rep.id)"
            [ngClass]="idx === 0
              ? 'order-1 md:order-2 border-2 border-amber-400 bg-gradient-to-b from-amber-50/70 to-surface-container-lowest shadow-md -translate-y-2'
              : idx === 1
                ? 'order-2 md:order-1 border border-slate-300 bg-surface-container-lowest shadow-sm'
                : 'order-3 md:order-3 border border-amber-700/30 bg-surface-container-lowest shadow-sm'"
            class="rounded-2xl p-space-md flex flex-col justify-between cursor-pointer group hover:shadow-lg transition-all relative overflow-hidden">
            
            <!-- Medal Badge Accent -->
            <div class="absolute top-3 start-3">
              @if (idx === 0) {
                <div class="px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 font-label-sm text-[12px] font-bold shadow-xs flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">emoji_events</span>
                  <span>المركز الأول 🥇</span>
                </div>
              } @else if (idx === 1) {
                <div class="px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 font-label-sm text-[12px] font-bold shadow-xs flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">military_tech</span>
                  <span>المركز الثاني 🥈</span>
                </div>
              } @else {
                <div class="px-2.5 py-1 rounded-full bg-amber-900/15 text-amber-900 font-label-sm text-[12px] font-bold shadow-xs flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">military_tech</span>
                  <span>المركز الثالث 🥉</span>
                </div>
              }
            </div>

            <!-- Profile Info -->
            <div class="flex flex-col items-center text-center pt-8 pb-4">
              @if (rep.avatarUrl) {
                <div
                  [ngClass]="idx === 0 ? 'w-20 h-20 ring-4 ring-amber-400/40' : 'w-16 h-16 ring-2 ring-surface-container'"
                  class="rounded-full overflow-hidden shadow-md mb-3 transition-transform group-hover:scale-105">
                  <img [src]="rep.avatarUrl" [alt]="rep.name" class="w-full h-full object-cover" />
                </div>
              } @else {
                <div
                  [ngClass]="idx === 0 ? 'w-20 h-20 text-2xl' : 'w-16 h-16 text-xl'"
                  class="rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold mb-3 shadow-md">
                  {{ rep.initials }}
                </div>
              }

              <h3 class="font-headline-md text-headline-md text-on-surface font-bold group-hover:text-primary transition-colors">
                {{ rep.name }}
              </h3>
              <span class="font-body-sm text-body-sm text-on-surface-variant">{{ rep.role }}</span>
              <span class="font-code-sm text-[11px] text-outline mt-0.5">{{ rep.department }}</span>
            </div>

            <!-- Primary Highlighted Metric for Podium -->
            <div class="bg-surface-container-low p-3 rounded-xl flex flex-col items-center text-center my-2 border border-surface-container">
              <span class="font-label-sm text-[11px] text-on-surface-variant">{{ getMetricLabel(store.rankingMetric()) }}</span>
              <span
                [ngClass]="store.rankingMetric() === 'conversion' ? 'text-emerald-700' : 'text-primary'"
                class="font-display text-3xl font-bold mt-0.5"
                dir="ltr">
                {{ getMetricValue(rep, store.rankingMetric()) }}
              </span>
            </div>

            <!-- Compact Chips for Other 3 Metrics -->
            <div class="grid grid-cols-3 gap-1 pt-2 border-t border-surface-container text-center">
              @for (m of getOtherMetrics(store.rankingMetric()); track m.key) {
                <div class="flex flex-col p-1.5 rounded-lg bg-surface-container-low/50">
                  <span class="font-label-sm text-[10px] text-outline truncate">{{ m.label }}</span>
                  <span class="font-code-sm text-[11px] font-semibold text-on-surface" dir="ltr">
                    {{ getMetricValue(rep, m.key) }}
                  </span>
                </div>
              }
            </div>

            <!-- Card Bottom Action -->
            <div class="mt-3 pt-2 text-center text-primary font-label-sm text-label-sm flex items-center justify-center gap-1 group-hover:underline">
              <span>عرض تفاصيل الأداء</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </div>
        }
      </div>

      <!-- FULL RANKED TABLE BELOW (RANK 4+) -->
      <div class="bg-surface-container-lowest rounded-xl p-space-md border border-surface-container shadow-sm flex flex-col gap-space-md">
        <!-- Filter Toolbar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-surface-container">
          <div>
            <h3 class="font-headline-md text-headline-md text-on-surface font-semibold">بقية أعضاء الفريق (المركز 4 فما فوق)</h3>
            <span class="font-body-sm text-body-sm text-on-surface-variant">الترتيب التفصيلي مع تركيز المؤشر النشط</span>
          </div>

          <!-- Department Filter -->
          <div class="flex items-center gap-2">
            <span class="font-label-sm text-label-sm text-outline">القسم:</span>
            <select
              [ngModel]="store.selectedDepartment()"
              (ngModelChange)="store.setSelectedDepartment($event)"
              class="h-9 px-3 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm border border-surface-container outline-none focus:ring-1 focus:ring-primary">
              <option value="all">جميع الأقسام</option>
              <option value="فريق المبيعات المباشرة">فريق المبيعات المباشرة</option>
              <option value="فريق التجديد وتطوير الحسابات">فريق التجديد وتطوير الحسابات</option>
              <option value="فريق الدعم الفني والمبيعات التكميلية">فريق الدعم الفني</option>
            </select>
          </div>
        </div>

        <!-- Table Container -->
        <div class="overflow-x-auto">
          <table class="w-full text-right border-collapse">
            <thead>
              <tr class="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm h-11">
                <th class="px-4 text-center w-14 rounded-r-lg">الترتيب</th>
                <th class="px-4">الموظف</th>
                <th class="px-4 text-center" [class.font-bold]="store.rankingMetric() === 'conversion'">
                  <div class="flex items-center justify-center gap-1" [class.text-emerald-700]="store.rankingMetric() === 'conversion'">
                    <span class="material-symbols-outlined text-[16px]">conversion_path</span>
                    <span>معدل التحويل</span>
                  </div>
                </th>
                <th class="px-4 text-center" [class.font-bold]="store.rankingMetric() === 'revenue'">
                  <div class="flex items-center justify-center gap-1" [class.text-indigo-700]="store.rankingMetric() === 'revenue'">
                    <span class="material-symbols-outlined text-[16px]">payments</span>
                    <span>الإيرادات</span>
                  </div>
                </th>
                <th class="px-4 text-center" [class.font-bold]="store.rankingMetric() === 'orders'">
                  <div class="flex items-center justify-center gap-1" [class.text-brand-700]="store.rankingMetric() === 'orders'">
                    <span class="material-symbols-outlined text-[16px]">shopping_bag</span>
                    <span>عدد الطلبات</span>
                  </div>
                </th>
                <th class="px-4 text-center" [class.font-bold]="store.rankingMetric() === 'customers'">
                  <div class="flex items-center justify-center gap-1" [class.text-purple-700]="store.rankingMetric() === 'customers'">
                    <span class="material-symbols-outlined text-[16px]">person_check</span>
                    <span>العملاء الفريدون</span>
                  </div>
                </th>
                <th class="px-4 text-center w-20 rounded-l-lg">إجراء</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-container">
              @for (emp of store.remainingRankedEmployees(); track emp.id; let idx = $index) {
                <tr
                  (click)="onRepClick(emp.id)"
                  class="hover:bg-surface-container-low/70 transition-colors group cursor-pointer">
                  <!-- Rank Number -->
                  <td class="py-3.5 px-4 text-center">
                    <span class="font-headline-sm text-headline-sm text-outline font-semibold">
                      {{ idx + 4 }}
                    </span>
                  </td>

                  <!-- Rep Identity -->
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-label-md font-semibold shrink-0">
                        {{ emp.initials }}
                      </div>
                      <div class="flex flex-col">
                        <div class="flex items-center gap-1.5">
                          <span class="font-headline-sm text-headline-sm text-on-surface font-semibold group-hover:text-primary transition-colors">
                            {{ emp.name }}
                          </span>
                          @if (emp.needsSupportAlert) {
                            <span class="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-label-sm text-[10px] font-semibold">
                              يحتاج دعم
                            </span>
                          }
                        </div>
                        <span class="font-body-sm text-body-sm text-on-surface-variant">{{ emp.role }} • {{ emp.department }}</span>
                      </div>
                    </div>
                  </td>

                  <!-- Conversion Metric -->
                  <td class="py-3.5 px-4 text-center">
                    <span
                      [ngClass]="store.rankingMetric() === 'conversion'
                        ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-400 font-bold scale-105'
                        : 'bg-surface-container text-on-surface-variant'"
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-sm text-label-sm">
                      <span dir="ltr">{{ emp.conversionRateFormatted }}</span>
                    </span>
                  </td>

                  <!-- Revenue Metric -->
                  <td class="py-3.5 px-4 text-center">
                    <span
                      [ngClass]="store.rankingMetric() === 'revenue' ? 'text-primary font-bold' : 'text-on-surface-variant'"
                      class="font-headline-sm text-headline-sm"
                      dir="ltr">
                      {{ emp.revenueFormatted }}
                    </span>
                  </td>

                  <!-- Orders Metric -->
                  <td class="py-3.5 px-4 text-center">
                    <span
                      [ngClass]="store.rankingMetric() === 'orders' ? 'text-brand-600 font-bold' : 'text-on-surface-variant'"
                      class="font-body-md text-body-md">
                      {{ emp.orderCountLabel }}
                    </span>
                  </td>

                  <!-- Customers Metric -->
                  <td class="py-3.5 px-4 text-center">
                    <span
                      [ngClass]="store.rankingMetric() === 'customers' ? 'text-purple-700 font-bold' : 'text-on-surface-variant'"
                      class="font-body-md text-body-md">
                      {{ emp.uniqueCustomersLabel }}
                    </span>
                  </td>

                  <!-- Action Arrow -->
                  <td class="py-3.5 px-4 text-center">
                    <button
                      type="button"
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
    </div>
  `
})
export class TeamLeaderboard {
  readonly store = inject(PerformanceStore);
  private router = inject(Router);

  onRepClick(empId: string): void {
    this.router.navigate(['/performance/reps', empId]);
  }

  onMetricChange(metric: string): void {
    this.store.setRankingMetric(metric as CoreMetricType);
  }

  getMetricLabel(metric: CoreMetricType): string {
    switch (metric) {
      case 'conversion': return 'معدل التحويل (الأساسي)';
      case 'revenue': return 'إجمالي الإيرادات';
      case 'orders': return 'عدد الطلبات';
      case 'customers': return 'العملاء الفريدون';
    }
  }

  getMetricValue(emp: EmployeePerformance, metric: CoreMetricType): string {
    switch (metric) {
      case 'conversion': return emp.conversionRateFormatted;
      case 'revenue': return emp.revenueFormatted;
      case 'orders': return `${emp.orderCount} طلب`;
      case 'customers': return `${emp.uniqueCustomers} عميل`;
    }
  }

  getOtherMetrics(active: CoreMetricType): { key: CoreMetricType; label: string }[] {
    const all: { key: CoreMetricType; label: string }[] = [
      { key: 'conversion', label: 'التحويل' },
      { key: 'revenue', label: 'الإيراد' },
      { key: 'orders', label: 'الطلبات' },
      { key: 'customers', label: 'العملاء' }
    ];
    return all.filter(m => m.key !== active);
  }
}

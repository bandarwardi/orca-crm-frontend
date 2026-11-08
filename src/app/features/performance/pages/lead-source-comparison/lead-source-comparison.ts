import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PerformanceStore } from '../../store/performance.store';
import { ChartPoint, PerformanceTrendChart } from '../../components/performance-trend-chart/performance-trend-chart';

@Component({
  selector: 'app-lead-source-comparison',
  standalone: true,
  host: { class: 'block w-full' },
  imports: [CommonModule, RouterLink, RouterLinkActive, PerformanceTrendChart],
  template: `
    <div class="flex flex-col w-full gap-space-lg" dir="rtl">
      <!-- HEADER SECTION -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div class="flex flex-col sm:flex-row sm:items-center gap-space-md">
          <div class="flex flex-col gap-0.5">
            <div class="flex items-center gap-space-xs">
              <span class="material-symbols-outlined text-primary text-[26px]">hub</span>
              <h2 class="font-headline-lg text-headline-lg text-on-surface font-bold">مقارنة وتحليل قنوات الاستقطاب</h2>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant pr-1">
              تقييم فاعلية التحول من الاتصال البارد إلى القنوات الواردة (واتساب، الإحالات، الموقع)
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
      </div>

      <!-- HIGHLIGHT CALLOUT: BEST-PERFORMING CHANNEL (EMERALD ACCENT) -->
      @if (store.bestPerformingChannel(); as best) {
        <div class="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-surface-container-lowest border-2 border-emerald-500/30 rounded-2xl p-space-md lg:p-space-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md relative overflow-hidden">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <span class="material-symbols-outlined text-[32px]">{{ best.icon }}</span>
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  القناة الأعلى كفاءة وتحويلاً 🚀
                </span>
                <span class="text-outline text-label-sm">• نسبة الحصة: {{ best.marketSharePercentage }}%</span>
              </div>
              <h3 class="font-headline-lg text-headline-lg text-emerald-950 font-bold mt-1">
                {{ best.sourceLabel }}
              </h3>
              <p class="font-body-md text-body-md text-emerald-800/90 mt-1 max-w-2xl">
                تحقق أعلى معدل تحويل على مستوى المنظومة بفضل رغبة العميل المسبقة وسرعة الاستجابة، مع متوسط قيمة صفقة ممتازة ({{ best.avgDealValueFormatted }}).
              </p>
            </div>
          </div>

          <!-- Highlight Metric Badges -->
          <div class="flex items-center gap-4 bg-surface-container-lowest/90 backdrop-blur-xs p-space-sm rounded-xl border border-emerald-200 self-start md:self-auto shadow-xs">
            <div class="flex flex-col text-center px-3">
              <span class="font-label-sm text-[11px] text-on-surface-variant">معدل التحويل</span>
              <span class="font-display text-3xl font-bold text-emerald-700" dir="ltr">{{ best.conversionRateFormatted }}</span>
              <span class="font-code-sm text-[11px] text-emerald-600 font-semibold">{{ best.trendChange }}</span>
            </div>
            <div class="h-12 w-px bg-surface-container"></div>
            <div class="flex flex-col text-center px-3">
              <span class="font-label-sm text-[11px] text-on-surface-variant">إجمالي الإيرادات</span>
              <span class="font-display text-2xl font-bold text-on-surface" dir="ltr">{{ best.totalRevenueFormatted }}</span>
              <span class="font-body-sm text-[11px] text-outline">{{ best.leadsConverted }} عميل محول</span>
            </div>
          </div>
        </div>
      }

      <!-- ROW 2: BAR CHART (CONVERSION BY CHANNEL) & SHIFT OVER TIME CHART -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
        <!-- BAR CHART: Conversion Rate by Channel (Sorted Descending) -->
        <div class="bg-surface-container-lowest rounded-xl p-space-md border border-surface-container shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between pb-space-sm border-b border-surface-container mb-space-sm">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[22px]">bar_chart</span>
              <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">معدل التحويل حسب القناة (تنازلياً)</h3>
            </div>
            <span class="font-label-sm text-label-sm text-outline">مرتبة حسب الكفاءة</span>
          </div>

          <!-- Horizontal Bars -->
          <div class="flex flex-col gap-4 py-2">
            @for (ch of sortedSources(); track ch.sourceType) {
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between font-label-md text-label-md">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px] text-on-surface-variant">{{ ch.icon }}</span>
                    <span class="text-on-surface font-semibold">{{ ch.sourceLabel }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-emerald-700 font-headline-sm" dir="ltr">{{ ch.conversionRateFormatted }}</span>
                    <span class="text-outline text-body-sm text-[11px]">({{ ch.leadsConverted }} / {{ ch.leadsReceived }})</span>
                  </div>
                </div>

                <div class="w-full bg-surface-container-low h-3 rounded-full overflow-hidden relative">
                  <div
                    [style.width.%]="ch.conversionRate"
                    [ngClass]="ch.conversionRate >= 45
                      ? 'bg-emerald-600'
                      : ch.conversionRate >= 35
                        ? 'bg-primary'
                        : ch.conversionRate >= 25
                          ? 'bg-surface-tint'
                          : 'bg-rose-500'"
                    class="h-full rounded-full transition-all duration-700"></div>
                </div>
              </div>
            }
          </div>

          <div class="pt-2 border-t border-surface-container flex items-center justify-between text-body-sm text-[11px] text-outline">
            <span>القنوات الواردة تسجل كفاءة تعادل 2.9 ضعف الاتصال البارد</span>
            <span class="text-secondary font-semibold">متوسط المنظومة: 38.4%</span>
          </div>
        </div>

        <!-- TREND-OVER-TIME CHART: Cold Calling Declining vs Inbound Rising -->
        <app-performance-trend-chart
          title="تحول الاستقطاب: صعود القنوات الواردة وتراجع الاتصال البارد"
          subtitle="تغير حصة التحويلات خلال آخر 6 أشهر (واتساب المباشر مقابل الاتصال البارد)"
          icon="compare_arrows"
          [points]="shiftTrendPoints"
          valueSuffix="%"
          primaryLabel="حصة واتساب الوارد (%)"
          secondaryLabel="حصة الاتصال البارد (%)"
        />
      </div>

      <!-- ROW 3: COMPLETE COMPANY-WIDE BREAKDOWN TABLE -->
      <div class="bg-surface-container-lowest rounded-xl p-space-md border border-surface-container shadow-sm flex flex-col gap-space-md">
        <div class="flex items-center justify-between pb-space-sm border-b border-surface-container">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[22px]">table_rows</span>
            <h3 class="font-headline-md text-headline-md text-on-surface font-semibold">الجدول المقارن الشامل لمصادر العملاء</h3>
          </div>
          <span class="font-label-sm text-label-sm text-outline">مؤشرات الإيرادات ومتوسط الصفقات</span>
        </div>

        <!-- Table Container -->
        <div class="overflow-x-auto">
          <table class="w-full text-right border-collapse">
            <thead>
              <tr class="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm h-11">
                <th class="px-4 rounded-r-lg">القناة / المصدر</th>
                <th class="px-4 text-center">العملاء المستلمون</th>
                <th class="px-4 text-center">العملاء المحولون</th>
                <th class="px-4 text-center font-bold text-emerald-800">معدل التحويل (الأساسي)</th>
                <th class="px-4 text-center">متوسط قيمة الصفقة</th>
                <th class="px-4 text-center">إجمالي الإيرادات</th>
                <th class="px-4 text-center w-28 rounded-l-lg">اتجاه النمو</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-container">
              @for (source of sortedSources(); track source.sourceType) {
                <tr class="hover:bg-surface-container-low/60 transition-colors">
                  <!-- Channel Info -->
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                        <span class="material-symbols-outlined text-[18px]">{{ source.icon }}</span>
                      </div>
                      <div class="flex flex-col">
                        <span class="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          {{ source.sourceLabel }}
                        </span>
                        <span class="text-body-sm text-[11px] text-outline">حصة السوق: {{ source.marketSharePercentage }}%</span>
                      </div>
                    </div>
                  </td>

                  <!-- Leads Received -->
                  <td class="py-3.5 px-4 text-center font-body-md text-body-md text-on-surface-variant">
                    {{ source.leadsReceived }} عميل
                  </td>

                  <!-- Leads Converted -->
                  <td class="py-3.5 px-4 text-center font-body-md text-body-md text-on-surface font-semibold">
                    {{ source.leadsConverted }} عميل
                  </td>

                  <!-- Conversion Rate (Highlighted) -->
                  <td class="py-3.5 px-4 text-center">
                    <span
                      [ngClass]="source.conversionRate >= 45
                        ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300 font-bold'
                        : source.conversionRate >= 30
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'bg-rose-50 text-rose-700 font-medium'"
                      class="inline-flex items-center gap-1 px-3 py-1 rounded-full font-label-md text-label-md"
                      dir="ltr">
                      {{ source.conversionRateFormatted }}
                    </span>
                  </td>

                  <!-- Avg Deal Value -->
                  <td class="py-3.5 px-4 text-center font-headline-sm text-headline-sm text-on-surface" dir="ltr">
                    {{ source.avgDealValueFormatted }}
                  </td>

                  <!-- Total Revenue -->
                  <td class="py-3.5 px-4 text-center font-headline-sm text-headline-sm text-primary font-bold" dir="ltr">
                    {{ source.totalRevenueFormatted }}
                  </td>

                  <!-- Trend Change -->
                  <td class="py-3.5 px-4 text-center">
                    <span
                      [ngClass]="source.trendDirection === 'up' ? 'text-secondary' : 'text-error'"
                      class="inline-flex items-center gap-0.5 font-label-sm text-[11px] font-semibold">
                      <span class="material-symbols-outlined text-[15px]">
                        {{ source.trendDirection === 'up' ? 'trending_up' : 'trending_down' }}
                      </span>
                      <span>{{ source.trendChange }}</span>
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- ROW 4: ACTIONABLE INSIGHT CHIPS -->
      <div class="flex flex-col gap-2">
        <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[20px]">lightbulb</span>
          <span>توصيات إجرائية ذكية لإدارة المبيعات والتسويق</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
          @for (insight of store.actionableInsights(); track insight.id) {
            <div
              [ngClass]="insight.type === 'opportunity'
                ? 'bg-emerald-50/70 border-emerald-300'
                : insight.type === 'warning'
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-blue-50/70 border-blue-300'"
              class="rounded-xl p-space-sm border shadow-xs flex items-start gap-3">
              <div
                [ngClass]="insight.type === 'opportunity'
                  ? 'bg-emerald-100 text-emerald-800'
                  : insight.type === 'warning'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'"
                class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[20px]">{{ insight.icon }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span
                  [ngClass]="insight.type === 'opportunity'
                    ? 'text-emerald-800'
                    : insight.type === 'warning'
                      ? 'text-amber-800'
                      : 'text-blue-800'"
                  class="font-label-sm text-[11px] font-bold">
                  {{ insight.badge }}
                </span>
                <p class="font-body-sm text-body-sm text-on-surface leading-snug">
                  {{ insight.text }}
                </p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class LeadSourceComparison {
  readonly store = inject(PerformanceStore);

  sortedSources = computed(() => {
    return [...this.store.companyLeadSources()].sort((a, b) => b.conversionRate - a.conversionRate);
  });

  readonly shiftTrendPoints: ChartPoint[] = [
    { label: 'مارس', value: 18, secondaryValue: 58 },
    { label: 'أبريل', value: 24, secondaryValue: 50 },
    { label: 'مايو', value: 31, secondaryValue: 42 },
    { label: 'يونيو', value: 39, secondaryValue: 32 },
    { label: 'يوليو', value: 46, secondaryValue: 24 },
    { label: 'أغسطس', value: 52, secondaryValue: 18 }
  ];
}

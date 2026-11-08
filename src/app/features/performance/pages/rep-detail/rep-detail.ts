import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PerformanceStore } from '../../store/performance.store';
import { KpiCard } from '../../../../shared/components/kpi-card/kpi-card';
import { ChartPoint, PerformanceTrendChart } from '../../components/performance-trend-chart/performance-trend-chart';

@Component({
  selector: 'app-rep-detail',
  standalone: true,
  host: { class: 'block w-full' },
  imports: [CommonModule, KpiCard, PerformanceTrendChart],
  template: `
    @if (rep(); as employee) {
      <div class="flex flex-col w-full gap-space-lg">
        <!-- Navigation Back Bar & Breadcrumb -->
        <div class="flex items-center justify-between">
          <button
            type="button"
            (click)="goBack()"
            class="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface font-label-md text-label-md px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all">
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            <span>العودة للترتيب العام</span>
          </button>

          <span class="font-code-sm text-label-sm text-outline">
            معرف الموظف: {{ employee.id }}
          </span>
        </div>

        <!-- HERO HEADER: Rep Profile & Conversion Hero -->
        <div class="bg-surface-container-lowest rounded-xl p-space-md lg:p-space-lg border border-surface-container shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <!-- Profile Info -->
          <div class="flex items-start sm:items-center gap-space-md">
            @if (employee.avatarUrl) {
              <div class="w-16 h-16 rounded-full overflow-hidden shrink-0 shadow-md border-2 border-surface-container ring-2 ring-primary/20">
                <img [src]="employee.avatarUrl" [alt]="employee.name" class="w-full h-full object-cover" />
              </div>
            } @else {
              <div class="w-16 h-16 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300 flex items-center justify-center font-headline-md font-bold text-xl shrink-0 shadow-md">
                {{ employee.initials }}
              </div>
            }

            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <h1 class="font-headline-lg text-headline-lg text-on-surface font-bold">{{ employee.name }}</h1>
                @if (employee.isTopPerformer) {
                  <span class="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-label-sm text-label-sm font-semibold ring-1 ring-amber-300 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[15px]" style="font-variation-settings: 'FILL' 1;">emoji_events</span>
                    <span>المتصدر</span>
                  </span>
                }
              </div>

              <div class="flex flex-wrap items-center gap-3 text-on-surface-variant font-label-md text-label-md">
                <span>{{ employee.role }}</span>
                <span>•</span>
                <span class="text-primary font-medium">{{ employee.department }}</span>
                <span>•</span>
                <span class="text-outline">مدة الخدمة: {{ employee.tenureLabel }}</span>
              </div>
            </div>
          </div>

          <!-- Conversion Hero Block & Context Tag -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-surface-container-low/70 p-space-sm rounded-xl border border-surface-container">
            <div class="flex flex-col">
              <span class="font-label-sm text-label-sm text-on-surface-variant">معدل التحويل (المعيار الأساسي)</span>
              <div class="flex items-baseline gap-2">
                <span class="font-display text-4xl text-emerald-600 font-bold" dir="ltr">
                  {{ employee.conversionRateFormatted }}
                </span>
                <span
                  [ngClass]="employee.conversionTrendDirection === 'up' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'"
                  class="font-label-sm text-[12px] px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-0.5">
                  <span class="material-symbols-outlined text-[14px]">
                    {{ employee.conversionTrendDirection === 'up' ? 'trending_up' : 'trending_down' }}
                  </span>
                  <span>{{ employee.conversionTrend }}</span>
                </span>
              </div>
            </div>

            <div class="h-10 w-px bg-surface-container hidden sm:block"></div>

            <!-- Dominant Lead Source Context Tag (Prevents unfair judgment) -->
            <div class="flex flex-col">
              <span class="font-label-sm text-label-sm text-outline">سياق جودة العملاء</span>
              <div class="inline-flex items-center gap-1.5 mt-0.5 px-2.5 py-1 rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface font-label-md text-label-md">
                <span class="material-symbols-outlined text-[16px] text-primary">pie_chart</span>
                <span>المصدر الأبرز: <strong>{{ employee.dominantSource }} ({{ employee.dominantSourcePercentage }}%)</strong></span>
              </div>
            </div>
          </div>
        </div>

        <!-- CONDITIONAL AMBER ALERT: New Rep Needing Support (< 60 days & Low Conversion) -->
        @if (employee.needsSupportAlert) {
          <div class="bg-amber-50/80 border-2 border-amber-300 rounded-xl p-space-md shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[24px]">school</span>
              </div>
              <div class="flex flex-col">
                <h3 class="font-headline-sm text-headline-sm text-amber-900 font-bold">
                  تنبيه متابعة وتأهيل: الموظف قد يحتاج دعم أو تدريب إضافي
                </h3>
                <p class="font-body-md text-body-md text-amber-800 mt-0.5">
                  {{ employee.supportAlertReason }}
                </p>
                <div class="flex items-center gap-2 mt-2 text-label-sm text-amber-900">
                  <span class="font-bold">الملاحظة التشغيلية:</span>
                  <span>انخفاض النسبة ناتج جزئياً عن تولي مكالمات "الاتصال البارد" الصعبة بنسبة 74% بالتزامن مع فترة التجربة.</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              (click)="onScheduleTraining(employee.id)"
              class="h-10 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm transition-all whitespace-nowrap self-start md:self-auto">
              <span class="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>جدولة جلسة تدريب ودعم</span>
            </button>
          </div>
        }

        <!-- 4 SCOPED METRICS CARDS FOR THIS REP -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md lg:gap-space-lg">
          <!-- 1. معدل التحويل -->
          <div class="relative group">
            <app-kpi-card
              title="معدل التحويل الفردي"
              [value]="employee.conversionRateFormatted"
              [trend]="employee.conversionTrend"
              [trendDirection]="employee.conversionTrendDirection"
              icon="conversion_path"
              variant="default"
              subLabel="مقارنة بمتوسط الفريق (38.4%)"
            />
            <div class="absolute top-2.5 start-2.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold ring-1 ring-emerald-300">
              المعيار الأول
            </div>
          </div>

          <!-- 2. الإيرادات -->
          <app-kpi-card
            title="الإيرادات المحققة"
            [value]="employee.revenueFormatted"
            trend="+12%"
            trendDirection="up"
            icon="payments"
            variant="revenue"
            subLabel="من إجمالي مبيعات الفريق"
          />

          <!-- 3. عدد الطلبات -->
          <app-kpi-card
            title="عدد الطلبات المنفذة"
            [value]="employee.orderCount + ' طلب'"
            trend="طلب منجز"
            trendDirection="up"
            icon="shopping_bag"
            variant="today-orders"
            subLabel="خلال الفترة المحددة"
          />

          <!-- 4. العملاء الفريدون -->
          <app-kpi-card
            title="العملاء الفريدون"
            [value]="employee.uniqueCustomers + ' عميل'"
            trend="حساب جديد"
            trendDirection="up"
            icon="group"
            variant="active-leads"
            subLabel="قاعدة المشتركين المكتسبة"
          />
        </div>

        <!-- TREND CHART WITH WEEKLY / MONTHLY TOGGLE -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between pb-1">
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">تطور أداء الموظف عبر الزمن</h3>
            <div class="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
              <button
                type="button"
                (click)="trendPeriod.set('weekly')"
                [ngClass]="trendPeriod() === 'weekly'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'"
                class="px-3 py-1 rounded font-label-sm text-label-sm transition-all">
                أسبوعي
              </button>
              <button
                type="button"
                (click)="trendPeriod.set('monthly')"
                [ngClass]="trendPeriod() === 'monthly'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'"
                class="px-3 py-1 rounded font-label-sm text-label-sm transition-all">
                شهري
              </button>
            </div>
          </div>

          <app-performance-trend-chart
            [title]="'مؤشر التحويل (' + (trendPeriod() === 'weekly' ? 'أسبوعياً' : 'شهرياً') + ')'"
            subtitle="متابعة نسبة التحويل والطلبات المنفذة للموظف"
            icon="insights"
            [points]="currentTrendPoints()"
            valueSuffix="%"
            primaryLabel="معدل التحويل (%)"
            secondaryLabel="عدد الطلبات"
          />
        </div>

        <!-- LEAD SOURCE BREAKDOWN TABLE FOR THIS REP -->
        <div class="bg-surface-container-lowest rounded-xl p-space-md border border-surface-container shadow-sm flex flex-col gap-space-md">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-space-sm border-b border-surface-container">
            <div>
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[22px]">alt_route</span>
                <h3 class="font-headline-md text-headline-md text-on-surface font-semibold">تحليل مصادر العملاء للموظف</h3>
              </div>
              <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                تحديد أداء الموظف حسب كل قناة لتشخيص هل ضعف التحويل سببه مهارة الموظف أم جودة القناة
              </p>
            </div>
            <span class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface">
              إجمالي العملاء المستلمين: {{ getTotalLeads(employee) }}
            </span>
          </div>

          <!-- Table Container -->
          <div class="overflow-x-auto">
            <table class="w-full text-right border-collapse">
              <thead>
                <tr class="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm h-11">
                  <th class="px-4 rounded-r-lg">القناة / المصدر</th>
                  <th class="px-4 text-center">العملاء المستلمون</th>
                  <th class="px-4 text-center">العملاء المحولون</th>
                  <th class="px-4 text-center">معدل التحويل</th>
                  <th class="px-4 text-center">الإيرادات الناتجة</th>
                  <th class="px-4 text-center w-28 rounded-l-lg">مستوى الأداء</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-container">
                @for (src of employee.sourcesBreakdown; track src.sourceType) {
                  <tr class="hover:bg-surface-container-low/50 transition-colors">
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                          <span class="material-symbols-outlined text-[18px]">{{ src.icon }}</span>
                        </div>
                        <span class="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          {{ src.sourceLabel }}
                        </span>
                      </div>
                    </td>

                    <td class="py-3.5 px-4 text-center font-body-md text-body-md text-on-surface-variant">
                      {{ src.leadsReceived }} عميل
                    </td>

                    <td class="py-3.5 px-4 text-center font-body-md text-body-md text-on-surface font-semibold">
                      {{ src.leadsConverted }} عميل
                    </td>

                    <!-- Conversion Rate with Progress Bar -->
                    <td class="py-3.5 px-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <span
                          [ngClass]="src.conversionRate >= 40
                            ? 'text-emerald-700 font-bold'
                            : src.conversionRate >= 25
                              ? 'text-brand-700'
                              : 'text-amber-700 font-medium'"
                          class="font-headline-sm text-headline-sm min-w-[50px]"
                          dir="ltr">
                          {{ src.conversionRateFormatted }}
                        </span>
                        <div class="w-20 bg-surface-container-low h-2 rounded-full overflow-hidden hidden sm:block">
                          <div
                            [style.width.%]="src.conversionRate"
                            [ngClass]="src.conversionRate >= 40
                              ? 'bg-emerald-500'
                              : src.conversionRate >= 25
                                ? 'bg-brand-500'
                                : 'bg-amber-500'"
                            class="h-full rounded-full"></div>
                        </div>
                      </div>
                    </td>

                    <td class="py-3.5 px-4 text-center font-headline-sm text-headline-sm text-primary font-bold" dir="ltr">
                      {{ src.revenueFormatted }}
                    </td>

                    <td class="py-3.5 px-4 text-center">
                      @if (src.conversionRate >= 45) {
                        <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                          ممتاز
                        </span>
                      } @else if (src.conversionRate >= 30) {
                        <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium">
                          جيد
                        </span>
                      } @else {
                        <span class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-medium">
                          قناة صعبة
                        </span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    } @else {
      <!-- Not Found State -->
      <div class="bg-surface-container-lowest rounded-xl p-space-xl border border-surface-container text-center flex flex-col items-center gap-space-md">
        <span class="material-symbols-outlined text-[48px] text-outline">person_off</span>
        <h2 class="font-headline-md text-headline-md text-on-surface">لم يتم العثور على الموظف</h2>
        <p class="font-body-md text-body-md text-on-surface-variant">الموظف المطلوب غير موجود أو تم تغيير معرفه.</p>
        <button
          type="button"
          (click)="goBack()"
          class="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md">
          العودة للوحة الأداء
        </button>
      </div>
    }
  `
})
export class RepDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly store = inject(PerformanceStore);

  trendPeriod = signal<'weekly' | 'monthly'>('weekly');

  rep = computed(() => {
    const id = this.route.snapshot.paramMap.get('repId') || this.store.selectedEmployeeId();
    return this.store.employees().find(e => e.id === id) || this.store.employees()[0];
  });

  currentTrendPoints = computed<ChartPoint[]>(() => {
    const r = this.rep();
    if (!r) return [];
    const source = this.trendPeriod() === 'weekly' ? r.trendWeekly : r.trendMonthly;
    return source.map(pt => ({
      label: pt.label,
      value: pt.conversionRate,
      secondaryValue: pt.orders
    }));
  });

  goBack(): void {
    this.router.navigate(['/performance']);
  }

  getTotalLeads(emp: any): number {
    return emp.sourcesBreakdown?.reduce((acc: number, s: any) => acc + s.leadsReceived, 0) || 0;
  }

  onScheduleTraining(empId: string): void {
    this.store.scheduleTrainingSession(empId);
    alert(`تم جدولة جلسة تدريب ودعم مهني للموظف بنجاح.`);
  }
}

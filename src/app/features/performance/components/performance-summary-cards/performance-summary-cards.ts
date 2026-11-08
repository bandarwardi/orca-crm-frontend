import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCard } from '../../../../shared/components/kpi-card/kpi-card';
import { SummaryMetric } from '../../models/performance.models';

@Component({
  selector: 'app-performance-summary-cards',
  standalone: true,
  imports: [CommonModule, KpiCard],
  template: `
    <!-- 4 Team-wide Aggregate KPI Cards (Revenue as Visual Anchor with Gradient, Conversion Rate as Hero) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md lg:gap-space-lg">
      <!-- 1. معدل التحويل (Primary Fairness Metric - Highlighted Hero Card) -->
      @if (conversionMetric(); as m) {
        <div class="relative group">
          <app-kpi-card
            [title]="m.title"
            [value]="m.value"
            [trend]="m.trend"
            [trendDirection]="m.trendDirection"
            [icon]="m.icon || 'conversion_path'"
            variant="default"
            [subLabel]="m.subLabel"
          />
          <div class="absolute top-2.5 start-2.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold ring-1 ring-emerald-300">
            المعيار الأول
          </div>
        </div>
      }

      <!-- 2. إجمالي الإيرادات (Visual Anchor with Deep Indigo Gradient) -->
      @if (revenueMetric(); as m) {
        <app-kpi-card
          [title]="m.title"
          [value]="m.value"
          [trend]="m.trend"
          [trendDirection]="m.trendDirection"
          [icon]="m.icon || 'payments'"
          variant="revenue"
          [subLabel]="m.subLabel"
        />
      }

      <!-- 3. عدد الطلبات -->
      @if (ordersMetric(); as m) {
        <app-kpi-card
          [title]="m.title"
          [value]="m.value"
          [trend]="m.trend"
          [trendDirection]="m.trendDirection"
          [icon]="m.icon || 'shopping_bag'"
          variant="today-orders"
          [subLabel]="m.subLabel"
        />
      }

      <!-- 4. العملاء الفريدون -->
      @if (customersMetric(); as m) {
        <app-kpi-card
          [title]="m.title"
          [value]="m.value"
          [trend]="m.trend"
          [trendDirection]="m.trendDirection"
          [icon]="m.icon || 'group'"
          variant="active-leads"
          [subLabel]="m.subLabel"
        />
      }
    </div>
  `
})
export class PerformanceSummaryCards {
  metrics = input<SummaryMetric[]>([]);

  conversionMetric = computed<SummaryMetric>(() => 
    this.metrics().find(m => m.metricType === 'conversion') ?? {
      title: 'معدل التحويل (المعيار الأساسي)',
      value: '0%',
      icon: 'conversion_path',
      trend: '0%',
      trendDirection: 'up',
      subLabel: 'المعيار الأكثر عدالة (مستلم → محول)',
      metricType: 'conversion'
    }
  );

  revenueMetric = computed<SummaryMetric>(() => 
    this.metrics().find(m => m.metricType === 'revenue') ?? {
      title: 'إجمالي الإيرادات',
      value: '$0',
      icon: 'payments',
      trend: '0%',
      trendDirection: 'up',
      subLabel: 'متوسط قيمة الطلب: $0',
      metricType: 'revenue'
    }
  );

  ordersMetric = computed<SummaryMetric>(() => 
    this.metrics().find(m => m.metricType === 'orders') ?? {
      title: 'عدد الطلبات',
      value: '0',
      icon: 'shopping_bag',
      trend: '0%',
      trendDirection: 'up',
      subLabel: 'الطلبات المنفذة',
      metricType: 'orders'
    }
  );

  customersMetric = computed<SummaryMetric>(() => 
    this.metrics().find(m => m.metricType === 'customers') ?? {
      title: 'العملاء الفريدون',
      value: '0',
      icon: 'group',
      trend: '0%',
      trendDirection: 'up',
      subLabel: 'عملاء أصحاب اشتراكات',
      metricType: 'customers'
    }
  );
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerformanceStore } from '../../store/performance.store';
import { PerformanceHeader } from '../../components/performance-header/performance-header';
import { PerformanceSummaryCards } from '../../components/performance-summary-cards/performance-summary-cards';
import { LeaderboardPanel } from '../../components/leaderboard-panel/leaderboard-panel';
import { PackageBreakdown } from '../../components/package-breakdown/package-breakdown';
import { QualityKpis } from '../../components/quality-kpis/quality-kpis';
import { ChartPoint, PerformanceTrendChart } from '../../components/performance-trend-chart/performance-trend-chart';

@Component({
  selector: 'app-performance-dashboard',
  standalone: true,
  host: { class: 'block w-full' },
  imports: [
    CommonModule,
    PerformanceHeader,
    PerformanceSummaryCards,
    LeaderboardPanel,
    PackageBreakdown,
    QualityKpis,
    PerformanceTrendChart
  ],
  template: `
    <div class="flex flex-col w-full gap-space-lg">
      <!-- Controls & Date Range -->
      <app-performance-header
        [activeRange]="store.dateRange()"
        (rangeChange)="store.setDateRange($event)"
        (exportReport)="handleExport()"
      />

      <!-- Top Row: 4 Team-wide Aggregate KPI Cards -->
      <app-performance-summary-cards
        [metrics]="store.summaryMetrics()"
      />

      <!-- Trend Chart Row: Team Conversion Rate vs Orders Trend -->
      <app-performance-trend-chart
        title="مؤشر تحويل الفريق والطلبات الأسبوعية"
        subtitle="متابعة تصاعد معدل التحويل الأسبوعي مع وتيرة تنفيذ الطلبات"
        icon="trending_up"
        [points]="store.teamTrendPoints()"
        valueSuffix="%"
        primaryLabel="معدل التحويل (%)"
        secondaryLabel="الطلبات"
      />

      <!-- Main Unified View & Side Panels -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        <!-- Main Unified View: Leaderboard Widget (Span 2 cols on lg) -->
        <div class="lg:col-span-2">
          <app-leaderboard-panel
            [viewMode]="store.viewMode()"
            [searchQuery]="store.searchQuery()"
            [sortBy]="store.sortBy()"
            [activeSort]="store.sortBy()"
            [chartMetric]="store.chartMetric()"
            [employees]="store.filteredAndSortedEmployees()"
            (viewModeChange)="store.setViewMode($event)"
            (searchChange)="store.setSearchQuery($event)"
            (sortChange)="store.setSortBy($event)"
            (chartMetricChange)="store.setChartMetric($event)"
          />
        </div>

        <!-- Side Complementary Panels (Span 1 col on lg) -->
        <div class="flex flex-col gap-space-md">
          <app-package-breakdown
            [packages]="store.packageSales()"
          />

          <app-quality-kpis
            [kpis]="store.qualityKpis()"
          />
        </div>
      </div>
    </div>
  `
})
export class PerformanceDashboard implements OnInit {
  readonly store = inject(PerformanceStore);

  ngOnInit() {
    this.store.loadPerformanceData();
  }

  handleExport(): void {
    console.info('Exporting performance report...');
  }
}

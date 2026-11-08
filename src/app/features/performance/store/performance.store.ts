import { computed, inject } from '@angular/core';
import { PerformanceApiService } from '../../../core/services/api/performance-api.service';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {
  ActionableInsight,
  ChannelTrendPoint,
  ChartMetric,
  CoreMetricType,
  DateRangeFilter,
  EmployeePerformance,
  LeadSourceCompanyMetric,
  PackageSaleBreakdown,
  QualityKpiItem,
  SortOption,
  SummaryMetric,
  ViewMode
} from '../models/performance.models';

export interface PerformanceState {
  dateRange: DateRangeFilter;
  viewMode: ViewMode;
  searchQuery: string;
  sortBy: SortOption;
  rankingMetric: CoreMetricType;
  chartMetric: ChartMetric;
  selectedDepartment: string;
  summaryMetrics: SummaryMetric[];
  employees: EmployeePerformance[];
  companyLeadSources: LeadSourceCompanyMetric[];
  channelTrendPoints: ChannelTrendPoint[];
  actionableInsights: ActionableInsight[];
  packageSales: PackageSaleBreakdown[];
  qualityKpis: QualityKpiItem[];
  teamTrendPoints: { label: string; value: number; secondaryValue?: number }[];
  selectedEmployeeId: string | null;
  isLoading: boolean;
}

const initialEmployees: EmployeePerformance[] = [];

const initialSummaryMetrics: SummaryMetric[] = [];

const initialCompanyLeadSources: LeadSourceCompanyMetric[] = [];

const initialChannelTrends: ChannelTrendPoint[] = [];

const initialActionableInsights: ActionableInsight[] = [];

const initialPackageSales: PackageSaleBreakdown[] = [];

const initialQualityKpis: QualityKpiItem[] = [];

const initialState: PerformanceState = {
  dateRange: 'this_month',
  viewMode: 'table',
  searchQuery: '',
  sortBy: 'conversion',
  rankingMetric: 'conversion',
  chartMetric: 'conversion',
  selectedDepartment: 'all',
  summaryMetrics: initialSummaryMetrics,
  employees: initialEmployees,
  companyLeadSources: initialCompanyLeadSources,
  channelTrendPoints: initialChannelTrends,
  actionableInsights: initialActionableInsights,
  packageSales: initialPackageSales,
  qualityKpis: initialQualityKpis,
  teamTrendPoints: [],
  selectedEmployeeId: null,
  isLoading: false
};

export const PerformanceStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ employees, searchQuery, sortBy, rankingMetric, selectedDepartment, companyLeadSources }) => ({
    // Filter and sort for general leaderboard / overview
    filteredAndSortedEmployees: computed(() => {
      let list = [...employees()];
      const q = searchQuery().trim().toLowerCase();
      const dep = selectedDepartment();

      if (dep !== 'all') {
        list = list.filter(emp => emp.department === dep);
      }

      if (q) {
        list = list.filter(emp =>
          emp.name.toLowerCase().includes(q) ||
          emp.role.toLowerCase().includes(q)
        );
      }

      const activeSort = sortBy() || rankingMetric();
      list.sort((a, b) => {
        switch (activeSort) {
          case 'conversion':
            return b.conversionRate - a.conversionRate;
          case 'revenue':
            return b.revenue - a.revenue;
          case 'orders':
            return b.orderCount - a.orderCount;
          case 'customers':
            return b.uniqueCustomers - a.uniqueCustomers;
          default:
            return b.conversionRate - a.conversionRate;
        }
      });

      return list;
    }),

    // Top 3 Podium
    podiumEmployees: computed(() => {
      let list = [...employees()];
      const activeSort = rankingMetric();
      list.sort((a, b) => {
        switch (activeSort) {
          case 'conversion':
            return b.conversionRate - a.conversionRate;
          case 'revenue':
            return b.revenue - a.revenue;
          case 'orders':
            return b.orderCount - a.orderCount;
          case 'customers':
            return b.uniqueCustomers - a.uniqueCustomers;
          default:
            return b.conversionRate - a.conversionRate;
        }
      });
      return list.slice(0, 3);
    }),

    // Remaining (Rank 4+)
    remainingRankedEmployees: computed(() => {
      let list = [...employees()];
      const q = searchQuery().trim().toLowerCase();
      const dep = selectedDepartment();

      if (dep !== 'all') {
        list = list.filter(emp => emp.department === dep);
      }

      if (q) {
        list = list.filter(emp =>
          emp.name.toLowerCase().includes(q) ||
          emp.role.toLowerCase().includes(q)
        );
      }

      const activeSort = rankingMetric();
      list.sort((a, b) => {
        switch (activeSort) {
          case 'conversion':
            return b.conversionRate - a.conversionRate;
          case 'revenue':
            return b.revenue - a.revenue;
          case 'orders':
            return b.orderCount - a.orderCount;
          case 'customers':
            return b.uniqueCustomers - a.uniqueCustomers;
          default:
            return b.conversionRate - a.conversionRate;
        }
      });

      return list.slice(3);
    }),

    // Best channel highlight
    bestPerformingChannel: computed(() => {
      const sources = companyLeadSources();
      return sources.find(s => s.isBestPerforming) || sources[0];
    })
  })),
  withMethods((store, api = inject(PerformanceApiService)) => {
    const loadPerformanceData = () => {
      patchState(store, { isLoading: true });

      // Calculate start and end date based on dateRange
      const range = store.dateRange();
      const now = new Date();
      let startDate: string | undefined;
      const endDate = now.toISOString();

      if (range === 'this_week') {
        const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = start.toISOString();
      } else if (range === 'this_month') {
        const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate = start.toISOString();
      }

      api.getKpis({ startDate, endDate }).subscribe({
        next: (res: any) => {
          const kpis: any = res?.data || res || {};
          const revenue = Number(kpis.totalRevenue || 0);
          const orders = Number(kpis.totalOrders || 0);
          const leads = Number(kpis.totalLeads || 0);
          const uniqueCust = Number(kpis.uniqueCustomers || orders);
          const avgDeal = orders > 0 ? (revenue / orders).toFixed(1) : '0';

          const summaryMetrics: SummaryMetric[] = [
            {
              title: 'معدل التحويل (المعيار الأساسي)',
              value: `${kpis.conversionRate ?? 0}%`,
              icon: 'conversion_path',
              trend: '+0%',
              trendDirection: 'up',
              subLabel: `المعيار الأكثر عدالة (${orders} محول / ${leads} عميل)`,
              metricType: 'conversion'
            },
            {
              title: 'إجمالي الإيرادات',
              value: `$${revenue.toLocaleString()}`,
              icon: 'payments',
              trend: '+0%',
              trendDirection: 'up',
              subLabel: `متوسط قيمة الطلب: $${avgDeal}`,
              metricType: 'revenue'
            },
            {
              title: 'عدد الطلبات',
              value: `${orders}`,
              icon: 'shopping_bag',
              trend: '+0%',
              trendDirection: 'up',
              subLabel: `من إجمالي ${leads} عميل محتمل`,
              metricType: 'orders'
            },
            {
              title: 'العملاء الفريدون',
              value: `${uniqueCust}`,
              icon: 'group',
              trend: '+0%',
              trendDirection: 'up',
              subLabel: 'عملاء أصحاب اشتراكات نشطة',
              metricType: 'customers'
            }
          ];

          const companyLeadSources = kpis.companyLeadSources || [];
          const packageSales = kpis.packageSales || [];
          const teamTrendPoints = (kpis.weeklyTrends && kpis.weeklyTrends.length > 0)
            ? kpis.weeklyTrends
            : [
                { label: 'الأسبوع 1', value: 0, secondaryValue: 0 },
                { label: 'الأسبوع 2', value: 0, secondaryValue: 0 },
                { label: 'الأسبوع 3', value: 0, secondaryValue: 0 },
                { label: 'الأسبوع 4', value: kpis.conversionRate ?? 0, secondaryValue: orders }
              ];

          patchState(store, { summaryMetrics, companyLeadSources, packageSales, teamTrendPoints });
        },
        error: (err: any) => console.error(err)
      });

      api.getLeaderboard({ startDate, endDate }).subscribe({
        next: (res: any) => {
          const list: any[] = Array.isArray(res) ? res : (res?.data || []);
          const employees: EmployeePerformance[] = list.map((l, i) => {
            const empRevenue = Number(l.revenue || 0);
            const empOrders = Number(l.ordersCount || 0);
            const empRate = Number(l.conversionRate || 0);
            const empCust = Number(l.uniqueCustomers || empOrders);

            return {
              id: l.userId,
              rank: i + 1,
              name: l.userName || 'موظف مبيعات',
              role: l.userRole || 'موظف مبيعات',
              avatarUrl: '',
              department: 'المبيعات',
              tenureDays: 120,
              tenureLabel: 'موظف مبيعات',
              dominantSource: 'مباشر',
              dominantSourcePercentage: 100,
              uniqueCustomers: empCust,
              uniqueCustomersLabel: `${empCust} عميل`,
              orderCount: empOrders,
              orderCountLabel: `${empOrders} طلب`,
              revenue: empRevenue,
              revenueFormatted: `$${empRevenue.toLocaleString()}`,
              conversionRate: empRate,
              conversionRateFormatted: `${empRate}%`,
              conversionTrend: '0%',
              conversionTrendDirection: 'up',
              chartPercentageRevenue: 100,
              chartPercentageOrders: 100,
              chartPercentageConversion: 100,
              needsSupportAlert: false,
              sourcesBreakdown: [],
              trendWeekly: [],
              trendMonthly: []
            };
          });
          patchState(store, { employees, isLoading: false });
        },
        error: (err) => {
          console.error(err);
          patchState(store, { isLoading: false });
        }
      });
    };

    return {
      loadPerformanceData,
      setDateRange(dateRange: DateRangeFilter) {
        patchState(store, { dateRange });
        loadPerformanceData();
      },
      setViewMode(viewMode: ViewMode) {
        patchState(store, { viewMode });
      },
      setSearchQuery(searchQuery: string) {
        patchState(store, { searchQuery });
      },
      setSortBy(sortBy: SortOption) {
        patchState(store, { sortBy });
      },
      setRankingMetric(rankingMetric: CoreMetricType) {
        patchState(store, { rankingMetric, sortBy: rankingMetric });
      },
      setChartMetric(chartMetric: ChartMetric) {
        patchState(store, { chartMetric });
      },
      setSelectedDepartment(selectedDepartment: string) {
        patchState(store, { selectedDepartment });
      },
      selectEmployee(selectedEmployeeId: string | null) {
        patchState(store, { selectedEmployeeId });
      },
      scheduleTrainingSession(empId: string) {
        const emp = store.employees().find(e => e.id === empId);
        console.info(`Scheduled training session for ${emp?.name || empId}`);
      }
    };
  })
);

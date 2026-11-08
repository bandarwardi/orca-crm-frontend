import re

file_path = "f:/apps/orca/crm/src/app/features/performance/store/performance.store.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add imports
content = content.replace(
    "import { computed } from '@angular/core';",
    "import { computed, inject } from '@angular/core';\nimport { PerformanceApiService } from '../../../../core/services/api/performance-api.service';"
)

# Empty initialEmployees and initialSummaryMetrics
content = re.sub(r"const initialEmployees: EmployeePerformance\[\] = \[\s*\{[\s\S]*?^\];", "const initialEmployees: EmployeePerformance[] = [];", content, flags=re.MULTILINE)
content = re.sub(r"const initialSummaryMetrics: SummaryMetric\[\] = \[\s*\{[\s\S]*?^\];", "const initialSummaryMetrics: SummaryMetric[] = [];", content, flags=re.MULTILINE)

# Update injection in withMethods
content = content.replace(
    "withMethods((store) => ({",
    "withMethods((store, api = inject(PerformanceApiService)) => ({"
)

# Add loadPerformanceData
load_perf_str = """
    loadPerformanceData() {
      patchState(store, { isLoading: true });
      api.getKpis().subscribe({
        next: (kpis) => {
          const summaryMetrics: SummaryMetric[] = [
            {
              title: 'معدل التحويل (المعيار الأساسي)',
              value: `${kpis.conversionRate}%`,
              icon: 'conversion_path',
              trend: '+0%',
              trendDirection: 'up',
              subLabel: `العملاء المحولون / المستلمون (${kpis.totalLeads})`,
              metricType: 'conversion'
            },
            {
              title: 'إجمالي الإيرادات',
              value: `$${kpis.totalRevenue}`,
              icon: 'payments',
              trend: '+0%',
              trendDirection: 'up',
              subLabel: 'قيمة الصفقات',
              metricType: 'revenue'
            },
            {
              title: 'عدد الطلبات',
              value: `${kpis.totalOrders}`,
              icon: 'shopping_bag',
              trend: '+0%',
              trendDirection: 'up',
              subLabel: `من إجمالي ${kpis.totalLeads} عميل محتمل`,
              metricType: 'orders'
            }
          ];
          patchState(store, { summaryMetrics });
        },
        error: err => console.error(err)
      });
      
      api.getLeaderboard().subscribe({
        next: (leaders: any[]) => {
          const employees: EmployeePerformance[] = leaders.map((l, i) => ({
             id: l.userId,
             rank: i + 1,
             name: l.userName,
             role: 'موظف',
             avatarUrl: '', 
             department: 'المبيعات',
             tenureDays: 100,
             tenureLabel: 'موظف',
             dominantSource: 'مباشر',
             dominantSourcePercentage: 100,
             uniqueCustomers: l.ordersCount,
             uniqueCustomersLabel: `${l.ordersCount} عميل`,
             orderCount: l.ordersCount,
             orderCountLabel: `${l.ordersCount} طلب`,
             revenue: l.revenue,
             revenueFormatted: `$${l.revenue}`,
             conversionRate: 0,
             conversionRateFormatted: '0%',
             conversionTrend: '0%',
             conversionTrendDirection: 'up',
             chartPercentageRevenue: 100,
             chartPercentageOrders: 100,
             chartPercentageConversion: 100,
             needsSupportAlert: false,
             sourcesBreakdown: [],
             trendWeekly: [],
             trendMonthly: []
          }));
          patchState(store, { employees, isLoading: false });
        },
        error: (err) => {
          console.error(err);
          patchState(store, { isLoading: false });
        }
      });
    },"""

content = content.replace(
    "withMethods((store, api = inject(PerformanceApiService)) => ({",
    "withMethods((store, api = inject(PerformanceApiService)) => ({" + load_perf_str
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Performance store updated")

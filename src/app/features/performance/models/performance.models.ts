export type DateRangeFilter = 'this_week' | 'this_month' | 'custom';
export type ViewMode = 'table' | 'chart';
export type CoreMetricType = 'conversion' | 'revenue' | 'orders' | 'customers';
export type SortOption = 'revenue' | 'orders' | 'conversion' | 'customers';
export type ChartMetric = 'revenue' | 'orders' | 'conversion';

export type LeadSourceType = 'cold_call' | 'whatsapp' | 'referral' | 'website' | 'facebook' | 'direct';

export interface SummaryMetric {
  title: string;
  value: string;
  icon: string;
  trend: string;
  trendDirection: 'up' | 'down';
  subLabel: string;
  metricType: CoreMetricType;
}

export interface RepLeadSourceBreakdown {
  sourceType: LeadSourceType;
  sourceLabel: string;
  leadsReceived: number;
  leadsConverted: number;
  conversionRate: number;
  conversionRateFormatted: string;
  revenue: number;
  revenueFormatted: string;
  icon: string;
}

export interface EmployeePerformance {
  id: string;
  rank: number;
  name: string;
  role: string;
  avatarUrl?: string;
  initials?: string;
  isTopPerformer?: boolean;
  department: string;
  tenureDays: number;
  tenureLabel: string;
  dominantSource: string;
  dominantSourcePercentage: number;
  uniqueCustomers: number;
  uniqueCustomersLabel: string;
  orderCount: number;
  orderCountLabel: string;
  revenue: number;
  revenueFormatted: string;
  conversionRate: number;
  conversionRateFormatted: string;
  conversionTrend: string;
  conversionTrendDirection: 'up' | 'down';
  chartPercentageRevenue: number;
  chartPercentageOrders: number;
  chartPercentageConversion: number;
  needsSupportAlert: boolean;
  supportAlertReason?: string;
  sourcesBreakdown: RepLeadSourceBreakdown[];
  trendWeekly: { label: string; conversionRate: number; orders: number }[];
  trendMonthly: { label: string; conversionRate: number; orders: number }[];
}

export interface PackageSaleBreakdown {
  name: string;
  percentage: number;
  percentageFormatted: string;
  revenueFormatted: string;
  barColorClass: string;
}

export interface QualityKpiItem {
  title: string;
  value: string;
  change: string;
  changeType: 'success' | 'info' | 'neutral';
}

export interface LeadSourceCompanyMetric {
  sourceType: LeadSourceType;
  sourceLabel: string;
  icon: string;
  leadsReceived: number;
  leadsConverted: number;
  conversionRate: number;
  conversionRateFormatted: string;
  avgDealValue: number;
  avgDealValueFormatted: string;
  totalRevenue: number;
  totalRevenueFormatted: string;
  marketSharePercentage: number;
  trendChange: string;
  trendDirection: 'up' | 'down';
  isBestPerforming?: boolean;
}

export interface ChannelTrendPoint {
  month: string;
  coldCallingShare: number;
  inboundWhatsAppShare: number;
  websiteShare: number;
  referralShare: number;
}

export interface ActionableInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'tip';
  icon: string;
  badge: string;
  text: string;
}

import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { TimelineEvent } from '../../../shared/components/timeline/timeline';
import { DashboardApiService } from '../../../core/services/api/dashboard-api.service';
import { formatDateEn } from '../../../core/utils/date-format.util';

export interface DashboardFollowup {
  id: string;
  name: string;
  category: 'renewal' | 'lead' | 'support';
  statusType: string;
  statusLabel: string;
  phone: string;
  actionIcon: string;
  actionTitle: string;
  orderId?: string;
  leadId?: string;
}

export interface DashboardState {
  kpis: any;
  followups: DashboardFollowup[];
  activeFollowupTab: 'all' | 'renewal' | 'lead' | 'support';
  funnelStages: any[];
  recentEvents: TimelineEvent[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  kpis: null,
  followups: [],
  activeFollowupTab: 'all',
  funnelStages: [],
  recentEvents: [],
  isLoading: false,
  error: null
};

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    filteredFollowups: computed(() => {
      const tab = store.activeFollowupTab();
      const list = store.followups();
      if (tab === 'all') return list;
      return list.filter(f => f.category === tab);
    }),
    renewalFollowupsCount: computed(() => store.followups().filter(f => f.category === 'renewal').length),
    leadFollowupsCount: computed(() => store.followups().filter(f => f.category === 'lead').length),
    supportFollowupsCount: computed(() => store.followups().filter(f => f.category === 'support').length),
  })),
  withMethods((store, api = inject(DashboardApiService)) => ({
    setActiveFollowupTab(tab: 'all' | 'renewal' | 'lead' | 'support') {
      patchState(store, { activeFollowupTab: tab });
    },
    loadSummary() {
      patchState(store, { isLoading: true, error: null });
      api.getSummary().subscribe({
        next: (res: any) => {
          const data = res?.data || res || {};

          // Parse sales funnel with case and translation tolerance
          const stagesConfig = [
            { keys: ['new', 'جديد'], label: 'جديد', colorClass: 'bg-brand-500' },
            { keys: ['contacted', 'متابعة'], label: 'متابعة', colorClass: 'bg-brand-600' },
            { keys: ['interested', 'مهتم'], label: 'مهتم', colorClass: 'bg-accent-emerald' },
            { keys: ['negotiation', 'تفاوض', 'مفاوضات'], label: 'تفاوض', colorClass: 'bg-accent-amber' },
          ];

          const funnelData = data.funnel || {};
          let total = 0;
          stagesConfig.forEach(s => {
            const count = s.keys.reduce((acc, k) => acc + (funnelData[k] || 0), 0);
            total += count;
          });

          const funnelStages = stagesConfig.map(s => {
            const count = s.keys.reduce((acc, k) => acc + (funnelData[k] || 0), 0);
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            return {
              label: s.label,
              count,
              percentage,
              colorClass: s.colorClass
            };
          });

          const recentEvents: TimelineEvent[] = data.recentActivity ? data.recentActivity.map((order: any) => ({
            id: order.id,
            title: `تم تأكيد طلب جديد #${order.order_number || order.id.slice(0, 8)}`,
            description: order.customer?.name || 'عميل مسجل',
            timestamp: formatDateEn(order.created_at),
            icon: 'check_circle',
            color: 'primary'
          })) : [];

          patchState(store, {
            kpis: data.kpis,
            funnelStages,
            recentEvents,
            followups: data.followups || [],
            isLoading: false
          });
        },
        error: (err) => {
          patchState(store, { error: err.message, isLoading: false });
        }
      });
    }
  }))
);


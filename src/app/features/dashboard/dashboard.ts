import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { KpiCard } from '../../shared/components/kpi-card/kpi-card';
import { Avatar } from '../../shared/components/avatar/avatar';
import { Timeline } from '../../shared/components/timeline/timeline';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { LoadingState } from '../../shared/components/loading-state/loading-state';
import { DashboardFollowup, DashboardStore } from './state/dashboard.store';
import { RingCentralWidgetService } from '../../core/services/ringcentral-widget.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, KpiCard, Avatar, Timeline, StatusBadge, ErrorState, LoadingState],
  host: { class: 'flex-1 flex flex-col min-h-0 overflow-hidden' },
  template: `
    @if (store.isLoading()) {
      <div class="flex-1 p-space-lg flex items-center justify-center">
        <app-loading-state type="spinner" text="جاري تحميل الإحصائيات..."></app-loading-state>
      </div>
    } @else if (store.error()) {
      <div class="flex-1 p-space-lg flex items-center justify-center">
        <app-error-state [message]="store.error() || ''" (retry)="store.loadSummary()"></app-error-state>
      </div>
    } @else {
      <div class="flex-1 flex flex-col min-h-0 overflow-y-auto p-space-md lg:p-space-lg gap-space-lg custom-scrollbar">
        <!-- 1. TOP ROW: 4 REAL DYNAMIC METRIC CARDS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md lg:gap-space-lg">
          <app-kpi-card
            title="اشتراكات تنتهي قريباً"
            [value]="store.kpis()?.expiringOrders?.toString() || '0'"
            trend="متابعة فورية"
            icon="alarm"
            variant="expiring"
            [subLabel]="'من إجمالي ' + (store.kpis()?.totalSubscriptions || store.kpis()?.totalOrders || 0) + ' اشتراك'"
          ></app-kpi-card>

          <app-kpi-card
            title="عملاء محتملون"
            [value]="store.kpis()?.totalLeads?.toString() || '0'"
            trend="نشط"
            icon="group"
            variant="active-leads"
            subLabel="العدد الإجمالي"
          ></app-kpi-card>

          <app-kpi-card
            title="إجمالي الإيرادات"
            [value]="'$' + (store.kpis()?.totalRevenue || 0).toLocaleString()"
            trend="مبيعات مسجلة"
            trendDirection="up"
            icon="payments"
            variant="revenue"
            subLabel="الإجمالي المالي"
          ></app-kpi-card>

          <app-kpi-card
            title="إجمالي الطلبات"
            [value]="store.kpis()?.totalOrders?.toString() || '0'"
            trend="طلبات نشطة"
            trendDirection="up"
            icon="shopping_bag"
            variant="today-orders"
            subLabel="كافة الطلبات"
          ></app-kpi-card>
        </div>

        <!-- 2. SECOND ROW: DAILY FOLLOW-UPS + LEADS FUNNEL -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-md lg:gap-space-lg items-start">
          <!-- متابعات اليوم -->
          <div class="lg:col-span-8 bg-surface rounded-xl p-space-md border border-border-subtle flex flex-col justify-between h-full shadow-sm">
            <div>
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm mb-space-sm border-b border-border-subtle">
                <div class="flex items-center gap-2">
                  <h2 class="text-[18px] font-bold text-on-surface">متابعات اليوم</h2>
                  <span class="px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300 font-code-sm text-[12px] font-bold">
                    {{ store.filteredFollowups().length }} مهام
                  </span>
                </div>
                
                <!-- Filter Tabs -->
                <div class="flex items-center gap-1 bg-surface-container p-1 rounded-lg">
                  <button
                    type="button"
                    (click)="store.setActiveFollowupTab('all')"
                    [class]="store.activeFollowupTab() === 'all'
                      ? 'px-2.5 py-1 rounded-md bg-surface text-brand-600 font-semibold font-label-sm text-label-sm shadow-xs transition-all'
                      : 'px-2.5 py-1 rounded-md text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-colors'"
                  >
                    الكل ({{ store.followups().length }})
                  </button>
                  <button
                    type="button"
                    (click)="store.setActiveFollowupTab('renewal')"
                    [class]="store.activeFollowupTab() === 'renewal'
                      ? 'px-2.5 py-1 rounded-md bg-surface text-brand-600 font-semibold font-label-sm text-label-sm shadow-xs transition-all'
                      : 'px-2.5 py-1 rounded-md text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-colors'"
                  >
                    تجديد اشتراك ({{ store.renewalFollowupsCount() }})
                  </button>
                  <button
                    type="button"
                    (click)="store.setActiveFollowupTab('lead')"
                    [class]="store.activeFollowupTab() === 'lead'
                      ? 'px-2.5 py-1 rounded-md bg-surface text-brand-600 font-semibold font-label-sm text-label-sm shadow-xs transition-all'
                      : 'px-2.5 py-1 rounded-md text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-colors'"
                  >
                    عميل محتمل ({{ store.leadFollowupsCount() }})
                  </button>
                </div>
              </div>
              
              <!-- Follow-up List Area -->
              <div class="space-y-1 min-h-[160px]">
                @if (store.filteredFollowups().length === 0) {
                  <div class="py-12 text-center flex flex-col items-center justify-center gap-2">
                    <div class="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant/50">
                      <span class="material-symbols-outlined text-[28px]">task_alt</span>
                    </div>
                    <p class="font-bold text-sm text-on-surface">لا توجد متابعات مستحقة في هذا القسم</p>
                    <p class="text-xs text-on-surface-variant">جميع المشتركين والعملاء تمت متابعتهم بنجاح</p>
                  </div>
                } @else {
                  @for (followup of store.filteredFollowups(); track followup.id) {
                    <div
                      (click)="onFollowupClick(followup)"
                      class="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center p-2.5 rounded-lg border border-transparent hover:border-border-subtle hover:bg-surface-alt transition-all group cursor-pointer border-b border-border-subtle/50 last:border-b-0"
                    >
                      <div class="flex items-center gap-3">
                        <app-avatar [name]="followup.name" size="md"></app-avatar>
                        <div class="flex flex-col">
                          <span class="font-label-md text-label-md text-on-surface font-semibold group-hover:text-brand-600 transition-colors">{{ followup.name }}</span>
                          <span class="text-[11px] text-on-surface-variant sm:hidden">{{ followup.statusLabel }}</span>
                        </div>
                      </div>
                      
                      <div class="hidden sm:block">
                        <app-status-badge [status]="followup.statusType" [label]="followup.statusLabel"></app-status-badge>
                      </div>
                      
                      <span class="font-code-sm text-[12px] text-on-surface-variant hidden md:block w-32 text-right" dir="ltr">{{ followup.phone }}</span>
                      
                      <button
                        type="button"
                        class="w-8 h-8 rounded-lg bg-surface-container opacity-0 group-hover:opacity-100 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/20 text-on-surface-variant flex items-center justify-center transition-all"
                        [title]="followup.actionTitle"
                        (click)="$event.stopPropagation(); onFollowupAction(followup)"
                      >
                        <span class="material-symbols-outlined text-[18px]">{{ followup.actionIcon }}</span>
                      </button>
                    </div>
                  }
                }
              </div>
            </div>
            
            <div class="pt-space-sm mt-space-sm border-t border-border-subtle flex items-center justify-between">
              <a routerLink="/leads" class="font-label-sm text-label-sm text-brand-600 hover:underline flex items-center gap-1 font-semibold">
                <span>عرض كل العملاء والمتابعات ({{ store.kpis()?.totalLeads || store.followups().length }} إجمالي)</span>
                <span class="material-symbols-outlined text-[16px]">arrow_back</span>
              </a>
              <a routerLink="/leads" class="font-label-sm text-label-sm text-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/20 px-3 py-1.5 rounded-md flex items-center gap-1 font-semibold transition-colors">
                <span class="material-symbols-outlined text-[16px]">add_circle</span>
                <span>إضافة متابعة</span>
              </a>
            </div>
          </div>

          <!-- قمع المبيعات -->
          <div class="lg:col-span-4 bg-surface rounded-xl p-space-md border border-border-subtle flex flex-col justify-between h-full shadow-sm">
            <div>
              <div class="flex items-center justify-between pb-space-sm border-b border-border-subtle mb-space-md">
                <div>
                  <h2 class="text-[18px] font-bold text-on-surface">قمع المبيعات</h2>
                  <p class="text-[13px] text-on-surface-variant/80 mt-0.5">توزيع العملاء المحتملين حسب المرحلة</p>
                </div>
              </div>
              
              <div class="space-y-4 pt-1">
                @for (stage of store.funnelStages(); track stage.label) {
                  <div class="group cursor-pointer" routerLink="/leads">
                    <div class="flex items-center justify-between font-label-sm text-label-sm mb-1.5">
                      <span class="text-on-surface font-semibold group-hover:text-brand-600 transition-colors">{{ stage.label }}</span>
                      <span class="font-code-sm text-on-surface-variant group-hover:text-on-surface transition-colors">{{ stage.count }} ({{ stage.percentage }}%)</span>
                    </div>
                    <div class="w-full bg-surface-container rounded-full h-3 overflow-hidden shadow-inner">
                      <div [ngClass]="stage.colorClass" class="h-full rounded-full transition-all duration-500 ease-out opacity-90 group-hover:opacity-100" [style.width.%]="stage.percentage"></div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="mt-space-md pt-space-sm border-t border-border-subtle">
              <a routerLink="/leads" class="font-label-md text-label-md text-brand-600 hover:underline flex items-center justify-between font-semibold">
                <span>إدارة مراحل البيع</span>
                <span class="material-symbols-outlined text-[16px]">arrow_back</span>
              </a>
            </div>
          </div>
        </div>

        <!-- 3. THIRD ROW: RECENT ACTIVITY FEED -->
        <div class="bg-surface rounded-xl p-space-md border border-border-subtle shadow-sm">
          <div class="flex items-center pb-space-sm border-b border-border-subtle mb-space-sm gap-2">
            <span class="material-symbols-outlined text-on-surface-variant text-[22px]">history</span>
            <h2 class="text-[18px] font-bold text-on-surface">النشاط الأخير وسجل الأحداث</h2>
            <div class="flex items-center gap-1.5 px-2 py-0.5 ml-auto rounded-md bg-surface-alt text-on-surface font-label-sm text-[11px] border border-border-subtle">
              <span class="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse"></span>
              <span class="font-medium">مباشر</span>
            </div>
          </div>
          
          <app-timeline [events]="store.recentEvents()"></app-timeline>
        </div>
      </div>
    }
  `
})
export class Dashboard implements OnInit {
  readonly store = inject(DashboardStore);
  private readonly router = inject(Router);
  private readonly rcWidget = inject(RingCentralWidgetService);

  ngOnInit(): void {
    this.store.loadSummary();
  }

  onFollowupClick(followup: DashboardFollowup): void {
    if (followup.orderId) {
      this.router.navigate(['/orders', followup.orderId]);
    } else if (followup.leadId) {
      this.router.navigate(['/leads']);
    }
  }

  onFollowupAction(followup: DashboardFollowup): void {
    if (followup.phone) {
      this.rcWidget.dialNumber(followup.phone);
    }
  }
}

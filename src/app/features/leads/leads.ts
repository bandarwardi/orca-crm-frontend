import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeadsStore, Lead } from './state/leads.store';
import { KanbanView } from './components/kanban-view/kanban-view';
import { TableView } from './components/table-view/table-view';
import { LeadDetailModal } from './components/lead-detail-modal/lead-detail-modal';
import { AddLeadModal } from './components/add-lead-modal/add-lead-modal';
import { FilterPanel } from '../../shared/components/filter-panel/filter-panel';
import { LEAD_STATUS_CONFIG } from '../../shared/config/status-config';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { LoadingState } from '../../shared/components/loading-state/loading-state';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, KanbanView, TableView, LeadDetailModal, AddLeadModal, FilterPanel, ErrorState, LoadingState, EmptyState],
  host: { class: 'flex-1 flex flex-col min-h-0' },
  template: `
    <div class="px-space-lg pt-4 pb-2 bg-surface flex-1 flex flex-col min-h-0 relative">
      <!-- Top Action & Title Bar -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-surface-container-lowest p-3.5 rounded-xl shadow-sm flex-shrink-0 mb-3">
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-2">
            <h1 class="font-headline-lg text-[22px] text-on-surface font-bold tracking-tight">العملاء المحتملون</h1>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-[12px] font-semibold">{{ store.totalLeadsCount() }} عميل محتمل</span>
          </div>
          <div class="h-5 w-px bg-outline-variant/40 hidden sm:block"></div>
          
          <!-- View Toggle -->
          <div class="bg-surface-container p-0.5 rounded-lg flex items-center">
            <button 
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-label-sm text-[13px] font-semibold transition-colors"
              [class.bg-surface-container-lowest]="store.viewMode() === 'kanban'"
              [class.text-primary]="store.viewMode() === 'kanban'"
              [class.shadow-sm]="store.viewMode() === 'kanban'"
              [class.text-on-surface-variant]="store.viewMode() !== 'kanban'"
              (click)="store.setViewMode('kanban')">
              <span class="material-symbols-outlined text-[18px]">view_kanban</span>
              <span>كانبان</span>
            </button>
            <button 
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-label-sm text-[13px] transition-colors"
              [class.bg-surface-container-lowest]="store.viewMode() === 'table'"
              [class.text-primary]="store.viewMode() === 'table'"
              [class.shadow-sm]="store.viewMode() === 'table'"
              [class.text-on-surface-variant]="store.viewMode() !== 'table'"
              (click)="store.setViewMode('table')">
              <span class="material-symbols-outlined text-[18px]">format_list_bulleted</span>
              <span>جدول</span>
            </button>
          </div>
        </div>
        
        <div class="flex items-center gap-2.5 flex-1 max-w-lg justify-end">
          <!-- Search -->
          <div class="relative flex-1 max-w-[280px]">
            <span class="material-symbols-outlined absolute end-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input 
              class="w-full h-9 pe-9 ps-3 rounded-lg bg-surface-container-low font-body-md text-[13px] text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 border border-outline-variant/40 transition-all" 
              placeholder="بحث بالاسم أو الهاتف..." 
              type="text"
              [value]="store.searchQuery()"
              (input)="onSearch($event)">
          </div>
          
          <!-- Filter Button -->
          <button 
            class="px-3 h-9 rounded-lg border border-outline-variant/50 hover:bg-surface-container text-on-surface font-label-md text-[13px] flex items-center gap-1.5 transition-colors flex-shrink-0"
            (click)="isFilterOpen = true">
            <span class="material-symbols-outlined text-[18px] text-on-surface-variant">filter_list</span>
            <span>تصفية</span>
          </button>
          
          <!-- Add Button -->
          <button 
            class="px-3.5 h-9 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-[13px] font-semibold flex items-center gap-1.5 shadow-sm transition-all flex-shrink-0 active:scale-95"
            (click)="isAddModalOpen = true">
            <span class="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ عميل محتمل جديد</span>
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-h-0 relative">
        @if (store.isLoading() && store.leads().length === 0) {
          <div class="flex-1 flex items-center justify-center">
            <app-loading-state type="spinner" text="جاري تحميل العملاء المحتملين..."></app-loading-state>
          </div>
        } @else if (store.error()) {
          <div class="flex-1 flex items-center justify-center p-6">
            <app-error-state [message]="store.error() || ''" (retry)="store.loadLeads()"></app-error-state>
          </div>
        } @else if (!store.isLoading() && store.leads().length === 0) {
          <div class="flex-1 flex items-center justify-center p-6">
            <app-empty-state title="لا يوجد عملاء محتملون" description="قم بإضافة أول عميل محتمل لتبدأ مسار المبيعات" actionLabel="إضافة عميل" actionIcon="add" (action)="isAddModalOpen = true"></app-empty-state>
          </div>
        } @else {
          @if (store.isLoading()) {
            <div class="absolute inset-0 z-10 bg-surface/50 backdrop-blur-[2px] flex items-center justify-center">
              <app-loading-state type="spinner" text="جاري التحديث..."></app-loading-state>
            </div>
          }
          @if (store.viewMode() === 'kanban') {
            <app-kanban-view (selectLead)="onSelectLead($event)" (addLead)="isAddModalOpen = true"></app-kanban-view>
          } @else {
            <app-table-view (selectLead)="onSelectLead($event)"></app-table-view>
          }
        }
      </div>
      
      <!-- Slide-in Filter Panel -->
      <app-filter-panel 
        [isOpen]="isFilterOpen" 
        (close)="isFilterOpen = false" 
        (apply)="isFilterOpen = false"
        (clear)="isFilterOpen = false">
        <div class="space-y-4">
          <div class="flex flex-col gap-1.5">
            <label class="font-label-sm text-on-surface-variant">المرحلة</label>
            <select class="w-full h-10 px-3 rounded-lg border border-border-subtle bg-surface text-on-surface font-body-md">
              <option value="">الكل</option>
              <option value="interested">{{ statusConfig.interested.label }}</option>
              <option value="negotiation">{{ statusConfig.negotiation.label }}</option>
              <option value="won">{{ statusConfig.won.label }}</option>
              <option value="closed">{{ statusConfig.closed.label }}</option>
            </select>
          </div>
        </div>
      </app-filter-panel>
      
      <!-- Lead Detail Modal -->
      <app-lead-detail-modal 
        [isOpen]="isModalOpen" 
        [lead]="selectedLead()"
        (close)="onCloseModal()">
      </app-lead-detail-modal>

      <!-- Add Lead Modal -->
      <app-add-lead-modal
        [isOpen]="isAddModalOpen"
        (close)="isAddModalOpen = false">
      </app-add-lead-modal>
    </div>
  `
})
export class Leads implements OnInit {
  store = inject(LeadsStore);
  statusConfig = LEAD_STATUS_CONFIG;
  
  ngOnInit() {
    this.store.loadLeads();
  }

  isFilterOpen = false;
  isModalOpen = false;
  isAddModalOpen = false;
  selectedLeadId = signal<string | null>(null);

  selectedLead = computed(() => {
    const id = this.selectedLeadId();
    if (!id) return null;
    return this.store.leads().find(l => l.id === id) || null;
  });

  onSelectLead(lead: Lead) {
    this.selectedLeadId.set(lead.id);
    this.isModalOpen = true;
  }

  onCloseModal() {
    this.isModalOpen = false;
    this.selectedLeadId.set(null);
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.store.setSearchQuery(input.value);
  }
}

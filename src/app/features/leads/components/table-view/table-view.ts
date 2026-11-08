import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LeadsStore, Lead } from '../../state/leads.store';
import { DataTable, ColumnDef } from '../../../../shared/components/data-table/data-table';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { getLeadStatusConfig } from '../../../../shared/config/status-config';
import { RingCentralWidgetService } from '../../../../core/services/ringcentral-widget.service';

@Component({
  selector: 'app-table-view',
  standalone: true,
  imports: [CommonModule, DataTable, ColumnDef, StatusBadge],
  host: { class: 'flex-1 flex flex-col min-h-0' },
  template: `
    <app-data-table [data]="store.filteredLeads()" [selectable]="true" (rowClick)="selectLead.emit($event)">
      
      <!-- Name & Location Column -->
      <ng-template appColumnDef="name" header="العميل" let-lead>
        <div class="flex flex-col cursor-pointer group">
          <span class="font-headline-sm text-[14px] text-on-surface font-semibold group-hover:text-brand-600 transition-colors">{{ lead.name }}</span>
          <span class="font-code-sm text-[11px] text-on-surface-variant">{{ lead.location }}</span>
        </div>
      </ng-template>

      <!-- Phone Column -->
      <ng-template appColumnDef="phone" header="رقم الهاتف" let-lead>
        <span class="font-code-sm text-[13px] text-on-surface-variant" dir="ltr">+{{ lead.phone }}</span>
      </ng-template>

      <!-- Stage Column -->
      <ng-template appColumnDef="stage" header="المرحلة" let-lead>
        <app-status-badge [status]="getStageStatus(lead.stage)" [label]="getStageLabel(lead.stage)"></app-status-badge>
      </ng-template>

      <!-- Follow-up Column -->
      <ng-template appColumnDef="followup" header="المتابعة" let-lead>
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-[11px] font-semibold whitespace-nowrap"
              [class.bg-brand-50]="lead.badgeType === 'primary'"
              [class.text-brand-600]="lead.badgeType === 'primary'"
              [class.dark:bg-brand-500/20]="lead.badgeType === 'primary'"
              [class.dark:text-brand-300]="lead.badgeType === 'primary'"
              [class.bg-[#FFFBEB]]="lead.badgeType === 'warning'"
              [class.text-[#D97706]]="lead.badgeType === 'warning'"
              [class.dark:bg-amber-500/20]="lead.badgeType === 'warning'"
              [class.dark:text-amber-300]="lead.badgeType === 'warning'"
              [class.bg-[#ECFDF5]]="lead.badgeType === 'success'"
              [class.text-[#059669]]="lead.badgeType === 'success'"
              [class.dark:bg-emerald-500/20]="lead.badgeType === 'success'"
              [class.dark:text-emerald-300]="lead.badgeType === 'success'"
              [class.bg-[#F1F5F9]]="lead.badgeType === 'neutral' || lead.badgeType === 'muted'"
              [class.text-[#475569]]="lead.badgeType === 'neutral' || lead.badgeType === 'muted'"
              [class.dark:bg-slate-800]="lead.badgeType === 'neutral' || lead.badgeType === 'muted'"
              [class.dark:text-slate-300]="lead.badgeType === 'neutral' || lead.badgeType === 'muted'">
          <span class="material-symbols-outlined text-[13px]">{{ lead.badgeIcon }}</span>
          <span>{{ lead.badgeText }}</span>
        </span>
      </ng-template>

      <!-- Notes / Status Column -->
      <ng-template appColumnDef="notes" header="الملاحظات" let-lead>
        <span class="font-body-sm text-[12px] text-on-surface line-clamp-1 max-w-xs">{{ lead.notes }}</span>
      </ng-template>

      <!-- Rep Column -->
      <ng-template appColumnDef="repName" header="المسؤول" let-lead>
        <span class="font-label-sm text-[12px] text-on-surface-variant whitespace-nowrap">{{ lead.repName }}</span>
      </ng-template>

      <!-- Actions Column -->
      <ng-template appColumnDef="actions" header="الإجراءات" let-lead>
        <div class="flex items-center gap-1.5" (click)="$event.stopPropagation()">
          <!-- Direct WhatsApp Chat in CRM Inbox -->
          <button class="w-7 h-7 rounded-lg flex items-center justify-center bg-[#25D366] text-white hover:scale-105 transition-all shadow-xs cursor-pointer"
                  (click)="openWhatsApp(lead)"
                  title="فتح محادثة واتساب في النظام">
            <span class="material-symbols-outlined text-[15px]">chat</span>
          </button>

          <!-- Direct RingCentral Call -->
          <button class="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 transition-all shadow-xs cursor-pointer"
                  (click)="callPhone(lead)"
                  title="اتصال هاتفي عبر RingCentral">
            <span class="material-symbols-outlined text-[15px]">call</span>
          </button>

          <button class="w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-brand-600 transition-colors flex items-center justify-center cursor-pointer"
                  (click)="selectLead.emit(lead)"
                  title="التفاصيل">
            <span class="material-symbols-outlined text-[18px]">more_vert</span>
          </button>
        </div>
      </ng-template>

    </app-data-table>
  `
})
export class TableView {
  store = inject(LeadsStore);
  selectLead = output<Lead>();

  private router = inject(Router);
  private rcWidget = inject(RingCentralWidgetService);

  getStageStatus(stage: string): string {
    return stage === 'converted' ? 'won' : stage;
  }

  getStageLabel(stage: string): string {
    return getLeadStatusConfig(stage).label;
  }

  openWhatsApp(lead: Lead) {
    if (lead.phone) {
      this.router.navigate(['/inbox'], {
        queryParams: {
          phone: lead.phone,
          name: lead.name,
          channel: 'whatsapp',
        },
      });
    }
  }

  callPhone(lead: Lead) {
    if (lead.phone) {
      this.rcWidget.dialNumber(lead.phone);
    }
  }
}

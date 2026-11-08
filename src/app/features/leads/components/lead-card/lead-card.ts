import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Lead } from '../../state/leads.store';
import { getLeadStatusConfig } from '../../../../shared/config/status-config';
import { RingCentralWidgetService } from '../../../../core/services/ringcentral-widget.service';

@Component({
  selector: 'app-lead-card',
  standalone: true,
  imports: [CommonModule],
  host: { class: 'block mb-3 last:mb-0' },
  template: `
    <div class="bg-surface rounded-xl p-3.5 shadow-xs hover:shadow-md hover:border-brand-500/40 transition-all cursor-pointer border border-border-subtle space-y-2.5"
         [class.opacity-85]="lead().stage === 'closed'"
         (click)="cardClick.emit(lead())">
      <!-- Header: Name + Location + Status/Time Badge -->
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0 flex-1">
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold hover:text-brand-600 transition-colors truncate">
            {{ lead().name }}
          </h3>
          <span class="text-[11px] text-on-surface-variant font-label-sm font-medium block">
            {{ lead().location }}
          </span>
        </div>
        
        <!-- Status / Follow-up Badge -->
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-semibold flex-shrink-0"
              [class.bg-brand-50]="lead().badgeType === 'primary'"
              [class.text-brand-600]="lead().badgeType === 'primary'"
              [class.dark:bg-brand-500/20]="lead().badgeType === 'primary'"
              [class.dark:text-brand-300]="lead().badgeType === 'primary'"
              [class.bg-[#FFFBEB]]="lead().badgeType === 'warning'"
              [class.text-[#D97706]]="lead().badgeType === 'warning'"
              [class.dark:bg-amber-500/20]="lead().badgeType === 'warning'"
              [class.dark:text-amber-300]="lead().badgeType === 'warning'"
              [class.bg-[#ECFDF5]]="lead().badgeType === 'success'"
              [class.text-[#059669]]="lead().badgeType === 'success'"
              [class.dark:bg-emerald-500/20]="lead().badgeType === 'success'"
              [class.dark:text-emerald-300]="lead().badgeType === 'success'"
              [class.bg-[#F1F5F9]]="lead().badgeType === 'neutral' || lead().badgeType === 'muted'"
              [class.text-[#475569]]="lead().badgeType === 'neutral' || lead().badgeType === 'muted'"
              [class.dark:bg-slate-800]="lead().badgeType === 'neutral' || lead().badgeType === 'muted'"
              [class.dark:text-slate-300]="lead().badgeType === 'neutral' || lead().badgeType === 'muted'">
          <span class="material-symbols-outlined text-[13px]">{{ lead().badgeIcon }}</span>
          <span>{{ lead().badgeText }}</span>
        </span>
      </div>

      <!-- Notes Box -->
      <div class="p-2.5 rounded-lg border border-border-subtle flex items-start gap-2"
           [style.backgroundColor]="lead().stage === 'converted' ? stageStyle().bg : ''"
           [class.bg-surface-alt]="lead().stage !== 'converted'">
        <span class="material-symbols-outlined text-[16px] flex-shrink-0 pt-0.5"
              [style.color]="stageStyle().text">notes</span>
        <p class="font-body-sm text-[12px] leading-snug"
           [style.color]="lead().stage === 'converted' ? stageStyle().text : ''"
           [class.font-medium]="lead().stage === 'converted'"
           [class.text-on-surface]="lead().stage !== 'converted' && lead().stage !== 'closed'"
           [class.text-on-surface-variant]="lead().stage === 'closed'">
          {{ lead().notes }}
        </p>
      </div>

      <!-- Footer: Assigned Rep + Quick WhatsApp Action -->
      <div class="flex items-center justify-between pt-1.5 border-t border-border-subtle">
        <div class="flex items-center gap-1.5 text-on-surface-variant text-[11px] font-label-sm">
          <span class="material-symbols-outlined text-[15px] text-outline">person</span>
          <span class="font-medium text-on-surface">{{ lead().repName }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <!-- Direct WhatsApp Chat in CRM Inbox -->
          <button class="w-7 h-7 rounded-lg flex items-center justify-center bg-[#25D366] text-white hover:scale-105 transition-all shadow-xs cursor-pointer"
                  (click)="$event.stopPropagation(); openWhatsApp(lead())"
                  title="فتح محادثة واتساب في النظام">
            <span class="material-symbols-outlined text-[15px]">chat</span>
          </button>

          <!-- Direct RingCentral Call -->
          <button class="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 transition-all shadow-xs cursor-pointer"
                  (click)="$event.stopPropagation(); callPhone(lead())"
                  title="اتصال هاتفي عبر RingCentral">
            <span class="material-symbols-outlined text-[15px]">call</span>
          </button>

          <button class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-container text-on-surface-variant hover:text-brand-600 transition-colors cursor-pointer"
                  (click)="$event.stopPropagation(); cardClick.emit(lead())"
                  title="التفاصيل">
            <span class="material-symbols-outlined text-[16px]">more_vert</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class LeadCard {
  lead = input.required<Lead>();
  cardClick = output<Lead>();

  private router = inject(Router);
  private rcWidget = inject(RingCentralWidgetService);

  stageStyle = computed(() => getLeadStatusConfig(this.lead().stage));

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

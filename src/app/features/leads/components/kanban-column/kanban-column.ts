import { Component, input, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LEAD_STATUS_CONFIG, LeadStatusKey } from '../../../../shared/config/status-config';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [CommonModule],
  host: { class: 'flex-1 min-w-[220px] max-w-[360px] flex flex-col h-full' },
  template: `
    <div class="w-full flex flex-col rounded-xl bg-canvas border border-border-subtle h-full max-h-full p-2.5">
      <!-- Column Header -->
      <div class="p-3 mb-2.5 bg-surface rounded-xl border border-border-subtle shadow-xs flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full ring-2" 
                [style.backgroundColor]="headerStyle().dot"
                [style.boxShadow]="'0 0 0 3px ' + headerStyle().ring"></span>
          <span class="font-headline-sm text-headline-sm text-on-surface font-bold">{{ displayTitle() }}</span>
        </div>
        <span class="px-2 py-0.5 rounded-full font-code-sm text-label-sm font-bold" 
              [style.backgroundColor]="headerStyle().badgeBg"
              [style.color]="headerStyle().badgeText">
          {{ count() }}
        </span>
      </div>
      
      <!-- Cards Stack Container -->
      <div class="overflow-y-auto flex-1 min-h-0 pe-1 custom-scrollbar">
        <ng-content></ng-content>
      </div>

      <!-- Column Footer Add Button -->
      <div class="pt-2 flex-shrink-0">
        <button 
          class="w-full py-2 rounded-lg bg-surface hover:bg-surface-alt text-on-surface-variant hover:text-brand-600 font-label-sm text-label-sm flex items-center justify-center gap-1 transition-all shadow-xs border border-border-subtle"
          (click)="addClick.emit()">
          <span class="material-symbols-outlined text-[16px]">add</span>
          <span>إضافة بطاقة جديدة</span>
        </button>
      </div>
    </div>
  `
})
export class KanbanColumn {
  title = input<string>();
  titleEn = input<string>(); // Retained in model/props for telemetry or debug, never rendered inline in UI
  statusKey = input<LeadStatusKey>();
  count = input<number>(0);
  addClick = output<void>();

  private statusConfig = computed(() => {
    const key = this.statusKey();
    if (key && key in LEAD_STATUS_CONFIG) {
      return LEAD_STATUS_CONFIG[key];
    }
    return null;
  });

  displayTitle = computed(() => {
    if (this.title()) return this.title();
    const cfg = this.statusConfig();
    return cfg ? cfg.label : '';
  });

  headerStyle = computed(() => {
    const cfg = this.statusConfig();
    if (cfg) {
      return {
        dot: cfg.text,
        ring: `${cfg.bg}`,
        badgeBg: cfg.bg,
        badgeText: cfg.text
      };
    }

    return {
      dot: '#4F46E5',
      ring: '#EEF2FF',
      badgeBg: '#EEF2FF',
      badgeText: '#4F46E5'
    };
  });
}

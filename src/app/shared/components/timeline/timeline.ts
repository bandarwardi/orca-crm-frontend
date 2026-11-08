import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
}

/**
 * Timeline Component
 * Displays a vertical list of events styled with Deep Indigo design tokens.
 */
@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col relative pt-1">
      <div class="absolute right-[13px] top-4 bottom-2 w-[2px] bg-border-subtle z-0"></div>
      
      @for (event of events(); track event.id; let last = $last) {
        <div class="relative z-10 flex gap-4" [class.mb-4]="!last">
          <div class="flex flex-col items-center">
            <div 
              class="w-7 h-7 rounded-full flex items-center justify-center ring-[3px] ring-surface shadow-xs mt-0.5"
              [ngClass]="getIconBgClasses(event.color)"
            >
              <span class="material-symbols-outlined text-[14px]">{{ event.icon || 'radio_button_checked' }}</span>
            </div>
          </div>
          
          <div class="flex flex-col pt-0.5 flex-1 group hover:bg-surface-alt/70 p-2 -mx-2 rounded-lg transition-colors">
            <div class="flex flex-col gap-0.5">
              <span class="font-label-md text-on-surface font-semibold group-hover:text-brand-600 transition-colors">{{ event.title }}</span>
              <span class="font-label-sm text-on-surface-variant text-[11px]">{{ event.timestamp }}</span>
            </div>
            @if (event.description) {
              <p class="font-body-sm text-on-surface-variant mt-1">{{ event.description }}</p>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class Timeline {
  events = input<TimelineEvent[]>([]);

  getIconBgClasses(color: TimelineEvent['color']): string {
    switch (color) {
      case 'primary':
        return 'bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300';
      case 'success':
        return 'bg-[#ECFDF5] text-[#059669] dark:bg-emerald-500/20 dark:text-emerald-300';
      case 'warning':
        return 'bg-[#FFFBEB] text-[#D97706] dark:bg-amber-500/20 dark:text-amber-300';
      case 'error':
        return 'bg-[#FFF1F2] text-[#E11D48] dark:bg-rose-500/20 dark:text-rose-300';
      default:
        return 'bg-surface-container text-on-surface-variant';
    }
  }
}

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QualityKpiItem } from '../../models/performance.models';

@Component({
  selector: 'app-quality-kpis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container flex flex-col gap-4">
      <div class="flex items-center justify-between pb-2 border-b border-surface-container">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-secondary text-[20px]">speed</span>
          <h3 class="font-headline-sm text-headline-sm text-on-surface">مؤشرات جودة الخدمة</h3>
        </div>
        <span class="w-2 h-2 rounded-full bg-secondary"></span>
      </div>

      <div class="grid grid-cols-2 gap-3">
        @for (item of kpis(); track item.title) {
          <div class="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1">
            <span class="font-label-sm text-label-sm text-on-surface-variant">{{ item.title }}</span>
            <span class="font-headline-sm text-headline-sm text-on-surface font-bold" dir="ltr">{{ item.value }}</span>
            <span
              [ngClass]="item.changeType === 'success' ? 'text-secondary' : 'text-primary'"
              class="font-body-sm text-[11px]">
              {{ item.change }}
            </span>
          </div>
        }
      </div>
    </div>
  `
})
export class QualityKpis {
  kpis = input<QualityKpiItem[]>([]);
}

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PackageSaleBreakdown } from '../../models/performance.models';

@Component({
  selector: 'app-package-breakdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container flex flex-col gap-4">
      <div class="flex items-center justify-between pb-2 border-b border-surface-container">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[20px]">pie_chart</span>
          <h3 class="font-headline-sm text-headline-sm text-on-surface">مبيعات الباقات</h3>
        </div>
        <span class="font-label-sm text-label-sm text-outline">الشهر الحالي</span>
      </div>

      <div class="flex flex-col gap-3.5">
        @for (item of packages(); track item.name) {
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between font-label-md text-label-md">
              <span class="text-on-surface font-medium">{{ item.name }}</span>
              <span class="font-semibold text-primary" dir="ltr">{{ item.percentageFormatted }} ({{ item.revenueFormatted }})</span>
            </div>
            <div class="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
              <div [class]="item.barColorClass + ' h-full rounded-full transition-all duration-500'" [style.width.%]="item.percentage"></div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class PackageBreakdown {
  packages = input<PackageSaleBreakdown[]>([]);
}

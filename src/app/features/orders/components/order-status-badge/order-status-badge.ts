import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-order-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (status()) {
      @case ('active') {
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#059669] dark:bg-emerald-500/20 dark:text-emerald-300 font-label-sm text-label-sm font-semibold tracking-tight">
          <span class="w-2 h-2 rounded-full bg-[#059669] dark:bg-emerald-400"></span>
          <span>{{ label() || 'نشط' }}</span>
        </span>
      }
      @case ('expiring') {
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFBEB] text-[#D97706] dark:bg-amber-500/20 dark:text-amber-300 font-label-sm text-label-sm font-semibold tracking-tight">
          <span class="w-2 h-2 rounded-full bg-[#D97706] dark:bg-amber-400 animate-pulse"></span>
          <span>{{ label() || 'ينتهي قريباً' }}</span>
        </span>
      }
      @case ('expired') {
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] text-[#E11D48] dark:bg-rose-500/20 dark:text-rose-300 font-label-sm text-label-sm font-semibold tracking-tight">
          <span class="w-2 h-2 rounded-full bg-[#F43F5E] dark:bg-rose-400"></span>
          <span>{{ label() || 'متأخر / منتهي' }}</span>
        </span>
      }
      @default {
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] text-[#475569] dark:bg-slate-700/40 dark:text-slate-200 font-label-sm text-label-sm font-semibold tracking-tight">
          <span class="w-2 h-2 rounded-full bg-[#475569] dark:bg-slate-300"></span>
          <span>{{ label() || 'غير محدد' }}</span>
        </span>
      }
    }
  `
})
export class OrderStatusBadge {
  status = input<OrderStatus | string>('active');
  label = input<string>('');
}

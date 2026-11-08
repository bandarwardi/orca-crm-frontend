import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadge } from '../status-badge/status-badge';

/**
 * DeviceCard Component
 * Displays a connected device with its MAC address and status using Deep Indigo tokens.
 */
@Component({
  selector: 'app-device-card',
  standalone: true,
  imports: [CommonModule, StatusBadge],
  template: `
    <div class="bg-surface rounded-xl border border-border-subtle p-4 flex flex-col gap-3 shadow-xs hover:bg-surface-alt transition-colors">
      <div class="flex justify-between items-start">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
            <span class="material-symbols-outlined">tv</span>
          </div>
          <div class="flex flex-col">
            <span class="font-headline-sm text-on-surface font-semibold">{{ deviceName() }}</span>
            <span class="font-label-sm text-on-surface-variant">آخر اتصال: {{ lastSeen() }}</span>
          </div>
        </div>
        <app-status-badge [status]="status()" [label]="statusLabel()"></app-status-badge>
      </div>
      
      <div class="h-px bg-border-subtle w-full"></div>
      
      <div class="flex items-center justify-between">
        <span class="font-label-sm text-on-surface-variant">MAC Address</span>
        <div class="flex items-center gap-1 bg-surface-container px-2 py-1 rounded">
          <span class="font-code-sm text-on-surface dir-ltr" dir="ltr">{{ macAddress() }}</span>
          <button class="text-on-surface-variant hover:text-brand-600 transition-colors flex" title="نسخ" (click)="copyMac()">
            <span class="material-symbols-outlined text-[14px]">content_copy</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class DeviceCard {
  deviceName = input<string>('Unknown Device');
  macAddress = input<string>('00:00:00:00:00:00');
  lastSeen = input<string>('الآن');
  status = input<'active' | 'pending' | 'expired' | 'default'>('active');

  statusLabel = computed(() => {
    switch (this.status()) {
      case 'active': return 'متصل';
      case 'expired': return 'مفصول';
      case 'pending': return 'جاري الاتصال';
      default: return 'غير معروف';
    }
  });

  copyMac(): void {
    navigator.clipboard.writeText(this.macAddress());
  }
}

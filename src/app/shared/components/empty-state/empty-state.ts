import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center p-8 text-center bg-surface border border-slate-200 rounded-xl">
      <div class="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
        <span class="material-symbols-outlined text-[32px]">{{ icon }}</span>
      </div>
      <h3 class="text-lg font-bold text-slate-800 mb-1">{{ title }}</h3>
      <p class="text-sm text-slate-500 max-w-md">{{ description }}</p>
      
      @if (actionLabel) {
        <button 
          (click)="action.emit()" 
          class="mt-6 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
          @if (actionIcon) {
            <span class="material-symbols-outlined text-[18px]">{{ actionIcon }}</span>
          }
          {{ actionLabel }}
        </button>
      }
    </div>
  `
})
export class EmptyState {
  @Input() icon = 'inbox';
  @Input() title = 'لا توجد بيانات';
  @Input() description = 'لم يتم العثور على أي سجلات مطابقة في الوقت الحالي.';
  @Input() actionLabel?: string;
  @Input() actionIcon?: string;
  @Output() action = new EventEmitter<void>();
}

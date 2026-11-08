import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * FilterPanel Component
 * Displays a slide-out panel for filtering lists using Deep Indigo tokens.
 */
@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex justify-end" (click)="close.emit()">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"></div>
        
        <!-- Panel -->
        <div 
          class="relative w-full max-w-md bg-surface border-s border-border-subtle h-full shadow-2xl flex flex-col transform transition-transform duration-300 rtl:translate-x-0"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between p-space-md border-b border-border-subtle">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[20px] text-on-surface-variant">filter_list</span>
              <h2 class="font-headline-md text-on-surface font-bold">{{ title() }}</h2>
            </div>
            <button class="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors" (click)="close.emit()">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-space-md flex flex-col gap-space-sm custom-scrollbar">
            <ng-content></ng-content>
          </div>
          
          <div class="p-space-md border-t border-border-subtle flex items-center gap-3 bg-surface">
            <button 
              class="flex-1 h-10 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors font-label-md font-semibold shadow-xs"
              (click)="onApply()"
            >
              تطبيق الفرز
            </button>
            <button 
              class="flex-1 h-10 rounded-lg bg-surface border border-border-subtle text-on-surface hover:bg-surface-alt transition-colors font-label-md"
              (click)="clear.emit()"
            >
              مسح
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class FilterPanel {
  isOpen = input<boolean>(false);
  title = input<string>('تصفية النتائج');
  
  close = output<void>();
  apply = output<void>();
  clear = output<void>();

  onApply(): void {
    this.apply.emit();
    this.close.emit();
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center p-8 text-center bg-red-50/50 border border-red-100 rounded-xl">
      <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
        <span class="material-symbols-outlined text-[32px]">error</span>
      </div>
      <h3 class="text-lg font-bold text-slate-800 mb-1">{{ title }}</h3>
      <p class="text-sm text-slate-600 max-w-md">{{ message }}</p>
      
      <button 
        (click)="retry.emit()" 
        class="mt-6 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
        <span class="material-symbols-outlined text-[18px]">refresh</span>
        إعادة المحاولة
      </button>
    </div>
  `
})
export class ErrorState {
  @Input() title = 'حدث خطأ ما';
  @Input() message = 'لم نتمكن من جلب البيانات. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.';
  @Output() retry = new EventEmitter<void>();
}

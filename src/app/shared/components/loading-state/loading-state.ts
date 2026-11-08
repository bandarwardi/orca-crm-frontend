import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (type === 'spinner') {
      <div class="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
        <div class="w-10 h-10 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
        <p class="text-sm text-slate-500 font-medium">{{ text }}</p>
      </div>
    } @else {
      <div class="space-y-4 w-full">
        @for (i of [1,2,3]; track i) {
          <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm animate-pulse flex gap-4">
            <div class="w-12 h-12 bg-slate-200 rounded-lg"></div>
            <div class="flex-1 space-y-3 py-1">
              <div class="h-4 bg-slate-200 rounded w-1/3"></div>
              <div class="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          </div>
        }
      </div>
    }
  `
})
export class LoadingState {
  @Input() type: 'spinner' | 'skeleton' = 'spinner';
  @Input() text = 'جاري التحميل...';
}

import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * TechnicalDataField Component
 * Reusable component for rendering hardware/network credentials (MAC addresses, Device Keys)
 * inside message bubbles or cards without direction mixing bugs.
 * Strictly scopes dir="ltr" and provides one-click copy with visual feedback.
 */
@Component({
  selector: 'app-technical-data-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-surface-container-low border border-border-subtle/80 font-code-sm text-xs select-all text-on-surface"
      dir="ltr"
    >
      <div class="flex items-center gap-1.5 min-w-0">
        <span class="text-outline text-[11px] font-medium tracking-tight select-none">
          {{ label() }}:
        </span>
        <span class="font-semibold text-primary font-mono truncate">
          {{ value() }}
        </span>
      </div>

      <button
        type="button"
        (click)="copyValue($event)"
        [title]="isCopied() ? 'تم النسخ!' : 'نسخ القيمة'"
        class="p-1 rounded hover:bg-surface-container transition-colors text-outline hover:text-primary flex items-center justify-center shrink-0"
      >
        @if (isCopied()) {
          <span class="material-symbols-outlined text-[15px] text-accent-emerald">done</span>
        } @else {
          <span class="material-symbols-outlined text-[15px]">content_copy</span>
        }
      </button>
    </div>
  `
})
export class TechnicalDataField {
  label = input.required<string>();
  value = input.required<string>();

  isCopied = signal(false);

  copyValue(event: Event): void {
    event.stopPropagation();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(this.value()).then(() => {
        this.isCopied.set(true);
        setTimeout(() => this.isCopied.set(false), 2000);
      });
    }
  }
}

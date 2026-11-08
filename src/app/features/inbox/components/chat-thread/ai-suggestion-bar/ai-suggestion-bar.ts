import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * AiSuggestionBarComponent
 * Fulfills B5: Distinct app-wide treatment for AI-crafted responses.
 * Highlights generated suggestions with a subtle violet gradient, prominent AI badge,
 * and clear distinction from manual composer actions.
 */
@Component({
  selector: 'app-ai-suggestion-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="px-space-sm sm:px-space-md py-2.5 bg-gradient-to-r from-brand-50/80 via-white to-indigo-50/40 dark:from-brand-950/40 dark:via-surface-dark dark:to-indigo-950/20 border-t border-b border-brand-500/20 flex items-center justify-between gap-3 select-none"
    >
      <div class="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0">
        <!-- Prominent AI Badge (B5) -->
        <span
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-600 text-white font-label-sm text-[10px] font-bold shadow-xs shrink-0"
        >
          <span class="material-symbols-outlined text-[13px]">auto_awesome</span>
          <span>مساعد ذكي</span>
        </span>

        <!-- Truncated Suggestion Preview -->
        <p
          class="font-body-sm text-[12px] text-on-surface truncate cursor-pointer hover:text-brand-600 transition-colors"
          [title]="suggestionText()"
          (click)="edit.emit()"
        >
          <span class="text-on-surface-variant font-normal">اقتراح رد:</span>
          "{{ suggestionText() }}"
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          (click)="insert.emit()"
          title="إرسال الرد الذكي فوراً"
          class="h-7 px-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-label-sm text-[11px] font-semibold flex items-center gap-1 transition-all shadow-xs active:scale-95"
        >
          <span class="material-symbols-outlined text-[14px]">send</span>
          <span>إدراج وإرسال</span>
        </button>

        <button
          type="button"
          (click)="edit.emit()"
          title="تعديل الرد في صندوق الكتابة قبل الإرسال (Tab)"
          class="h-7 px-2 rounded-lg bg-surface hover:bg-surface-container border border-border-subtle text-on-surface font-label-sm text-[11px] flex items-center gap-1 transition-colors"
        >
          <span class="material-symbols-outlined text-[14px]">edit</span>
          <span>تعديل</span>
        </button>
      </div>
    </section>
  `
})
export class AiSuggestionBarComponent {
  suggestionText = input.required<string>();
  insert = output<void>();
  edit = output<void>();
}

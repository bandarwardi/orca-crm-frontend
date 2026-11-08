import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeadNote } from '../../../state/leads.store';

@Component({
  selector: 'app-notes-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-3">
      <!-- Timeline Entries (Scrollable) -->
      <div class="flex flex-col gap-3 max-h-56 overflow-y-auto custom-scrollbar pe-1">
        @if (notes().length === 0) {
          <div class="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center text-on-surface-variant font-body-sm text-[12px]">
            لا توجد ملاحظات سابقة مسجلة لهذا العميل. يمكنك إضافة أول ملاحظة أدناه.
          </div>
        } @else {
          <div class="relative flex flex-col gap-3 ps-5">
            <!-- Continuous subtle vertical timeline line -->
            <div class="absolute inset-y-2 start-2 w-[2px] bg-outline-variant/40 pointer-events-none"></div>

            @for (note of notes(); track note.id) {
              <div class="relative flex flex-col gap-1 bg-surface-container-low/70 border border-outline-variant/30 rounded-xl p-3 shadow-2xs hover:border-outline-variant/60 transition-colors">
                <!-- Clean Minimal Timeline Dot (No type icon/circles) -->
                <div class="absolute -start-[17px] top-4 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface-container-lowest"></div>

                <!-- Note Header: Author + Timestamp Only (No type badges) -->
                <div class="flex items-center justify-between gap-2">
                  <span class="font-label-sm text-[12px] font-bold text-on-surface">{{ note.author }}</span>
                  <span class="font-code-sm text-[11px] text-on-surface-variant/80" dir="ltr">{{ note.timestamp }}</span>
                </div>

                <!-- Note Content -->
                <p class="font-body-sm text-[13px] text-on-surface leading-relaxed whitespace-pre-wrap mt-0.5">
                  {{ note.text }}
                </p>
              </div>
            }
          </div>
        }
      </div>

      <!-- Note Composer (Pinned at Bottom, Simplified with No Types) -->
      <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col gap-2">
        <div class="flex items-center justify-between gap-2">
          <span class="font-label-sm text-[12px] font-semibold text-on-surface flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-primary">add_comment</span>
            <span>إضافة ملاحظة جديدة</span>
          </span>
        </div>

        <div class="relative">
          <textarea 
            [(ngModel)]="newNoteText"
            (keydown.control.enter)="submitNote()"
            rows="2"
            placeholder="اكتب ملاحظة حول العميل..."
            class="w-full p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/60 font-body-sm text-[13px] text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none">
          </textarea>
        </div>

        <div class="flex items-center justify-between gap-2 pt-0.5">
          <span class="font-label-sm text-[11px] text-on-surface-variant/70">
            اختصار: اضغط <kbd class="px-1 py-0.5 rounded bg-surface-container border border-outline-variant/40 font-code-sm text-[10px]">Ctrl + Enter</kbd> للإضافة
          </span>
          <button 
            type="button" 
            [disabled]="!newNoteText().trim()"
            (click)="submitNote()"
            class="h-8 px-3.5 rounded-lg bg-primary hover:bg-primary-container text-white font-label-sm text-[12px] font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-2xs">
            <span class="material-symbols-outlined text-[15px]">send</span>
            <span>إضافة ملاحظة</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class NotesTimeline {
  notes = input<LeadNote[]>([]);
  addNote = output<{ text: string }>();

  newNoteText = signal<string>('');

  submitNote() {
    const text = this.newNoteText().trim();
    if (!text) return;
    this.addNote.emit({ text });
    this.newNoteText.set('');
  }
}

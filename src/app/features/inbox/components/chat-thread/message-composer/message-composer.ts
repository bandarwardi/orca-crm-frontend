import {
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  input,
  signal,
  OnDestroy,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import 'emoji-picker-element';
import { InboxStore } from '../../../store/inbox.store';
import { MessagingChannel, WhatsAppTemplate } from '../../../models/inbox.models';

export interface CannedItem {
  id: string;
  title: string;
  text: string;
  category: string;
}

interface SelectedAttachment {
  file: File;
  dataUrl: string;
  type: 'image' | 'document';
  fileName: string;
  fileSize: string;
}

/**
 * MessageComposerComponent
 * Fully functional WhatsApp/Omnichannel Message Composer:
 * 1. Meta-Approved Official Templates selector & sender
 * 2. Quick Canned Replies with search and custom response creation
 * 3. Real Media & File Attachments (Images, PDFs, Documents) with live preview
 * 4. Interactive Emoji Picker categorized with search
 * 5. Real Voice Note Audio Recorder (MediaRecorder API) with live timer & waveforms
 * 6. Dynamic Channel & WhatsApp Multi-Account selector matching exact UI design
 */
@Component({
  selector: 'app-message-composer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <footer class="p-space-sm bg-surface border-t border-border-subtle relative select-none">
      <!-- Hidden File Inputs -->
      <input
        #imageInput
        type="file"
        accept="image/*"
        class="hidden"
        (change)="onFileSelected($event, 'image')"
      />
      <input
        #docInput
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
        class="hidden"
        (change)="onFileSelected($event, 'document')"
      />

      <!-- 1. Quick Replies (Canned Responses) Floating Menu -->
      @if (showQuickReplies()) {
        <div
          class="absolute bottom-full start-4 mb-2 w-80 sm:w-96 bg-surface rounded-2xl shadow-2xl border border-border-subtle p-3 z-30 transition-all animate-in fade-in slide-in-from-bottom-2"
        >
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle text-xs font-bold text-on-surface">
            <span class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px] text-amber-500">bolt</span>
              <span>ردود سريعة جاهزة</span>
            </span>
            <div class="flex items-center gap-1">
              <button
                type="button"
                (click)="isAddingNewCanned.set(!isAddingNewCanned())"
                class="px-2 py-0.5 rounded-md bg-brand-50 hover:bg-brand-100 text-brand-600 text-[11px] font-semibold transition-colors flex items-center gap-0.5"
                title="إضافة رد جديد"
              >
                <span class="material-symbols-outlined text-[14px]">add</span>
                <span>جديد</span>
              </button>
              <button
                type="button"
                (click)="showQuickReplies.set(false)"
                class="w-6 h-6 rounded-md hover:bg-surface-container text-outline hover:text-on-surface flex items-center justify-center"
              >
                <span class="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>

          <!-- New Quick Reply Form -->
          @if (isAddingNewCanned()) {
            <div class="p-2 mb-2 rounded-xl bg-surface-container-low border border-brand-500/30 space-y-2">
              <div class="text-[11px] font-bold text-brand-600">إنشاء رد سريع جديد</div>
              <input
                type="text"
                [(ngModel)]="newCannedTitle"
                placeholder="عنوان الرد (مثال: بيانات السداد)"
                class="w-full h-7 px-2 text-xs rounded-lg border border-border-subtle bg-surface text-on-surface focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <textarea
                [(ngModel)]="newCannedText"
                rows="2"
                placeholder="نص الرد الذي سيتم إدراجه في المحادثة..."
                class="w-full p-2 text-xs rounded-lg border border-border-subtle bg-surface text-on-surface focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
              ></textarea>
              <div class="flex justify-end gap-1.5">
                <button
                  type="button"
                  (click)="isAddingNewCanned.set(false)"
                  class="px-2.5 py-1 text-[11px] rounded-md hover:bg-surface text-outline"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  (click)="saveNewCanned()"
                  [disabled]="!newCannedTitle.trim() || !newCannedText.trim()"
                  class="px-2.5 py-1 text-[11px] rounded-md bg-brand-600 hover:bg-brand-700 text-white font-semibold disabled:opacity-50"
                >
                  حفظ
                </button>
              </div>
            </div>
          }

          <!-- Search Canned -->
          <div class="mb-2 relative">
            <span class="material-symbols-outlined absolute start-2 top-2 text-[16px] text-outline">search</span>
            <input
              type="text"
              [(ngModel)]="searchCannedQuery"
              placeholder="ابحث في الردود..."
              class="w-full h-8 ps-7 pe-2.5 text-xs rounded-lg bg-surface-container-low border border-border-subtle text-on-surface focus:outline-none focus:bg-surface focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <!-- Canned List -->
          <div class="space-y-1 max-h-56 overflow-y-auto custom-scrollbar pe-1">
            @for (reply of filteredCannedList(); track reply.id) {
              <button
                type="button"
                (click)="applyCanned(reply.text)"
                class="w-full text-start p-2 rounded-xl text-xs hover:bg-surface-container text-on-surface transition-colors border border-transparent hover:border-border-subtle group block"
              >
                <div class="font-bold flex items-center justify-between text-on-surface mb-0.5">
                  <span>{{ reply.title }}</span>
                  <span class="text-[10px] text-outline font-normal px-1.5 py-0.2 rounded bg-surface-container-high">{{ reply.category }}</span>
                </div>
                <div class="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">
                  {{ reply.text }}
                </div>
              </button>
            }
            @if (filteredCannedList().length === 0) {
              <div class="text-center py-4 text-xs text-outline">
                لا توجد ردود مطابقة للبحث
              </div>
            }
          </div>
        </div>
      }

      <!-- 2. WhatsApp Official Templates Modal -->
      @if (showTemplatesModal()) {
        <div
          class="absolute bottom-full start-4 end-4 sm:end-auto sm:w-[500px] mb-2 bg-surface rounded-2xl shadow-2xl border border-border-subtle p-3.5 z-40 transition-all animate-in fade-in slide-in-from-bottom-2"
        >
          <div class="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border-subtle">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[20px] text-[#25D366]">verified</span>
              <div>
                <h4 class="text-xs font-bold text-on-surface">قوالب واتساب الرسمية المعتمدة من Meta</h4>
                <p class="text-[11px] text-outline">صالح للإرسال في أي وقت حتى لو انتهت مهلة الـ 24 ساعة</p>
              </div>
            </div>
            <button
              type="button"
              (click)="showTemplatesModal.set(false)"
              class="w-7 h-7 rounded-lg hover:bg-surface-container text-outline hover:text-on-surface flex items-center justify-center transition-colors"
            >
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <!-- Template Category Tabs & Search -->
          <div class="flex items-center gap-2 mb-2.5">
            <div class="flex-1 relative">
              <span class="material-symbols-outlined absolute start-2 top-2 text-[16px] text-outline">search</span>
              <input
                type="text"
                [(ngModel)]="searchTemplateQuery"
                placeholder="بحث في القوالب المعتمدة..."
                class="w-full h-8 ps-7 pe-2 text-xs rounded-lg bg-surface-container-low border border-border-subtle text-on-surface focus:outline-none focus:bg-surface focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div class="flex gap-1 bg-surface-container-low p-0.5 rounded-lg border border-border-subtle text-[11px] shrink-0">
              <button
                type="button"
                (click)="selectedTemplateCategory.set('ALL')"
                class="px-2 py-1 rounded-md transition-colors font-medium"
                [class.bg-surface]="selectedTemplateCategory() === 'ALL'"
                [class.text-brand-600]="selectedTemplateCategory() === 'ALL'"
                [class.shadow-2xs]="selectedTemplateCategory() === 'ALL'"
              >
                الكل
              </button>
              <button
                type="button"
                (click)="selectedTemplateCategory.set('UTILITY')"
                class="px-2 py-1 rounded-md transition-colors font-medium"
                [class.bg-surface]="selectedTemplateCategory() === 'UTILITY'"
                [class.text-emerald-600]="selectedTemplateCategory() === 'UTILITY'"
                [class.shadow-2xs]="selectedTemplateCategory() === 'UTILITY'"
              >
                خدمي
              </button>
              <button
                type="button"
                (click)="selectedTemplateCategory.set('MARKETING')"
                class="px-2 py-1 rounded-md transition-colors font-medium"
                [class.bg-surface]="selectedTemplateCategory() === 'MARKETING'"
                [class.text-blue-600]="selectedTemplateCategory() === 'MARKETING'"
                [class.shadow-2xs]="selectedTemplateCategory() === 'MARKETING'"
              >
                تسويقي
              </button>
            </div>
          </div>

          <div class="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pe-1">
            @for (tpl of filteredTemplates(); track tpl.id) {
              <div
                class="p-3 rounded-xl border border-border-subtle bg-surface-container-low hover:border-brand-500/40 transition-all flex flex-col gap-2"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-on-surface">{{ tpl.title }}</span>
                    <span class="text-[10px] text-outline font-code-sm" dir="ltr">({{ tpl.name }})</span>
                  </div>
                  <span
                    class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    [class.bg-emerald-100]="tpl.category === 'UTILITY'"
                    [class.text-emerald-800]="tpl.category === 'UTILITY'"
                    [class.dark:bg-emerald-950]="tpl.category === 'UTILITY'"
                    [class.dark:text-emerald-300]="tpl.category === 'UTILITY'"
                    [class.bg-blue-100]="tpl.category === 'MARKETING'"
                    [class.text-blue-800]="tpl.category === 'MARKETING'"
                  >
                    {{ tpl.category === 'UTILITY' ? 'خدمي (Utility)' : 'تسويقي (Marketing)' }}
                  </span>
                </div>
                <p class="text-[11px] text-on-surface-variant leading-relaxed bg-surface p-2.5 rounded-lg border border-border-subtle/60">
                  {{ tpl.previewText }}
                </p>
                <div class="flex items-center justify-between pt-0.5">
                  <span class="text-[10px] text-outline">لغة القالب: العربية (ar)</span>
                  <button
                    type="button"
                    (click)="onSendTemplate(tpl)"
                    class="px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>إرسال هذا القالب للعميل</span>
                    <span class="material-symbols-outlined text-[15px] rtl:-scale-x-100">send</span>
                  </button>
                </div>
              </div>
            }
            @if (filteredTemplates().length === 0) {
              <div class="text-center py-6 text-xs text-outline">
                لا توجد قوالب مطابقة للبحث
              </div>
            }
          </div>
        </div>
      }

      <!-- 3. Attachment Menu Popover -->
      @if (showAttachmentMenu()) {
        <div
          class="absolute bottom-full start-28 mb-2 w-48 bg-surface rounded-xl shadow-xl border border-border-subtle p-1.5 z-30 transition-all animate-in fade-in slide-in-from-bottom-2"
        >
          <button
            type="button"
            (click)="triggerImageSelect()"
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-surface-container text-on-surface transition-colors text-start"
          >
            <div class="w-7 h-7 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[18px]">image</span>
            </div>
            <div>
              <div class="font-bold">إرفاق صورة</div>
              <div class="text-[10px] text-outline">PNG, JPG, WebP</div>
            </div>
          </button>
          <button
            type="button"
            (click)="triggerDocSelect()"
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-surface-container text-on-surface transition-colors text-start"
          >
            <div class="w-7 h-7 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[18px]">description</span>
            </div>
            <div>
              <div class="font-bold">إرفاق مستند أو ملف</div>
              <div class="text-[10px] text-outline">PDF, Word, Excel</div>
            </div>
          </button>
        </div>
      }

      <!-- 4. Full-Featured Emoji Picker Library Popover -->
      @if (showEmojiPicker()) {
        <div
          class="absolute bottom-full start-6 sm:start-24 mb-2 z-40 bg-surface rounded-2xl shadow-2xl border border-border-subtle overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-2"
          style="width: min(340px, calc(100vw - 2rem));"
        >
          <div class="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-surface-container-low text-xs font-bold text-on-surface select-none">
            <span class="flex items-center gap-1.5">
              <span>😊</span>
              <span>الرموز التعبيرية</span>
            </span>
            <button
              type="button"
              (click)="showEmojiPicker.set(false)"
              class="w-6 h-6 rounded-md hover:bg-surface-container text-outline hover:text-on-surface flex items-center justify-center transition-colors"
            >
              <span class="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
          <emoji-picker
            (emoji-click)="onEmojiSelect($event)"
            class="light block w-full"
            style="height: 380px; width: 100%; border: none; --num-columns: 8;"
          ></emoji-picker>
        </div>
      }

      <!-- Selected Attachment Preview Banner (Above Input) -->
      @if (selectedAttachment(); as att) {
        <div class="mb-2 p-2 rounded-xl bg-surface-container-low border border-border-subtle flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-1">
          <div class="flex items-center gap-2.5 min-w-0">
            @if (att.type === 'image') {
              <img [src]="att.dataUrl" class="w-10 h-10 rounded-lg object-cover border border-border-subtle shrink-0" alt="Preview" />
            } @else {
              <div class="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[22px]">description</span>
              </div>
            }
            <div class="min-w-0">
              <div class="text-xs font-bold text-on-surface truncate">{{ att.fileName }}</div>
              <div class="text-[10px] text-outline font-code-sm" dir="ltr">{{ att.fileSize }}</div>
            </div>
          </div>
          <button
            type="button"
            (click)="removeAttachment()"
            class="w-7 h-7 rounded-lg hover:bg-surface-container text-outline hover:text-error flex items-center justify-center transition-colors"
            title="إلغاء المرفق"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      }

      <!-- Top Row: Grouped Quick Tools Toolbar (B7) matching User Screenshot -->
      <div class="flex items-center justify-between mb-2">
        <!-- Group 1: Augmentation icons -->
        <div class="flex items-center gap-1">
          <!-- WhatsApp Official Templates button -->
          <button
            type="button"
            (click)="toggleTemplatesModal()"
            class="h-8 px-2.5 rounded-lg border border-[#25D366]/40 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] flex items-center gap-1.5 transition-colors text-xs font-bold cursor-pointer"
            title="إرسال قالب واتساب رسمي معتمد"
          >
            <span class="material-symbols-outlined text-[17px]">verified</span>
            <span>قوالب معتمدة</span>
            @if (!store.is24HoursWindowOpen()) {
              <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="مطلوب لإعادة فتح المحادثة"></span>
            }
          </button>

          <!-- Canned Responses / Quick Macros button -->
          <button
            type="button"
            (click)="toggleQuickReplies()"
            class="h-8 px-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-brand-600 flex items-center gap-1 transition-colors text-xs font-semibold cursor-pointer"
            title="ردود سريعة جاهزة"
          >
            <span class="material-symbols-outlined text-[18px] text-amber-500">bolt</span>
            <span class="hidden sm:inline">رد سريع</span>
          </button>

          <div class="h-4 w-px bg-border-subtle mx-1"></div>

          <!-- Attachment -->
          <button
            type="button"
            (click)="toggleAttachmentMenu()"
            class="w-8 h-8 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
            [class.bg-brand-50]="selectedAttachment()"
            [class.text-brand-600]="selectedAttachment()"
            title="إرفاق ملف أو صورة"
          >
            <span class="material-symbols-outlined text-[19px]">attach_file</span>
          </button>

          <!-- Emoji Picker -->
          <button
            type="button"
            (click)="toggleEmojiPicker()"
            class="w-8 h-8 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
            [class.bg-amber-50]="showEmojiPicker()"
            title="إضافة رمز تعبيري"
          >
            <span class="material-symbols-outlined text-[19px]">mood</span>
          </button>

          <!-- Voice Mic -->
          <button
            type="button"
            (click)="startVoiceRecording()"
            class="w-8 h-8 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
            title="تسجيل رسالة صوتية"
          >
            <span class="material-symbols-outlined text-[19px]">mic</span>
          </button>
        </div>

        <!-- Group 2: Channel Selector Dropdown matching User Screenshot Pixel-For-Pixel -->
        <div class="flex items-center gap-1.5">
          <span class="font-label-sm text-[11px] text-outline font-medium">القناة:</span>
          <div class="relative">
            <button
              type="button"
              (click)="isChannelDropdownOpen.update(v => !v)"
              class="h-8 px-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container border border-border-subtle flex items-center gap-1.5 text-xs font-semibold text-on-surface transition-colors cursor-pointer shadow-2xs"
            >
              @if (store.selectedChannel() === 'whatsapp') {
                <span class="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-xs"></span>
                <span class="text-[#065f46] dark:text-emerald-400 font-bold max-w-[170px] truncate">
                  واتساب ({{ currentWhatsAppAccountName() }})
                </span>
              } @else if (store.selectedChannel() === 'sms') {
                <span class="w-2.5 h-2.5 rounded-full bg-brand-500 shadow-xs"></span>
                <span class="text-brand-700 dark:text-brand-300 font-bold">رسالة SMS</span>
              } @else {
                <span class="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs"></span>
                <span class="font-bold">RingCentral</span>
              }
              <span class="material-symbols-outlined text-[16px] text-outline">arrow_drop_down</span>
            </button>

            <!-- Channel & WhatsApp Account Selector Menu -->
            @if (isChannelDropdownOpen()) {
              <div
                class="absolute bottom-full end-0 mb-1 w-64 bg-surface rounded-2xl shadow-2xl border border-border-subtle p-2 z-30 space-y-1.5 text-xs animate-in fade-in slide-in-from-bottom-1"
              >
                <!-- Section 1: WhatsApp Accounts -->
                <div class="text-[10px] font-bold text-outline uppercase tracking-wider px-2 pt-1">
                  أرقام واتساب المربوطة
                </div>

                @for (acc of store.whatsappAccounts(); track acc.id) {
                  <button
                    type="button"
                    (click)="selectWhatsAppAccount(acc.id)"
                    class="w-full flex items-center justify-between p-2 rounded-xl hover:bg-surface-container text-start transition-colors"
                    [class.bg-emerald-50]="store.selectedChannel() === 'whatsapp' && store.selectedWhatsAppAccountId() === acc.id"
                    [class.dark:bg-emerald-950/40]="store.selectedChannel() === 'whatsapp' && store.selectedWhatsAppAccountId() === acc.id"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="w-2 h-2 rounded-full bg-[#10b981] shrink-0"></span>
                      <div class="min-w-0">
                        <div class="font-bold text-on-surface truncate">{{ acc.name }}</div>
                        <div class="text-[10px] text-outline font-code-sm" dir="ltr">{{ acc.phone_number }}</div>
                      </div>
                    </div>
                    @if (store.selectedChannel() === 'whatsapp' && store.selectedWhatsAppAccountId() === acc.id) {
                      <span class="material-symbols-outlined text-[16px] text-[#10b981] font-bold">check</span>
                    }
                  </button>
                }

                @if (store.whatsappAccounts().length === 0) {
                  <button
                    type="button"
                    (click)="setChannel('whatsapp')"
                    class="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-surface-container text-start"
                  >
                    <span class="w-2 h-2 rounded-full bg-[#10b981]"></span>
                    <span>واتساب رسمي (الافتراضي)</span>
                  </button>
                }

                <div class="h-px bg-border-subtle my-1"></div>

                <!-- Section 2: Other Channels -->
                <div class="text-[10px] font-bold text-outline uppercase tracking-wider px-2">
                  قنوات المراسلة البديلة
                </div>

                <button
                  type="button"
                  (click)="setChannel('sms')"
                  class="w-full flex items-center justify-between p-2 rounded-xl hover:bg-surface-container text-start transition-colors"
                  [class.bg-brand-50]="store.selectedChannel() === 'sms'"
                >
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-brand-500"></span>
                    <span class="font-medium">رسالة نصية SMS</span>
                  </div>
                  @if (store.selectedChannel() === 'sms') {
                    <span class="material-symbols-outlined text-[16px] text-brand-600 font-bold">check</span>
                  }
                </button>

                <button
                  type="button"
                  (click)="setChannel('ringcentral')"
                  class="w-full flex items-center justify-between p-2 rounded-xl hover:bg-surface-container text-start transition-colors"
                  [class.bg-purple-50]="store.selectedChannel() === 'ringcentral'"
                >
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span class="font-medium">RingCentral Telephony</span>
                  </div>
                  @if (store.selectedChannel() === 'ringcentral') {
                    <span class="material-symbols-outlined text-[16px] text-purple-600 font-bold">check</span>
                  }
                </button>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Live Voice Recording Bar (Replaces Input Row when recording) -->
      @if (isRecordingVoice()) {
        <div class="h-11 px-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div class="flex items-center gap-2.5">
            <span class="w-3 h-3 rounded-full bg-rose-600 animate-pulse"></span>
            <span class="text-xs font-bold text-rose-700 dark:text-rose-300">جاري تسجيل رسالة صوتية...</span>
            <span class="text-xs font-code-sm font-bold text-rose-900 dark:text-rose-200 bg-rose-200/60 dark:bg-rose-900/80 px-2 py-0.5 rounded-md" dir="ltr">
              {{ formatRecordingTime(recordingSeconds()) }}
            </span>

            @if (isMicSilentWarning()) {
              <span class="hidden md:inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800 animate-pulse">
                <span class="material-symbols-outlined text-[13px]">mic_off</span>
                <span>الصوت غير مسموع (تأكد من الميكروفون)</span>
              </span>
            }
          </div>

          <!-- Dynamic Soundwave Bars reacting to REAL mic volume -->
          <div class="hidden sm:flex items-center gap-1 h-5 px-2 bg-surface/50 rounded-lg border border-border-subtle" title="مستوى صوت الميكروفون اللحظي">
            <span class="w-1 bg-rose-500 rounded-full transition-all duration-75" [style.height.px]="getWaveBarHeight(0)"></span>
            <span class="w-1 bg-rose-500 rounded-full transition-all duration-75" [style.height.px]="getWaveBarHeight(1)"></span>
            <span class="w-1 bg-rose-500 rounded-full transition-all duration-75" [style.height.px]="getWaveBarHeight(2)"></span>
            <span class="w-1 bg-rose-500 rounded-full transition-all duration-75" [style.height.px]="getWaveBarHeight(3)"></span>
            <span class="w-1 bg-rose-500 rounded-full transition-all duration-75" [style.height.px]="getWaveBarHeight(4)"></span>
          </div>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              (click)="cancelVoiceRecording()"
              class="h-8 px-3 rounded-lg hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span class="material-symbols-outlined text-[16px]">delete</span>
              <span>إلغاء</span>
            </button>
            <button
              type="button"
              (click)="finishAndSendVoiceRecording()"
              class="h-8 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>إرسال التسجيل</span>
              <span class="material-symbols-outlined text-[16px] rtl:-scale-x-100">send</span>
            </button>
          </div>
        </div>
      } @else {
        <!-- Standard Input Box & Primary Send Button -->
        <div class="flex items-center gap-2">
          <div class="flex-1 relative">
            <input
              #inputEl
              type="text"
              [ngModel]="store.composerText()"
              (ngModelChange)="store.setComposerText($event)"
              (keydown)="onKeyDown($event)"
              class="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 border border-transparent shadow-xs transition-all"
              [placeholder]="placeholderText()"
            />
          </div>

          <button
            type="button"
            (click)="onSend()"
            [disabled]="!canSend()"
            class="h-11 px-5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-label-md text-label-md font-semibold flex items-center gap-2 shadow-sm transition-all shrink-0 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>إرسال</span>
            <span class="material-symbols-outlined text-[18px] rtl:-scale-x-100">send</span>
          </button>
        </div>
      }
    </footer>
  `
})
export class MessageComposerComponent implements OnDestroy {
  readonly store = inject(InboxStore);

  recipientName = input<string>('العميل');

  @ViewChild('inputEl') inputEl?: ElementRef<HTMLInputElement>;
  @ViewChild('imageInput') imageInput?: ElementRef<HTMLInputElement>;
  @ViewChild('docInput') docInput?: ElementRef<HTMLInputElement>;

  showQuickReplies = signal(false);
  showTemplatesModal = signal(false);
  showAttachmentMenu = signal(false);
  showEmojiPicker = signal(false);
  isChannelDropdownOpen = signal(false);

  // Attachment state
  selectedAttachment = signal<SelectedAttachment | null>(null);

  // Audio recording state
  isRecordingVoice = signal(false);
  recordingSeconds = signal(0);
  currentAudioLevel = signal(0);
  isMicSilentWarning = signal(false);
  private hasDetectedAudio = false;
  private activeRecordingSessionId = 0;
  private mediaRecorder: MediaRecorder | null = null;
  private recordingInterval: any = null;
  private currentStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private volumeAnimFrame: number | null = null;

  // Canned replies
  searchCannedQuery = signal('');
  isAddingNewCanned = signal(false);
  newCannedTitle = '';
  newCannedText = '';

  private defaultCannedList: CannedItem[] = [
    {
      id: 'c1',
      title: 'ترحيب وتأكيد استلام',
      text: 'أهلاً بك أستاذنا الكريم! تم استلام طلبك وجاري مراجعته الآن على الفور.',
      category: 'ترحيب'
    },
    {
      id: 'c2',
      title: 'طلب بيانات الماك والكي (MAC & Device Key)',
      text: 'يرجى تزويدنا بـ MAC Address ومفتاح الجهاز (Device Key) الظاهرين على شاشتك لإتمام تفعيل القنوات.',
      category: 'تفعيل'
    },
    {
      id: 'c3',
      title: 'تأكيد التفعيل الكامل',
      text: 'تم إدخال البيانات في النظام وتفعيل باقة القنوات بنجاح، يمكنك الآن إعادة تشغيل التطبيق والاستمتاع بالمشاهدة!',
      category: 'تفعيل'
    },
    {
      id: 'c4',
      title: 'رابط سداد التجديد السنوي',
      text: 'تفضل هذا رابط السداد الآمن لتجديد الاشتراك السنوي مع الاستفادة من الخصم المتاح.',
      category: 'سداد'
    },
    {
      id: 'c5',
      title: 'حل مشكلة التقطيع وإعادة التشغيل',
      text: 'يرجى تجربة الخطوات التالية: 1. إعادة تشغيل الراوتر والشاشة. 2. تغيير مشغل الفيديو من إعدادات التطبيق إلى ExoPlayer/VLC.',
      category: 'دعم فني'
    },
    {
      id: 'c6',
      title: 'متابعة بعد انتهاء الصيانة',
      text: 'نود التأكد من أن المشكلة التقنية قد تم حلها وأن القنوات تعمل لديك بسلاسة الآن. هل تحتاج إلى أي مساعدة إضافية؟',
      category: 'دعم فني'
    }
  ];

  cannedList = signal<CannedItem[]>(this.loadCannedReplies());

  // Templates
  searchTemplateQuery = signal('');
  selectedTemplateCategory = signal<'ALL' | 'UTILITY' | 'MARKETING'>('ALL');

  // Emojis
  selectedEmojiCategory = signal<'common' | 'iptv' | 'sales'>('common');

  private emojiData = {
    common: ['👍', '❤️', '😊', '🙏', '👋', '🎉', '🔥', '⭐', '✅', '👏', '🤝', '🙌', '💯', '🤩', '💐', '🌹', '🎯', '✨', '😃', '👌', '💪'],
    iptv: ['📺', '📡', '🎬', '🍿', '⚽', '🏆', '📶', '📱', '💻', '🖥️', '🔌', '⚙️', '🛠️', '💡', '🎵', '🌐', '🎮', '🔊', '🔋'],
    sales: ['💳', '💵', '💰', '🛒', '🏷️', '📦', '⚡', '🔔', '🔒', '⏳', '📄', '📞', '💬', '🚀', '🎁', '📅', '📝', '🛍️']
  };

  currentEmojiList = computed(() => {
    return this.emojiData[this.selectedEmojiCategory()] || this.emojiData.common;
  });

  filteredCannedList = computed(() => {
    const q = this.searchCannedQuery().trim().toLowerCase();
    if (!q) return this.cannedList();
    return this.cannedList().filter(
      item => item.title.toLowerCase().includes(q) || item.text.toLowerCase().includes(q)
    );
  });

  filteredTemplates = computed(() => {
    let list = this.store.templates();
    const cat = this.selectedTemplateCategory();
    if (cat !== 'ALL') {
      list = list.filter(t => t.category === cat);
    }
    const q = this.searchTemplateQuery().trim().toLowerCase();
    if (q) {
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.previewText.toLowerCase().includes(q));
    }
    return list;
  });

  currentWhatsAppAccountName = computed(() => {
    const active = this.store.selectedWhatsAppAccount();
    if (active) return active.name;
    const all = this.store.whatsappAccounts();
    return all.length > 0 ? all[0].name : 'الواتساب الاساسي';
  });

  canSend = computed(() => {
    return !!this.selectedAttachment() || !!this.store.composerText().trim();
  });

  placeholderText(): string {
    if (this.selectedAttachment()) {
      return 'اكتب تعليقاً على المرفق (اختياري)...';
    }
    if (!this.store.is24HoursWindowOpen()) {
      return 'نافذة الـ 24 ساعة مغلقة — اختر قالباً معتمداً لبدء المحادثة...';
    }
    const name = (this.recipientName() || '').trim();
    const isRealName = name && !name.startsWith('+') && !/^\d+$/.test(name.replace(/[\s\-\(\)]/g, '')) && name !== 'غير معروف';
    const smartHint = this.store.activeAiSuggestion() ? ' (اضغط Tab للرد الذكي)' : '';
    return isRealName ? `اكتب ردك هنا إلى ${name}...${smartHint}` : `اكتب رسالتك هنا...${smartHint}`;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSend();
    } else if (event.key === 'Tab' && !this.store.composerText().trim()) {
      event.preventDefault();
      this.store.applyAiSuggestionToComposer();
    }
  }

  onSend(): void {
    const att = this.selectedAttachment();
    if (att) {
      this.store.sendAttachmentMessage({
        file: att.file,
        dataUrl: att.dataUrl,
        type: att.type,
        fileName: att.fileName,
        fileSize: att.fileSize,
        caption: this.store.composerText().trim() || undefined,
      });
      this.selectedAttachment.set(null);
    } else {
      this.store.sendCurrentMessage();
    }
  }

  // --- Attachments ---
  toggleAttachmentMenu(): void {
    this.closeOtherModals();
    this.showAttachmentMenu.update(v => !v);
  }

  triggerImageSelect(): void {
    this.showAttachmentMenu.set(false);
    this.imageInput?.nativeElement.click();
  }

  triggerDocSelect(): void {
    this.showAttachmentMenu.set(false);
    this.docInput?.nativeElement.click();
  }

  onFileSelected(event: Event, type: 'image' | 'document'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const sizeKb = Math.round(file.size / 1024);
      const sizeText = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

      this.selectedAttachment.set({
        file,
        dataUrl,
        type,
        fileName: file.name,
        fileSize: sizeText,
      });
      input.value = '';
      this.focusInput();
    };
    reader.readAsDataURL(file);
  }

  removeAttachment(): void {
    this.selectedAttachment.set(null);
  }

  // --- Emojis ---
  toggleEmojiPicker(): void {
    this.closeOtherModals();
    this.showEmojiPicker.update(v => !v);
  }

  insertEmoji(emoji: string): void {
    const current = this.store.composerText();
    this.store.setComposerText(current + emoji);
    this.focusInput();
  }

  onEmojiSelect(event: any): void {
    const emoji = event?.detail?.unicode || event?.detail?.emoji?.unicode;
    if (emoji) {
      this.insertEmoji(emoji);
    }
  }

  // --- Voice Recording ---
  async startVoiceRecording(): Promise<void> {
    this.closeOtherModals();
    this.hasDetectedAudio = false;
    this.currentAudioLevel.set(0);
    this.isMicSilentWarning.set(false);

    // Cancel and cleanly clean up any lingering prior recording
    this.cancelVoiceRecording();

    const sessionId = ++this.activeRecordingSessionId;
    const sessionChunks: Blob[] = [];

    try {
      // 1. Clean audio constraints without destructive noise-gating
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: true,
          },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      if (this.activeRecordingSessionId !== sessionId) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      this.currentStream = stream;

      // 2. Real-time audio analyser via Web Audio API
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
          if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
          }
          const source = this.audioContext.createMediaStreamSource(stream);
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 256;
          this.analyser.smoothingTimeConstant = 0.4;
          source.connect(this.analyser);

          const bufferLength = this.analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const updateVolume = () => {
            if (!this.isRecordingVoice() || !this.analyser || this.activeRecordingSessionId !== sessionId) return;
            this.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const avg = sum / bufferLength;
            const level = Math.min(100, Math.round((avg / 128) * 100));
            this.currentAudioLevel.set(level);

            if (level > 4) {
              this.hasDetectedAudio = true;
              this.isMicSilentWarning.set(false);
            } else if (this.recordingSeconds() >= 2 && !this.hasDetectedAudio) {
              this.isMicSilentWarning.set(true);
            }

            this.volumeAnimFrame = requestAnimationFrame(updateVolume);
          };
          this.volumeAnimFrame = requestAnimationFrame(updateVolume);
        }
      } catch (audioCtxErr) {
        console.warn('Web Audio API analyser not initialized:', audioCtxErr);
      }

      // 3. Audio format
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '';
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      this.mediaRecorder = recorder;

      recorder.ondataavailable = event => {
        if (this.activeRecordingSessionId === sessionId && event.data && event.data.size > 0) {
          sessionChunks.push(event.data);
        }
      };

      // Start without timeslice to generate a single, complete, valid WebM container when stopped
      recorder.start();
      this.isRecordingVoice.set(true);
      this.recordingSeconds.set(0);

      this.recordingInterval = setInterval(() => {
        this.recordingSeconds.update(s => s + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      const isDenied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      const msg = isDenied
        ? 'تم حظر الوصول إلى الميكروفون من قِبل المتصفح. يرجى تفعيل إذن الميكروفون من إعدادات المتصفح أو شريط العنوان.'
        : 'تعذر تشغيل الميكروفون. يرجى التأكد من توصيل الميكروفون وتشغيله في إعدادات نظام ويندوز.';
      alert(msg);
      this.cancelVoiceRecording();
    }
  }

  getWaveBarHeight(barIndex: number): number {
    const level = this.currentAudioLevel();
    if (level <= 0) return 4;
    const multipliers = [0.15, 0.22, 0.32, 0.24, 0.16];
    const mult = multipliers[barIndex] || 0.2;
    return Math.min(22, Math.max(4, Math.round(level * mult + 4)));
  }

  private cleanupAudioResources(): void {
    if (this.volumeAnimFrame) {
      cancelAnimationFrame(this.volumeAnimFrame);
      this.volumeAnimFrame = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (_) {}
      this.audioContext = null;
    }
    this.analyser = null;
    this.currentAudioLevel.set(0);
    this.isMicSilentWarning.set(false);
  }

  cancelVoiceRecording(): void {
    this.activeRecordingSessionId++;
    if (this.mediaRecorder) {
      const rec = this.mediaRecorder;
      this.mediaRecorder = null;
      rec.ondataavailable = null;
      rec.onstop = null;
      if (rec.state !== 'inactive') {
        try { rec.stop(); } catch (_) {}
      }
    }
    this.currentStream?.getTracks().forEach(t => t.stop());
    this.currentStream = null;
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
    this.cleanupAudioResources();
    this.isRecordingVoice.set(false);
    this.recordingSeconds.set(0);
  }

  finishAndSendVoiceRecording(): void {
    const duration = this.recordingSeconds();
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }

    if (!this.hasDetectedAudio && duration >= 2) {
      const confirmSend = confirm(
        'تنبيه: لم يتم رصد أي صوت أثناء التسجيل (الميكروفون مكتوم أو مستوى الإدخال صفر في إعدادات ويندوز).\n\nهل ترغب في إرسال التسجيل على أي حال؟'
      );
      if (!confirmSend) {
        this.cancelVoiceRecording();
        return;
      }
    }

    this.isRecordingVoice.set(false);
    this.cleanupAudioResources();

    const recorder = this.mediaRecorder;
    const sessionId = this.activeRecordingSessionId;

    if (recorder && recorder.state !== 'inactive') {
      const collectedChunks: Blob[] = [];
      recorder.ondataavailable = event => {
        if (event.data && event.data.size > 0) {
          collectedChunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        this.currentStream?.getTracks().forEach(t => t.stop());
        this.currentStream = null;
        if (this.mediaRecorder === recorder) {
          this.mediaRecorder = null;
        }

        if (this.activeRecordingSessionId !== sessionId || collectedChunks.length === 0) return;

        const mime = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(collectedChunks, { type: mime });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          this.store.sendVoiceMessage(base64Data, Math.max(duration, 1), audioBlob);
        };
        reader.readAsDataURL(audioBlob);
      };

      recorder.stop();
    } else {
      this.cancelVoiceRecording();
      alert('لم يتم تسجيل أي مقطع صوتي.');
    }
    this.recordingSeconds.set(0);
  }

  formatRecordingTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // --- Templates & Canned ---
  toggleQuickReplies(): void {
    this.closeOtherModals();
    this.showQuickReplies.update(v => !v);
  }

  toggleTemplatesModal(): void {
    this.closeOtherModals();
    this.showTemplatesModal.update(v => !v);
  }

  openTemplatesModal(): void {
    this.closeOtherModals();
    this.showTemplatesModal.set(true);
  }

  onSendTemplate(template: WhatsAppTemplate): void {
    this.store.sendWhatsAppTemplate(template);
    this.showTemplatesModal.set(false);
  }

  applyCanned(text: string): void {
    this.store.setComposerText(text);
    this.showQuickReplies.set(false);
    this.focusInput();
  }

  saveNewCanned(): void {
    if (!this.newCannedTitle.trim() || !this.newCannedText.trim()) return;
    const newItem: CannedItem = {
      id: `canned-${Date.now()}`,
      title: this.newCannedTitle.trim(),
      text: this.newCannedText.trim(),
      category: 'مخصص',
    };
    const updated = [newItem, ...this.cannedList()];
    this.cannedList.set(updated);
    try {
      localStorage.setItem('orca_canned_replies', JSON.stringify(updated));
    } catch {}
    this.newCannedTitle = '';
    this.newCannedText = '';
    this.isAddingNewCanned.set(false);
  }

  private loadCannedReplies(): CannedItem[] {
    try {
      const stored = localStorage.getItem('orca_canned_replies');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return this.defaultCannedList;
  }

  // --- Channel Selection ---
  selectWhatsAppAccount(accId: string): void {
    this.store.setSelectedChannel('whatsapp');
    this.store.setSelectedWhatsAppAccount(accId);
    this.isChannelDropdownOpen.set(false);
  }

  setChannel(channel: MessagingChannel): void {
    this.store.setSelectedChannel(channel);
    this.isChannelDropdownOpen.set(false);
  }

  focusInput(): void {
    setTimeout(() => {
      this.inputEl?.nativeElement.focus();
    }, 50);
  }

  private closeOtherModals(): void {
    this.showQuickReplies.set(false);
    this.showTemplatesModal.set(false);
    this.showAttachmentMenu.set(false);
    this.showEmojiPicker.set(false);
    this.isChannelDropdownOpen.set(false);
  }

  ngOnDestroy(): void {
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
    }
  }
}

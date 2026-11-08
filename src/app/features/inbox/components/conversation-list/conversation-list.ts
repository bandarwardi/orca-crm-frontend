import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InboxStore } from '../../store/inbox.store';
import { ConversationItemComponent } from './conversation-item/conversation-item';
import { FilterType } from '../../models/inbox.models';

/**
 * ConversationListComponent
 * Rightmost column in the rebalanced 2-column inbox layout (~35% width).
 * Features unified search, quick filter tabs, live connection indicator,
 * multi-account WhatsApp selector, new chat modal, and direct new-number messaging.
 */
@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConversationItemComponent],
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      height: 100%;
      overflow: hidden;
    }
  `],
  template: `
    <aside
      class="flex flex-col bg-surface rounded-xl shadow-xs overflow-hidden h-full border border-border-subtle"
    >
      <!-- Header Area -->
      <div class="p-space-sm bg-surface border-b border-border-subtle">
        <!-- Title & Action -->
        <div class="flex items-center justify-between mb-2.5 gap-2">
          <div class="flex items-center gap-2 shrink-0">
            <h1 class="font-headline-sm text-headline-sm text-on-surface font-bold">
              صندوق المحادثات
            </h1>
            <span
              class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-code-sm text-[11px] font-semibold"
            >
              {{ store.totalCount() }}
            </span>
          </div>

          <!-- New Message Button -->
          <button
            type="button"
            (click)="openNewChat()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-label-sm text-[12px] font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
            title="إرسال رسالة جديدة لرقم هاتف"
          >
            <span class="material-symbols-outlined text-[16px]">edit_square</span>
            <span>رسالة جديدة</span>
          </button>
        </div>

        <!-- WhatsApp Account Selector Row -->
        <div class="flex items-center justify-between gap-2 mb-2.5 px-2.5 py-1.5 bg-[#f0fdf4] rounded-lg border border-[#bbf7d0]">
          <div class="flex items-center gap-1.5 min-w-0 text-[11px] font-medium text-emerald-800">
            <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span class="shrink-0 text-emerald-950 font-bold">الرقم النشط:</span>
            @if (store.whatsappAccounts().length > 0) {
              <select
                [ngModel]="store.selectedWhatsAppAccountId()"
                (ngModelChange)="store.setSelectedWhatsAppAccount($event)"
                class="bg-transparent border-none text-[11px] font-semibold text-emerald-900 focus:outline-none cursor-pointer truncate max-w-[170px]"
                title="تصفية المحادثات حسب الرقم"
              >
                <option value="all">جميع الأرقام (الكل)</option>
                @for (acc of store.whatsappAccounts(); track acc.id) {
                  <option [value]="acc.id">
                    {{ acc.name }} ({{ acc.phone_number }})
                  </option>
                }
              </select>
            } @else {
              <span class="text-amber-700">لا يوجد أرقام مربوطة</span>
            }
          </div>

          @if (store.whatsappAccounts().length === 0) {
            <a
              routerLink="/settings"
              class="text-[11px] text-amber-800 font-semibold underline hover:text-amber-900 shrink-0"
            >
              إعداد رقم
            </a>
          }
        </div>

        <!-- Search Bar with Quick Action -->
        <div class="relative w-full mb-2.5">
          <span
            class="material-symbols-outlined absolute inset-y-0 start-3 flex items-center pointer-events-none text-outline text-[18px]"
          >
            search
          </span>
          <input
            [ngModel]="store.searchQuery()"
            (ngModelChange)="store.setSearchQuery($event)"
            class="w-full h-9 ps-9 pe-8 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:bg-surface focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 border border-transparent transition-all"
            placeholder="بحث عن اسم أو رقم هاتف..."
            type="search"
          />
          @if (store.searchQuery()) {
            <button
              type="button"
              (click)="store.setSearchQuery('')"
              class="material-symbols-outlined absolute inset-y-0 end-2 flex items-center text-outline hover:text-on-surface text-[16px] cursor-pointer"
            >
              close
            </button>
          }
        </div>

        <!-- Filter Tabs Segment (الكل / غير مقروء) -->
        <div class="flex items-center gap-1 p-1 bg-surface-container-low rounded-lg font-label-sm text-[12px]">
          <!-- All -->
          <button
            type="button"
            (click)="onFilterChange('all')"
            class="flex-1 py-1 px-2 rounded-md flex items-center justify-center gap-1 transition-all"
            [class.bg-surface]="store.filter() === 'all'"
            [class.text-brand-600]="store.filter() === 'all'"
            [class.font-semibold]="store.filter() === 'all'"
            [class.shadow-xs]="store.filter() === 'all'"
            [class.text-on-surface-variant]="store.filter() !== 'all'"
          >
            <span>الكل</span>
            <span
              class="px-1.5 py-0.2 rounded-full font-code-sm text-[10px]"
              [class.bg-brand-50]="store.filter() === 'all'"
              [class.text-brand-700]="store.filter() === 'all'"
              [class.bg-surface-container]="store.filter() !== 'all'"
            >
              {{ store.totalCount() }}
            </span>
          </button>

          <!-- Unread -->
          <button
            type="button"
            (click)="onFilterChange('unread')"
            class="flex-1 py-1 px-2 rounded-md flex items-center justify-center gap-1 transition-all"
            [class.bg-surface]="store.filter() === 'unread'"
            [class.text-brand-600]="store.filter() === 'unread'"
            [class.font-semibold]="store.filter() === 'unread'"
            [class.shadow-xs]="store.filter() === 'unread'"
            [class.text-on-surface-variant]="store.filter() !== 'unread'"
          >
            <span>غير مقروء</span>
            <span
              class="px-1.5 py-0.2 rounded-full font-code-sm text-[10px] font-bold"
              [class.bg-rose-100]="store.unreadCount() > 0"
              [class.text-rose-700]="store.unreadCount() > 0"
              [class.bg-surface-container]="store.unreadCount() === 0"
            >
              {{ store.unreadCount() }}
            </span>
          </button>
        </div>
      </div>

      <!-- Conversations Scrollable List -->
      <div class="flex-1 overflow-y-auto divide-y divide-surface-container/60 custom-scrollbar">
        @for (conv of store.filteredConversations(); track conv.id) {
          <app-conversation-item
            [conversation]="conv"
            [isActive]="store.activeConversationId() === conv.id"
            (selected)="store.selectConversation($event)"
          />
        } @empty {
          <div class="p-8 text-center text-outline flex flex-col items-center justify-center">
            <span class="material-symbols-outlined text-4xl mb-2 opacity-40">person_search</span>
            <p class="font-body-sm text-body-sm mb-3 text-on-surface-variant">لا توجد محادثات سابقة مطابقة للبحث</p>
            @if (store.searchQuery().trim()) {
              <button
                type="button"
                (click)="openNewChat(store.searchQuery().trim())"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-label-sm text-[12px] font-semibold transition-all shadow-xs cursor-pointer"
              >
                <span class="material-symbols-outlined text-[16px]">add_comment</span>
                <span>مراسلة هذا الرقم: {{ store.searchQuery().trim() }}</span>
              </button>
            }
          </div>
        }
      </div>

      <!-- New Chat Modal -->
      @if (store.isNewChatModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            class="bg-surface rounded-2xl shadow-2xl border border-border-subtle w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] text-on-surface"
            (click)="$event.stopPropagation()"
          >
            <!-- Modal Header -->
            <div class="flex items-center justify-between p-4 border-b border-border-subtle bg-surface-container-low">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <span class="material-symbols-outlined text-[20px]">chat</span>
                </div>
                <div>
                  <h3 class="font-bold text-sm text-on-surface">إرسال رسالة لرقم جديد</h3>
                  <p class="text-[11px] text-on-surface-variant">بدء محادثة واتساب عبر API السحابي</p>
                </div>
              </div>
              <button
                type="button"
                (click)="closeNewChat()"
                class="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-5 overflow-y-auto space-y-4 custom-scrollbar">
              <!-- Sender Account Selection -->
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1.5">
                  رقم الإرسال (حساب الواتساب)
                </label>
                @if (store.whatsappAccounts().length > 0) {
                  <select
                    [ngModel]="selectedAccount()"
                    (ngModelChange)="selectedAccount.set($event)"
                    class="w-full h-10 px-3 rounded-lg border border-outline/30 bg-surface text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    @for (acc of store.whatsappAccounts(); track acc.id) {
                      <option [value]="acc.id">
                        {{ acc.name }} — {{ acc.phone_number }}
                      </option>
                    }
                  </select>
                } @else {
                  <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center justify-between">
                    <span>لم يتم ربط رقم واتساب بعد!</span>
                    <a routerLink="/settings" (click)="closeNewChat()" class="font-bold underline">إعداد الآن</a>
                  </div>
                }
              </div>

              <!-- Phone Number Input -->
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1.5">
                  رقم هاتف المستلم <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute inset-y-0 start-3 flex items-center pointer-events-none text-outline text-[18px]">
                    phone
                  </span>
                  <input
                    type="tel"
                    [ngModel]="phoneInput()"
                    (ngModelChange)="phoneInput.set($event); errorMessage.set('')"
                    placeholder="+1234567890 أو 1234567890"
                    dir="ltr"
                    class="w-full h-10 ps-10 pe-3 rounded-lg border border-outline/30 bg-surface text-on-surface text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-start"
                  />
                </div>
                <p class="text-[11px] text-on-surface-variant mt-1">
                  أدخل الرقم متضمناً رمز الدولة الدولي (مثال: 1+ للولايات المتحدة وكندا).
                </p>
              </div>

              <!-- Customer Name (Optional) -->
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1.5">
                  اسم العميل (اختياري)
                </label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute inset-y-0 start-3 flex items-center pointer-events-none text-outline text-[18px]">
                    person
                  </span>
                  <input
                    type="text"
                    [ngModel]="nameInput()"
                    (ngModelChange)="nameInput.set($event)"
                    placeholder="مثال: أحمد عبد الله"
                    class="w-full h-10 ps-10 pe-3 rounded-lg border border-outline/30 bg-surface text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <!-- Message Type (Template vs Direct Text) -->
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1.5">
                  نوع الرسالة
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    (click)="setTemplateMode(true)"
                    class="p-2.5 rounded-lg border text-start flex flex-col gap-0.5 transition-all cursor-pointer"
                    [class.border-emerald-600]="isTemplateMode()"
                    [class.bg-emerald-50]="isTemplateMode()"
                    [class.text-emerald-950]="isTemplateMode()"
                    [class.border-outline/20]="!isTemplateMode()"
                    [class.bg-surface-container-low]="!isTemplateMode()"
                  >
                    <div class="flex items-center gap-1.5 font-bold text-xs">
                      <span class="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                      <span>قالب معتمد (Meta)</span>
                    </div>
                    <span class="text-[10px] text-on-surface-variant">موصى به للأرقام الجديدة لبدء المحادثة</span>
                  </button>

                  <button
                    type="button"
                    (click)="setTemplateMode(false)"
                    class="p-2.5 rounded-lg border text-start flex flex-col gap-0.5 transition-all cursor-pointer"
                    [class.border-brand-600]="!isTemplateMode()"
                    [class.bg-brand-50]="!isTemplateMode()"
                    [class.text-brand-950]="!isTemplateMode()"
                    [class.border-outline/20]="isTemplateMode()"
                    [class.bg-surface-container-low]="isTemplateMode()"
                  >
                    <div class="flex items-center gap-1.5 font-bold text-xs">
                      <span class="material-symbols-outlined text-[16px] text-brand-600">chat</span>
                      <span>رسالة نصية مباشرة</span>
                    </div>
                    <span class="text-[10px] text-on-surface-variant">رسالة حرة مباشرة بدون شروط مسبقة</span>
                  </button>
                </div>
              </div>

              <!-- Template Selector if in template mode -->
              @if (isTemplateMode()) {
                <div>
                  <label class="block text-xs font-semibold text-on-surface mb-1.5">
                    اختر القالب المعتمد
                  </label>
                  <select
                    [ngModel]="selectedTemplate()"
                    (ngModelChange)="onTemplateSelect($event)"
                    class="w-full h-10 px-3 rounded-lg border border-outline/30 bg-surface text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="">-- اختر قالباً --</option>
                    @for (tpl of store.templates(); track tpl.id) {
                      <option [value]="tpl.name">
                        {{ tpl.title }} ({{ tpl.category }})
                      </option>
                    }
                  </select>
                </div>
              }

              <!-- Message Content Area -->
              <div>
                <label class="block text-xs font-semibold text-on-surface mb-1.5">
                  نص الرسالة <span class="text-rose-500">*</span>
                </label>
                <textarea
                  rows="4"
                  [ngModel]="messageInput()"
                  (ngModelChange)="messageInput.set($event); errorMessage.set('')"
                  placeholder="اكتب نص الرسالة هنا..."
                  class="w-full p-3 rounded-lg border border-outline/30 bg-surface text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                ></textarea>
              </div>

              <!-- Error Alert -->
              @if (errorMessage()) {
                <div class="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">error</span>
                  <span>{{ errorMessage() }}</span>
                </div>
              }
            </div>

            <!-- Modal Footer -->
            <div class="flex items-center justify-between p-4 border-t border-border-subtle bg-surface-container-low">
              <button
                type="button"
                (click)="closeNewChat()"
                class="px-4 py-2 rounded-lg border border-outline/30 text-on-surface hover:bg-surface-container text-xs font-semibold transition-colors cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="button"
                (click)="submitNewChat()"
                [disabled]="store.isLoading()"
                class="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                @if (store.isLoading()) {
                  <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>جاري الإرسال...</span>
                } @else {
                  <span class="material-symbols-outlined text-[16px]">send</span>
                  <span>إرسال وبدء المحادثة</span>
                }
              </button>
            </div>
          </div>
        </div>
      }
    </aside>
  `
})
export class ConversationListComponent {
  readonly store = inject(InboxStore);

  readonly phoneInput = signal<string>('');
  readonly nameInput = signal<string>('');
  readonly messageInput = signal<string>('');
  readonly isTemplateMode = signal<boolean>(false);
  readonly selectedTemplate = signal<string>('');
  readonly selectedAccount = signal<string>('');
  readonly errorMessage = signal<string>('');

  onFilterChange(filter: FilterType): void {
    this.store.setFilter(filter);
  }

  openNewChat(prefillPhone?: string): void {
    this.phoneInput.set(prefillPhone || '');
    this.nameInput.set('');
    this.messageInput.set('');
    this.isTemplateMode.set(false);
    this.selectedTemplate.set('');
    this.errorMessage.set('');

    const currentSelected = this.store.selectedWhatsAppAccountId();
    if (currentSelected && currentSelected !== 'all') {
      this.selectedAccount.set(currentSelected);
    } else {
      const firstAcc = this.store.whatsappAccounts()[0];
      this.selectedAccount.set(firstAcc ? firstAcc.id : '');
    }

    this.store.openNewChatModal();
  }

  closeNewChat(): void {
    this.store.closeNewChatModal();
    this.errorMessage.set('');
  }

  setTemplateMode(enabled: boolean): void {
    this.isTemplateMode.set(enabled);
    if (enabled && !this.selectedTemplate()) {
      const firstTpl = this.store.templates()[0];
      if (firstTpl) {
        this.selectedTemplate.set(firstTpl.name);
        this.messageInput.set(firstTpl.previewText);
      }
    }
  }

  onTemplateSelect(templateName: string): void {
    this.selectedTemplate.set(templateName);
    const tpl = this.store.templates().find(t => t.name === templateName);
    if (tpl) {
      this.messageInput.set(tpl.previewText);
    }
  }

  submitNewChat(): void {
    const rawPhone = this.phoneInput().trim();
    if (!rawPhone) {
      this.errorMessage.set('يرجى إدخال رقم الهاتف');
      return;
    }

    const cleanDigits = rawPhone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 8) {
      this.errorMessage.set('رقم الهاتف غير صالح، يرجى كتابة الرقم مع رمز الدولة (مثال: +1...)');
      return;
    }

    const message = this.messageInput().trim();
    if (!message) {
      this.errorMessage.set('يرجى كتابة نص الرسالة أو اختيار قالب');
      return;
    }

    const formattedPhone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;

    this.store.startNewChat({
      phone: formattedPhone,
      name: this.nameInput().trim() || undefined,
      message,
      whatsappAccountId: this.selectedAccount() || undefined,
      templateName: this.isTemplateMode() && this.selectedTemplate() ? this.selectedTemplate() : undefined,
      onSuccess: () => {
        this.errorMessage.set('');
      },
      onError: (err: any) => {
        const detail = err?.error?.message || err?.message || 'تعذر إرسال الرسالة، يرجى التحقق من إعدادات الربط';
        this.errorMessage.set(`فشل الإرسال: ${detail}`);
      },
    });
  }
}

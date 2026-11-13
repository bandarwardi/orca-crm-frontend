import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  computed,
  effect,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InboxStore } from '../../store/inbox.store';
import { Conversation } from '../../models/inbox.models';
import { MessageBubbleComponent } from './message-bubble/message-bubble';
import { AiSuggestionBarComponent } from './ai-suggestion-bar/ai-suggestion-bar';
import { MessageComposerComponent } from './message-composer/message-composer';
import { formatThreadDateDivider } from '../../../../core/utils/date-format.util';
import { WebRtcCallService } from '../../../../core/services/webrtc-call.service';

/**
 * ChatThreadComponent
 * Rebalanced conversation view (Part A & B):
 * - Trimmed header with essential customer info only (A3).
 * - Single direct link to full Customer Profile page: "عرض ملف العميل".
 * - Live typing indicator (B6).
 * - Connected AI suggestion dock and grouped composer.
 */
@Component({
  selector: 'app-chat-thread',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MessageBubbleComponent,
    AiSuggestionBarComponent,
    MessageComposerComponent
  ],
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
    @if (store.activeConversation(); as activeConv) {
      <main
        class="flex flex-col bg-surface rounded-xl shadow-xs overflow-hidden h-full border border-border-subtle"
      >
        <!-- Trimmed Essential Chat Header (A3) -->
        <header class="px-space-md py-3 bg-surface flex items-center justify-between border-b border-border-subtle shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <!-- Customer Avatar -->
            <div class="relative shrink-0">
              <div
                class="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-xs"
              >
                <span class="material-symbols-outlined text-[22px]">person</span>
              </div>
              @if (activeConv.isOnline) {
                <span
                  class="absolute -bottom-0.5 -start-0.5 w-3 h-3 rounded-full bg-[#10b981] ring-2 ring-surface"
                  title="متصل الآن"
                ></span>
              }
            </div>

            <!-- Customer Identity & Live State -->
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-2">
                @if (hasDistinctName(activeConv)) {
                  <h2 class="font-headline-sm text-headline-sm text-on-surface truncate">
                    {{ activeConv.contactName }}
                  </h2>
                } @else {
                  <h2 class="font-headline-sm text-headline-sm text-on-surface truncate font-code-sm" dir="ltr">
                    {{ activeConv.phone }}
                  </h2>
                }

                <!-- Connection Badge -->
                @if (activeConv.isOnline) {
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] text-[11px] font-label-sm font-semibold shrink-0"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                    متصل الآن
                  </span>
                }
              </div>

              <!-- LTR-scoped Phone & Live Typing Indicator (B6) -->
              <div class="flex items-center gap-2 text-outline text-[12px] font-body-sm">
                @if (hasDistinctName(activeConv)) {
                  <span class="text-on-surface-variant font-medium font-code-sm" dir="ltr">
                    {{ activeConv.phone }}
                  </span>
                }
                @if (activeConv.city && activeConv.city !== 'غير محدد') {
                  @if (hasDistinctName(activeConv)) { <span>•</span> }
                  <span class="truncate">{{ activeConv.city }}{{ activeConv.state ? '، ' + activeConv.state : '' }}</span>
                }

                @if (activeConv.isTyping) {
                  @if (hasDistinctName(activeConv) || (activeConv.city && activeConv.city !== 'غير محدد')) { <span>•</span> }
                  <span class="text-primary font-medium flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    يكتب الآن...
                  </span>
                }
              </div>
            </div>
          </div>

          <!-- Essential Action: Call via WhatsApp / RingCentral & Link to Profile -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- WhatsApp Outbound Voice Call Button -->
            <button
              type="button"
              (click)="callWhatsAppActiveCustomer()"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-label-sm text-xs font-bold border border-[#25D366]/30 transition-all active:scale-95 cursor-pointer shadow-2xs"
              title="بدء مكالمة واتساب صوتية مباشرة عبر المتصفح"
            >
              <span class="material-symbols-outlined text-[16px]">phone_in_talk</span>
              <span>اتصال (واتساب)</span>
            </button>

            <!-- RingCentral Phone Call Button -->
            <button
              type="button"
              (click)="store.dialActiveCustomer()"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-label-sm text-xs font-semibold border border-emerald-200 transition-all active:scale-95 cursor-pointer shadow-2xs"
              title="اتصال هاتفي مباشر بالعميل عبر RingCentral"
            >
              <span class="material-symbols-outlined text-[16px]">call</span>
              <span>اتصال (RingCentral)</span>
            </button>

            @if (activeConv.orderIdRaw || activeConv.linkedOrderId) {
              <a
                [routerLink]="['/orders', activeConv.orderIdRaw || activeConv.linkedOrderId]"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-brand-50 hover:text-brand-600 text-on-surface font-label-sm text-xs font-semibold border border-border-subtle transition-all active:scale-95"
                title="عرض كافة بيانات المشترك، الأجهزة، والاشتراكات"
              >
                <span>عرض ملف العميل</span>
                <span class="material-symbols-outlined text-[16px] rtl:-scale-x-100">open_in_new</span>
              </a>
            } @else {
              <a
                routerLink="/orders/new"
                [queryParams]="{
                  phone: activeConv.phone,
                  name: hasDistinctName(activeConv) ? activeConv.contactName : '',
                  city: (activeConv.city && activeConv.city !== 'غير محدد') ? activeConv.city : ''
                }"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-brand-50 hover:text-brand-600 text-on-surface font-label-sm text-xs font-semibold border border-border-subtle transition-all active:scale-95"
                title="إنشاء اشتراك أو طلب جديد لهذا الرقم"
              >
                <span class="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                <span>إنشاء طلب جديد</span>
              </a>
            }
          </div>
        </header>

        <!-- Chat Messages Scroll Container -->
        <div
          #chatScroll
          class="flex-1 overflow-y-auto p-space-md space-y-4 bg-canvas custom-scrollbar"
        >
          <!-- Dynamic Date Marker -->
          @if (chatDateDivider()) {
            <div class="flex items-center justify-center my-1 select-none">
              <span
                class="px-3 py-1 rounded-full bg-surface text-on-surface-variant font-code-sm text-[11px] shadow-xs border border-border-subtle"
                dir="ltr"
              >
                {{ chatDateDivider() }}
              </span>
            </div>
          }

          <!-- Messages Loop with B1 & B2 distinction -->
          @for (msg of store.activeMessages(); track msg.id) {
            <app-message-bubble
              [message]="msg"
              (retry)="store.retryMessage($event)"
            />
          }

          <!-- Live Typing indicator bubble inside thread -->
          @if (activeConv.isTyping) {
            <div class="flex items-center gap-2 p-3 bg-surface rounded-2xl rounded-ts-xs border border-border-subtle w-24">
              <span class="w-2 h-2 rounded-full bg-primary/70 animate-bounce"></span>
              <span class="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:0.2s]"></span>
              <span class="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          }
        </div>

        <!-- AI Support Suggested Reply Dock (B5 with @defer) -->
        @defer {
          @if (store.activeAiSuggestion(); as suggestion) {
            <app-ai-suggestion-bar
              [suggestionText]="suggestion.text"
              (insert)="onAiInsert()"
              (edit)="onAiEdit()"
            />
          }
        }

        <!-- 24-Hour WhatsApp Window Notice -->
        @if (!store.is24HoursWindowOpen()) {
          <div
            class="mx-space-md mb-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shadow-xs"
          >
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-amber-600 shrink-0">timer_off</span>
              <span>
                <strong>نافذة الـ 24 ساعة للرسائل الحرة مغلقة:</strong> لم يقم العميل بإرسال رسالة خلال آخر 24 ساعة. لبدء التواصل مجدداً، يرجى إرسال <strong>قالب واتساب معتمد</strong>.
              </span>
            </div>
            <button
              type="button"
              (click)="composerRef?.openTemplatesModal()"
              class="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] shrink-0 transition-colors"
            >
              اختيار قالب
            </button>
          </div>
        }

        <!-- Bottom Composer Area (B7) -->
        <app-message-composer
          #composerRef
          [recipientName]="hasDistinctName(activeConv) ? activeConv.contactName : activeConv.phone"
        />
      </main>
    } @else {
      <!-- Empty State -->
      <div
        class="flex flex-col items-center justify-center h-full bg-surface rounded-xl shadow-xs border border-border-subtle p-8 text-center text-outline"
      >
        <span class="material-symbols-outlined text-6xl mb-3 text-outline">forum</span>
        <h3 class="font-headline-sm text-headline-sm text-on-surface mb-1">
          حدد محادثة للبدء
        </h3>
        <p class="font-body-md text-body-md max-w-sm">
          اختر أحد العملاء من القائمة للرد الفوري على الاستفسارات ومتابعة المشتركين.
        </p>
      </div>
    }
  `
})
export class ChatThreadComponent implements AfterViewInit {
  readonly store = inject(InboxStore);

  @ViewChild('chatScroll') chatScroll?: ElementRef<HTMLDivElement>;
  @ViewChild('composerRef') composerRef?: MessageComposerComponent;

  chatDateDivider = computed(() => {
    const msgs = this.store.activeMessages();
    if (msgs.length === 0) {
      const conv = this.store.activeConversation();
      return conv?.lastMessageAt ? formatThreadDateDivider(conv.lastMessageAt) : '';
    }
    const firstDate = msgs[0]?.createdAt;
    return firstDate ? formatThreadDateDivider(firstDate) : '';
  });

  constructor() {
    // 1. عند فتح محادثة أو تبديلها: النزول فوراً لآخر رسالة
    effect(() => {
      const activeId = this.store.activeConversationId();
      if (activeId) {
        this.scrollToBottomAfterRender('auto');
      }
    });

    // 2. عند ورود أو إرسال أو تحميل رسائل جديدة: النزول بسلاسة لآخر رسالة
    effect(() => {
      const msgs = this.store.activeMessages();
      if (msgs.length > 0) {
        this.scrollToBottomAfterRender('smooth');
      }
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottomAfterRender('auto');
  }

  scrollToBottom(behavior: ScrollBehavior = 'auto'): void {
    if (!this.chatScroll?.nativeElement) return;
    const el = this.chatScroll.nativeElement;
    el.scrollTo({
      top: el.scrollHeight,
      behavior,
    });
  }

  scrollToBottomAfterRender(behavior: ScrollBehavior = 'auto'): void {
    requestAnimationFrame(() => {
      this.scrollToBottom(behavior);
      setTimeout(() => this.scrollToBottom(behavior), 50);
      setTimeout(() => this.scrollToBottom('auto'), 150);
      setTimeout(() => this.scrollToBottom('auto'), 300);
    });
  }

  hasDistinctName(conv: Conversation | null): boolean {
    if (!conv) return false;
    const name = (conv.contactName || '').trim();
    const phone = (conv.phone || '').trim();
    if (!name) return false;
    const hasLetters = /[\p{L}]/u.test(name);
    if (!hasLetters) return false;
    const cleanName = name.replace(/[^0-9]/g, '');
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanName && cleanPhone && cleanName === cleanPhone) return false;
    return true;
  }

  onAiInsert(): void {
    this.store.applyAiSuggestionToComposer();
    this.store.sendCurrentMessage();
  }

  onAiEdit(): void {
    this.store.applyAiSuggestionToComposer();
    this.composerRef?.focusInput();
  }

  protected readonly webRtcService = inject(WebRtcCallService);

  callWhatsAppActiveCustomer(): void {
    const conv = this.store.activeConversation();
    if (!conv?.phone) return;
    const selectedAccount = this.store.selectedWhatsAppAccount();
    this.webRtcService.startOutboundCall(
      conv.phone,
      conv.contactName,
      selectedAccount?.phone_number_id,
    );
  }
}

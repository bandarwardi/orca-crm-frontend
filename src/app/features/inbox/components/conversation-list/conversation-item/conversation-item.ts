import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation } from '../../../models/inbox.models';

/**
 * ConversationItemComponent
 * Displays a single conversation card in the inbox conversation list,
 * matching WhatsApp-style layout: Contact/Phone, Time, Last message preview,
 * and delivery/unread counter.
 */
@Component({
  selector: 'app-conversation-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      (click)="selected.emit(conversation().id)"
      class="p-3 cursor-pointer relative transition-all border-b border-surface-container/60 select-none"
      [class.bg-surface-container/70]="isActive()"
      [class.bg-surface-container-lowest]="!isActive()"
      [class.hover:bg-surface-container-low/60]="!isActive()"
    >
      @if (isActive()) {
        <!-- Border indicator on right side (start in RTL) -->
        <div class="absolute inset-y-0 start-0 w-1 bg-primary rounded-e"></div>
      }

      <div class="flex items-start gap-2.5">
        <!-- Profile Avatar & Online / Typing Indicator -->
        <div class="relative shrink-0">
          <div
            class="w-11 h-11 rounded-full flex items-center justify-center transition-colors shadow-2xs"
            [class.bg-brand-600]="isActive()"
            [class.text-white]="isActive()"
            [class.bg-surface-container-high]="!isActive()"
            [class.text-on-surface-variant]="!isActive()"
          >
            <span class="material-symbols-outlined text-[24px]">person</span>
          </div>
          @if (conversation().isOnline) {
            <span
              class="absolute -bottom-0.5 -start-0.5 w-3.5 h-3.5 rounded-full bg-[#10b981] ring-2 ring-surface-container-lowest flex items-center justify-center"
              title="متصل الآن"
            ></span>
          }
        </div>

        <!-- Conversation Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline justify-between mb-0.5">
            @if (hasDistinctName()) {
              <span class="font-headline-sm text-headline-sm text-on-surface truncate">
                {{ conversation().contactName }}
              </span>
            } @else {
              <span class="font-headline-sm text-headline-sm text-on-surface truncate font-code-sm" dir="ltr">
                {{ conversation().phone }}
              </span>
            }
            <span
              class="text-[11px] font-label-sm font-code-sm shrink-0"
              dir="ltr"
              [class.text-primary]="isActive()"
              [class.font-semibold]="isActive()"
              [class.text-outline]="!isActive()"
            >
              {{ conversation().timeAgo }}
            </span>
          </div>

          <!-- Phone (Only show if distinct name exists) -->
          @if (hasDistinctName()) {
            <div class="flex items-center gap-1.5 text-outline text-[11px] mb-1 font-body-sm">
              <span class="text-on-surface-variant font-medium font-code-sm" dir="ltr">
                {{ conversation().phone }}
              </span>
            </div>
          }

          <!-- Last Message Snippet or Live Typing Indicator -->
          @if (conversation().isTyping) {
            <p class="font-body-sm text-[12px] text-primary font-medium flex items-center gap-1.5 mb-1.5">
              <span class="flex gap-0.5 items-center">
                <span class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
              </span>
              <span>يكتب الآن...</span>
            </p>
          } @else {
            <p
              class="font-body-sm text-body-sm truncate mb-1.5 flex items-center gap-1.5"
              [class.text-on-surface]="isActive()"
              [class.font-medium]="isActive()"
              [class.text-on-surface-variant]="!isActive()"
            >
              @if (displaySnippet().icon) {
                <span class="material-symbols-outlined text-[15px] shrink-0 text-outline">
                  {{ displaySnippet().icon }}
                </span>
              }
              <span class="truncate">{{ displaySnippet().text }}</span>
            </p>
          }

          <!-- Footer: Category Tag & Unread / Delivered Indicator -->
          <div class="flex items-center justify-between gap-1.5">
            <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
              @if (conversation().categoryLabel && conversation().categoryLabel !== 'عام') {
                <span
                  class="inline-flex items-center px-1.5 py-0.5 rounded-md border border-border-subtle bg-surface-container-low text-on-surface-variant text-[10px] font-label-sm font-medium shrink-0"
                >
                  {{ conversation().categoryLabel }}
                </span>
              }
            </div>

            <!-- Unread count or done indicator for outgoing message only -->
            @if ((conversation().unreadCount ?? 0) > 0) {
              <span
                class="w-5 h-5 rounded-full bg-primary text-on-primary font-code-sm text-[11px] flex items-center justify-center font-bold shrink-0"
              >
                {{ conversation().unreadCount }}
              </span>
            } @else if (conversation().lastMessageDirection === 'outgoing') {
              @if (conversation().lastMessageStatus === 'read') {
                <span class="material-symbols-outlined text-[#0284c7] text-[16px] shrink-0 font-bold" title="قُرئت">done_all</span>
              } @else if (conversation().lastMessageStatus === 'delivered') {
                <span class="material-symbols-outlined text-outline text-[16px] shrink-0" title="تم الاستلام">done_all</span>
              } @else if (conversation().lastMessageStatus === 'sending') {
                <span class="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0"></span>
              } @else if (conversation().lastMessageStatus === 'failed') {
                <span class="material-symbols-outlined text-rose-500 text-[16px] shrink-0" title="فشل الإرسال">error</span>
              } @else {
                <span class="material-symbols-outlined text-outline text-[16px] shrink-0" title="تم الإرسال">done</span>
              }
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConversationItemComponent {
  conversation = input.required<Conversation>();
  isActive = input<boolean>(false);
  selected = output<string>();

  displaySnippet = computed(() => {
    const raw = (this.conversation().lastMessage || '').trim();
    if (!raw) return { text: '', icon: null };

    // Check if image
    if (
      (raw.includes('/inbox/media/') || raw.includes('/media/')) && /\.(jpe?g|png|webp|gif)/i.test(raw) ||
      /\.(jpe?g|png|webp|gif)(\?.*)?$/i.test(raw) ||
      raw.startsWith('data:image/') ||
      raw === '[صورة]' ||
      raw === 'صورة'
    ) {
      return { text: 'صورة', icon: 'photo_camera' };
    }

    // Check if audio
    if (
      (raw.includes('/inbox/media/') || raw.includes('/media/')) && /\.(ogg|opus|mp3|wav|m4a)/i.test(raw) ||
      /\.(ogg|opus|mp3|wav|m4a)(\?.*)?$/i.test(raw) ||
      raw.startsWith('data:audio/') ||
      raw === '[تسجيل صوتي]' ||
      raw === 'تسجيل صوتي'
    ) {
      return { text: 'تسجيل صوتي', icon: 'mic' };
    }

    // Check if document
    if (
      (raw.includes('/inbox/media/') || raw.includes('/media/')) && /\.(pdf|docx?|xlsx?|txt|zip)/i.test(raw) ||
      /\.(pdf|docx?|xlsx?|txt|zip)(\?.*)?$/i.test(raw) ||
      raw.startsWith('data:application/') ||
      raw.startsWith('[ملف') ||
      raw === '[مستند]' ||
      raw === 'مستند'
    ) {
      return { text: 'مستند', icon: 'description' };
    }

    // Any other URL
    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/api/')) {
      return { text: 'رابط مرفق', icon: 'link' };
    }

    return { text: raw, icon: null };
  });

  hasDistinctName = computed(() => {
    const name = (this.conversation().contactName || '').trim();
    const phone = (this.conversation().phone || '').trim();
    if (!name) return false;
    const hasLetters = /[\p{L}]/u.test(name);
    if (!hasLetters) return false;
    const cleanName = name.replace(/[^0-9]/g, '');
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanName && cleanPhone && cleanName === cleanPhone) return false;
    return true;
  });
}

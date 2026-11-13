import { Component, ElementRef, ViewChild, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../../models/inbox.models';
import { TechnicalDataField } from '../../../../../shared/components/technical-data-field/technical-data-field';
import { environment } from '../../../../../../environments/environment';

/**
 * MessageBubbleComponent
 * Complies with strict B1 & B2 guidelines:
 * - Supports rich media types: text, image, audio (voice player), document, and Meta templates.
 * - Start-aligned for Customer (light bubble, flattened start-top corner).
 * - End-aligned for Agent (brand accent, flattened end-top corner).
 * - Technical hardware credentials rendered as structured sub-cards (TechnicalDataField).
 * - Non-intrusive muted read-receipts and delivery state indicators.
 */
@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [CommonModule, TechnicalDataField],
  template: `
    @if (message().direction === 'incoming') {
      <!-- Customer Incoming Message (Start-aligned: Right side in RTL) -->
      <div class="flex flex-col items-start max-w-[85%] sm:max-w-[75%]">
        <div
          class="bg-surface text-on-surface p-3 rounded-2xl rounded-ts-xs shadow-xs border border-border-subtle relative"
          [class.ring-2]="message().isAwaitingReply"
          [class.ring-brand-500/30]="message().isAwaitingReply"
        >
          <!-- Image Attachment -->
          @if (isImage()) {
            <div class="rounded-xl overflow-hidden max-w-sm mb-1.5 border border-border-subtle/50">
              <img
                [src]="mediaUrl()"
                class="w-full h-auto max-h-72 object-cover hover:opacity-95 cursor-pointer transition-opacity"
                (click)="openImage(mediaUrl())"
                alt="صورة مرفقة"
              />
            </div>
          }

          <!-- Document Attachment -->
          @if (isDocument()) {
            <div class="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-low border border-border-subtle mb-1.5">
              <div class="w-10 h-10 rounded-lg bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[24px]">description</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold text-on-surface truncate">{{ message().fileName || 'مستند مرفق' }}</div>
                @if (message().fileSize) {
                  <div class="text-[11px] text-outline font-code-sm" dir="ltr">{{ message().fileSize }}</div>
                }
              </div>
              <a
                [href]="mediaUrl()"
                [download]="message().fileName || 'document'"
                class="w-8 h-8 rounded-lg bg-surface hover:bg-surface-container text-on-surface flex items-center justify-center shadow-xs border border-border-subtle transition-colors"
                title="تنزيل الملف"
              >
                <span class="material-symbols-outlined text-[18px]">download</span>
              </a>
            </div>
          }

          <!-- Audio Voice Note Player -->
          @if (isAudio()) {
            <div class="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-low border border-border-subtle min-w-[240px] max-w-xs mb-1.5">
              <button
                type="button"
                (click)="toggleAudioPlay()"
                class="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-xs shrink-0 hover:bg-brand-700 transition-colors"
              >
                <span class="material-symbols-outlined text-[20px]">{{ isPlaying() ? 'pause' : 'play_arrow' }}</span>
              </button>
              <div class="flex-1 min-w-0 flex flex-col justify-center">
                <div class="h-1.5 w-full bg-border-subtle rounded-full overflow-hidden relative cursor-pointer" (click)="seekAudio($event)">
                  <div class="h-full bg-brand-600 rounded-full transition-all" [style.width.%]="audioProgress()"></div>
                </div>
                <div class="flex justify-between items-center text-[10px] text-outline font-code-sm mt-1" dir="ltr">
                  <span>{{ formatAudioTime(currentTime()) }}</span>
                  <span>{{ formatAudioTime(totalDuration()) }}</span>
                </div>
              </div>
              <span class="material-symbols-outlined text-[18px] text-[#25D366] shrink-0">mic</span>
              <audio #audioPlayer [src]="mediaUrl()" (timeupdate)="onTimeUpdate()" (ended)="onAudioEnded()" (loadedmetadata)="onAudioLoaded()"></audio>
            </div>
          }

          <!-- WhatsApp Voice Call Record -->
          @if (isCall()) {
            <div class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-border-subtle min-w-[220px]">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                [class.bg-emerald-100]="callData()?.result === 'answered'"
                [class.text-emerald-600]="callData()?.result === 'answered'"
                [class.bg-red-100]="callData()?.result !== 'answered'"
                [class.text-red-600]="callData()?.result !== 'answered'"
              >
                <span class="material-symbols-outlined text-[20px]">
                  {{ callData()?.result === 'answered' ? 'phone_in_talk' : 'phone_missed' }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold text-on-surface">
                  {{ callData()?.result === 'answered' ? 'مكالمة واتساب صوتية' : 'مكالمة واتساب فائتة' }}
                </div>
                <div class="text-[11px] text-outline mt-0.5">
                  @if (callData()?.result === 'answered') {
                    المدة: {{ formatAudioTime(callData()?.duration || 0) }}
                  } @else {
                    لم يتم الرد
                  }
                </div>
              </div>
            </div>
          }

          <!-- Message Text (When not pure media or when text is present) -->
          @if (!isCall() && !isAudio() && !isDocument() && (!isImage() || isNonUrlText())) {
            <p class="font-body-md text-body-md leading-relaxed whitespace-pre-line text-on-surface">
              {{ message().content }}
            </p>
          }

          <!-- B2: Structured Technical Data Sub-card (No raw mixed-direction text) -->
          @if (message().deviceCreds; as creds) {
            <div class="mt-3 p-2 rounded-xl bg-surface-container-low/80 border border-border-subtle space-y-2">
              <div class="text-[11px] font-label-sm font-semibold text-outline px-1 select-none">
                بيانات الجهاز المسجلة:
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <app-technical-data-field
                  label="MAC Address"
                  [value]="creds.macAddress"
                />
                <app-technical-data-field
                  label="Device Key"
                  [value]="creds.deviceKey"
                />
              </div>
            </div>
          }
        </div>

        <!-- Incoming Metadata Footer -->
        <div class="flex items-center gap-1.5 mt-1 ms-2 text-[11px] text-outline font-label-sm">
          <span class="font-code-sm" dir="ltr">{{ message().time }}</span>
          @if (message().channelLabel) {
            <span>•</span>
            <span class="text-[#25D366] font-medium flex items-center gap-0.5">
              <span class="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              {{ message().channelLabel }}
            </span>
          }
          @if (message().isAwaitingReply) {
            <span>•</span>
            <span class="flex items-center gap-1 text-accent-amber font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse"></span>
              بانتظار الرد
            </span>
          }
        </div>
      </div>
    } @else {
      <!-- Agent Outgoing Message (End-aligned: Left side in RTL) -->
      <div class="flex flex-col items-end ms-auto max-w-[85%] sm:max-w-[75%]">
        <div
          class="rounded-2xl rounded-te-xs shadow-sm"
          [class.bg-brand-600]="!isAudio() && !isDocument()"
          [class.text-white]="!isAudio() && !isDocument()"
          [class.bg-surface]="isAudio() || isDocument()"
          [class.text-on-surface]="isAudio() || isDocument()"
          [class.border]="isAudio() || isDocument()"
          [class.border-border-subtle]="isAudio() || isDocument()"
          [class.p-3.5]="!isAudio() && !isDocument()"
          [class.p-2]="isAudio() || isDocument()"
        >
          <!-- Image Attachment -->
          @if (isImage()) {
            <div class="rounded-xl overflow-hidden max-w-sm mb-1.5 border border-white/20">
              <img
                [src]="mediaUrl()"
                class="w-full h-auto max-h-72 object-cover hover:opacity-95 cursor-pointer transition-opacity"
                (click)="openImage(mediaUrl())"
                alt="صورة مرسلة"
              />
            </div>
          }

          <!-- Document Attachment -->
          @if (isDocument()) {
            <div class="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-low border border-border-subtle">
              <div class="w-10 h-10 rounded-lg bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[24px]">description</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold text-on-surface truncate">{{ message().fileName || 'مستند مرفق' }}</div>
                @if (message().fileSize) {
                  <div class="text-[11px] text-outline font-code-sm" dir="ltr">{{ message().fileSize }}</div>
                }
              </div>
              <a
                [href]="mediaUrl()"
                [download]="message().fileName || 'document'"
                class="w-8 h-8 rounded-lg bg-surface hover:bg-surface-container text-on-surface flex items-center justify-center shadow-xs border border-border-subtle transition-colors"
                title="تنزيل الملف"
              >
                <span class="material-symbols-outlined text-[18px]">download</span>
              </a>
            </div>
          }

          <!-- Audio Voice Note Player -->
          @if (isAudio()) {
            <div class="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-low border border-border-subtle min-w-[240px] max-w-xs">
              <button
                type="button"
                (click)="toggleAudioPlay()"
                class="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-xs shrink-0 hover:bg-brand-700 transition-colors"
              >
                <span class="material-symbols-outlined text-[20px]">{{ isPlaying() ? 'pause' : 'play_arrow' }}</span>
              </button>
              <div class="flex-1 min-w-0 flex flex-col justify-center">
                <div class="h-1.5 w-full bg-border-subtle rounded-full overflow-hidden relative cursor-pointer" (click)="seekAudio($event)">
                  <div class="h-full bg-brand-600 rounded-full transition-all" [style.width.%]="audioProgress()"></div>
                </div>
                <div class="flex justify-between items-center text-[10px] text-outline font-code-sm mt-1" dir="ltr">
                  <span>{{ formatAudioTime(currentTime()) }}</span>
                  <span>{{ formatAudioTime(totalDuration()) }}</span>
                </div>
              </div>
              <span class="material-symbols-outlined text-[18px] text-brand-600 shrink-0">mic</span>
              <audio #audioPlayer [src]="mediaUrl()" (timeupdate)="onTimeUpdate()" (ended)="onAudioEnded()" (loadedmetadata)="onAudioLoaded()"></audio>
            </div>
          }

          <!-- Message Text -->
          @if (!isAudio() && !isDocument() && (!isImage() || isNonUrlText())) {
            <p class="font-body-md text-body-md leading-relaxed whitespace-pre-line text-white">
              {{ message().content }}
            </p>
          }
        </div>

        <!-- Outgoing Metadata Footer with B6 Delivery State -->
        <div class="flex items-center gap-1.5 mt-1 me-2 text-[11px] text-outline font-label-sm">
          <span class="font-code-sm" dir="ltr">{{ message().time }}</span>

          <!-- Delivery State Indicator -->
          @switch (message().deliveryStatus) {
            @case ('sending') {
              <span class="inline-flex items-center gap-1 text-outline">
                <span class="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                <span>جاري الإرسال...</span>
              </span>
            }
            @case ('failed') {
              <button
                type="button"
                (click)="retry.emit(message().id)"
                class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
                title="فشل الإرسال — اضغط لإعادة المحاولة"
              >
                <span class="material-symbols-outlined text-[14px]">error</span>
                <span>فشل الإرسال (إعادة)</span>
              </button>
            }
            @case ('read') {
              <span class="material-symbols-outlined text-[#0284c7] dark:text-[#38bdf8] text-[16px] font-bold" title="تمت القراءة من قبل العميل">
                done_all
              </span>
            }
            @case ('delivered') {
              <span class="material-symbols-outlined text-outline text-[16px]" title="تم التسليم لهاتف العميل">
                done_all
              </span>
            }
            @default {
              <span class="material-symbols-outlined text-outline text-[16px]" title="تم الإرسال لخوادم Meta">
                done
              </span>
            }
          }

          @if (message().senderName) {
            <span class="text-on-surface-variant/80">{{ message().senderName }}</span>
          }
        </div>
      </div>
    }
  `
})
export class MessageBubbleComponent {
  message = input.required<Message>();
  retry = output<string>();

  @ViewChild('audioPlayer') audioPlayer?: ElementRef<HTMLAudioElement>;

  isPlaying = signal(false);
  currentTime = signal(0);
  totalDuration = signal(0);

  mediaUrl = computed(() => {
    const c = (this.message().content || '').trim();
    if (!c) return '';
    // If it's a bracketed text placeholder like '[صورة]', do NOT treat as URL
    if (c.startsWith('[') && c.endsWith(']')) {
      return '';
    }
    if (c.startsWith('data:') || c.startsWith('http://') || c.startsWith('https://')) {
      return c;
    }
    const backendBase = environment.apiUrl.replace(/\/api\/?$/, '');
    if (c.startsWith('/')) {
      return `${backendBase}${c}`;
    }
    if (c.startsWith('api/')) {
      return `${backendBase}/${c}`;
    }
    return '';
  });

  isCall = computed(() => {
    return this.message().contentType === 'call';
  });

  callData = computed(() => {
    if (!this.isCall()) return null;
    try {
      return JSON.parse(this.message().content);
    } catch {
      return { duration: 0, result: 'missed' };
    }
  });

  isImage = computed(() => {
    const m = this.message();
    if (m.contentType === 'call') return false;
    const c = (m.content || '').trim();
    if (c.startsWith('[') && c.endsWith(']')) {
      return false;
    }
    if (m.contentType === 'image') {
      return !!this.mediaUrl() || c.startsWith('data:image/');
    }
    return (
      c.startsWith('data:image/') ||
      /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(c)
    );
  });

  isAudio = computed(() => {
    const m = this.message();
    if (m.contentType === 'call') return false;
    const c = (m.content || '').trim();
    if (c.startsWith('[') && c.endsWith(']')) {
      return false;
    }
    return (
      m.contentType === 'audio' ||
      c.startsWith('data:audio/') ||
      /\.(mp3|ogg|wav|webm|m4a)(\?.*)?$/i.test(c)
    );
  });

  isDocument = computed(() => {
    const m = this.message();
    if (m.contentType === 'call') return false;
    const c = (m.content || '').trim();
    if (c.startsWith('[') && c.endsWith(']')) {
      return false;
    }
    return (
      m.contentType === 'document' ||
      c.startsWith('data:application/') ||
      /\.(pdf|docx?|xlsx?|txt|zip)(\?.*)?$/i.test(c)
    );
  });

  isNonUrlText = computed(() => {
    const c = (this.message().content || '').trim();
    if (c.startsWith('[') && c.endsWith(']')) {
      return true;
    }
    return (
      !c.startsWith('data:') &&
      !c.startsWith('http://') &&
      !c.startsWith('https://') &&
      !c.startsWith('/api/') &&
      !c.startsWith('api/')
    );
  });

  audioProgress = computed(() => {
    const dur = this.totalDuration();
    if (!dur) return 0;
    return Math.min(100, (this.currentTime() / dur) * 100);
  });

  toggleAudioPlay(): void {
    const el = this.audioPlayer?.nativeElement;
    if (!el) return;
    if (this.isPlaying()) {
      el.pause();
      this.isPlaying.set(false);
    } else {
      el.play().then(() => this.isPlaying.set(true)).catch(console.error);
    }
  }

  seekAudio(event: MouseEvent): void {
    const el = this.audioPlayer?.nativeElement;
    if (!el || !this.totalDuration()) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    el.currentTime = pct * this.totalDuration();
    this.currentTime.set(el.currentTime);
  }

  onTimeUpdate(): void {
    const el = this.audioPlayer?.nativeElement;
    if (el) {
      this.currentTime.set(el.currentTime);
    }
  }

  onAudioLoaded(): void {
    const el = this.audioPlayer?.nativeElement;
    if (el && isFinite(el.duration)) {
      this.totalDuration.set(el.duration);
    } else if (this.message().audioDuration) {
      this.totalDuration.set(this.message().audioDuration!);
    }
  }

  onAudioEnded(): void {
    this.isPlaying.set(false);
    this.currentTime.set(0);
  }

  formatAudioTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  openImage(url: string): void {
    window.open(url, '_blank');
  }
}

/**
 * CallNotificationComponent
 * Usage:
 * <app-call-notification></app-call-notification>
 *
 * Provides a floating overlay banner for incoming and active WhatsApp WebRTC audio calls.
 * Displays caller details, pulsing call badge, duration timer, and one-click answer / reject / hangup actions.
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebRtcCallService } from '../../../core/services/webrtc-call.service';

@Component({
  selector: 'app-call-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (callService.callState() !== 'idle') {
      <!-- Overlay notification banner -->
      <div
        class="fixed inset-x-0 top-6 z-50 flex items-start justify-center pointer-events-none px-4"
        dir="rtl"
      >
        <div
          class="bg-surface border border-border-subtle rounded-2xl shadow-2xl p-5 w-full max-w-sm pointer-events-auto transition-all animate-in fade-in slide-in-from-top-4"
          role="dialog"
          aria-label="مكالمة واتساب"
        >
          <!-- Caller Info Header -->
          <div class="flex items-center gap-3 mb-4">
            <div
              class="relative w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md"
            >
              <span class="material-symbols-outlined text-2xl">
                @if (callService.callState() === 'ringing') { call }
                @else if (callService.callState() === 'connecting') { wifi_calling }
                @else { phone_in_talk }
              </span>
              @if (callService.callState() === 'ringing') {
                <span class="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-50"></span>
              }
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  @if (callService.callState() === 'ringing') { مكالمة واتساب واردة }
                  @else if (callService.callState() === 'connecting') { جارٍ بدء الاتصال... }
                  @else { مكالمة نشطة }
                </span>
                @if (callService.isActive()) {
                  <span class="text-xs font-mono font-bold text-emerald-600">
                    {{ formatDuration(callService.callDuration()) }}
                  </span>
                }
              </div>

              <h3 class="font-bold text-on-surface text-base truncate mt-1">
                {{ callService.activeCallerName() || callService.activeCallerPhone() }}
              </h3>
              <p class="text-xs text-on-surface-muted font-mono" dir="ltr">
                {{ callService.activeCallerPhone() }}
              </p>
            </div>
          </div>

          <!-- Error Alert if any -->
          @if (answerError()) {
            <div class="mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2.5 text-center">
              {{ answerError() }}
            </div>
          }

          <!-- Action Buttons -->
          <div class="flex items-center gap-3 pt-1">
            @if (callService.callState() === 'ringing') {
              <!-- Reject Button -->
              <button
                type="button"
                (click)="onReject()"
                class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-medium text-sm transition-colors shadow-xs"
                title="رفض المكالمة"
              >
                <span class="material-symbols-outlined text-xl">call_end</span>
                <span>رفض</span>
              </button>

              <!-- Accept Button -->
              <button
                type="button"
                (click)="onAccept()"
                class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1caa50] text-white font-medium text-sm transition-colors shadow-xs"
                title="الرد على المكالمة"
              >
                <span class="material-symbols-outlined text-xl">call</span>
                <span>رد واستماع</span>
              </button>
            }

            @if (callService.callState() === 'connecting') {
              <div class="flex-1 flex items-center justify-center gap-2 py-2.5 text-on-surface-muted text-sm font-medium">
                <span class="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                <span>جارٍ إنشاء قناة الصوت (WebRTC)...</span>
              </div>
            }

            @if (callService.isActive()) {
              <!-- Hangup Button -->
              <button
                type="button"
                (click)="onHangup()"
                class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-medium text-sm transition-colors shadow-xs"
                title="إنهاء المكالمة"
              >
                <span class="material-symbols-outlined text-xl">call_end</span>
                <span>إنهاء المكالمة</span>
              </button>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class CallNotificationComponent {
  protected readonly callService = inject(WebRtcCallService);
  protected readonly answerError = signal<string | null>(null);

  protected async onAccept(): Promise<void> {
    this.answerError.set(null);
    const result = await this.callService.answerCall();
    if (!result.success) {
      this.answerError.set(result.error || 'فشل قبول المكالمة');
    }
  }

  protected async onReject(): Promise<void> {
    await this.callService.rejectCall();
  }

  protected async onHangup(): Promise<void> {
    await this.callService.hangup();
  }

  protected formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}

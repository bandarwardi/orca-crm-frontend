// خدمة WebRTC للتعامل مع مكالمات واتساب الواردة
// تستقبل SDP Offer من العميل وترسل SDP Answer لـ Meta عبر API

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CallState } from '../../features/inbox/models/inbox.models';

@Injectable({ providedIn: 'root' })
export class WebRtcCallService {
  private readonly http = inject(HttpClient);

  // ---- State ----
  readonly callState = signal<CallState>('idle');
  readonly activeCallId = signal<string | null>(null);
  readonly activePhoneNumberId = signal<string | null>(null);
  readonly activeCallerName = signal<string>('');
  readonly activeCallerPhone = signal<string>('');
  readonly activeSdpOffer = signal<string>('');
  readonly callDuration = signal<number>(0); // بالثانية

  readonly isRinging = computed(() => this.callState() === 'ringing');
  readonly isActive = computed(() => this.callState() === 'active');

  private peerConnection: RTCPeerConnection | null = null;
  private durationInterval: ReturnType<typeof setInterval> | null = null;
  private localStream: MediaStream | null = null;
  private remoteAudio: HTMLAudioElement | null = null;

  /**
   * استقبال مكالمة واردة — يُعرض إشعار الرنين
   */
  notifyIncomingCall(data: {
    callId: string;
    callerPhone: string;
    customerName: string;
    sdpOffer: string;
    phoneNumberId: string;
  }): void {
    this.callState.set('ringing');
    this.activeCallId.set(data.callId);
    this.activePhoneNumberId.set(data.phoneNumberId);
    this.activeCallerName.set(data.customerName);
    this.activeCallerPhone.set(data.callerPhone);
    this.activeSdpOffer.set(data.sdpOffer || '');
  }

  /**
   * قبول المكالمة — يطلب الميكروفون ويُنشئ RTCPeerConnection ويرسل SDP Answer
   */
  async answerCall(sdpOffer?: string): Promise<{ success: boolean; error?: string }> {
    const callId = this.activeCallId();
    const phoneNumberId = this.activePhoneNumberId();
    const offer = sdpOffer || this.activeSdpOffer();

    if (!callId || !phoneNumberId || !offer) {
      return { success: false, error: 'لا توجد بيانات مكالمة صالحة' };
    }

    this.callState.set('connecting');

    try {
      // 1. طلب إذن الميكروفون
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      // 2. إنشاء RTCPeerConnection مع STUN servers
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });

      // 3. إعداد تشغيل الصوت الوارد من العميل
      this.remoteAudio = new Audio();
      this.remoteAudio.autoplay = true;

      this.peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0] && this.remoteAudio) {
          this.remoteAudio.srcObject = event.streams[0];
          this.remoteAudio.play().catch(err => console.warn('Audio play autoplay error:', err));
        }
      };

      // 4. إضافة مسار الصوت المحلي
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });

      // 5. تعيين SDP Offer الوارد من العميل
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription({ type: 'offer', sdp: offer }),
      );

      // 6. إنشاء SDP Answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      // 7. انتظار اكتمال ICE candidates
      const sdpAnswer = await this.waitForIceGathering();

      // 8. إرسال SDP Answer للـ Backend ثم لـ Meta
      const result = await this.sendAnswerToBackend(callId, phoneNumberId, sdpAnswer);

      if (result.success) {
        this.callState.set('active');
        this.startDurationTimer();
      } else {
        this.cleanup();
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (err: any) {
      this.cleanup();
      return { success: false, error: err?.message || 'فشل في إنشاء الاتصال' };
    }
  }

  /**
   * رفض المكالمة
   */
  async rejectCall(): Promise<void> {
    const callId = this.activeCallId();
    const phoneNumberId = this.activePhoneNumberId();

    if (callId && phoneNumberId) {
      try {
        await firstValueFrom(
          this.http.post(`${environment.apiUrl}/whatsapp/calls/reject`, { callId, phoneNumberId }),
        );
      } catch (_) {}
    }

    this.cleanup();
  }

  /**
   * إنهاء المكالمة النشطة
   */
  async hangup(): Promise<void> {
    const callId = this.activeCallId();
    const phoneNumberId = this.activePhoneNumberId();
    this.callState.set('ending');

    if (callId && phoneNumberId) {
      try {
        await firstValueFrom(
          this.http.post(`${environment.apiUrl}/whatsapp/calls/end`, { callId, phoneNumberId }),
        );
      } catch (_) {}
    }

    this.cleanup();
  }

  /**
   * استدعاء عند انتهاء المكالمة من طرف العميل
   */
  onRemoteCallEnded(callId: string): void {
    if (this.activeCallId() === callId) {
      this.cleanup();
    }
  }

  // ---- Private Helpers ----

  private waitForIceGathering(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.peerConnection) {
        reject('No peer connection');
        return;
      }

      const timeout = setTimeout(() => {
        resolve(this.peerConnection?.localDescription?.sdp || '');
      }, 3000);

      this.peerConnection.onicegatheringstatechange = () => {
        if (this.peerConnection?.iceGatheringState === 'complete') {
          clearTimeout(timeout);
          resolve(this.peerConnection.localDescription?.sdp || '');
        }
      };

      if (this.peerConnection.iceGatheringState === 'complete') {
        clearTimeout(timeout);
        resolve(this.peerConnection.localDescription?.sdp || '');
      }
    });
  }

  private async sendAnswerToBackend(
    callId: string,
    phoneNumberId: string,
    sdpAnswer: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res: any = await firstValueFrom(
        this.http.post(`${environment.apiUrl}/whatsapp/calls/accept`, {
          callId,
          phoneNumberId,
          sdpAnswer,
        }),
      );
      return { success: res?.success !== false };
    } catch (err: any) {
      return { success: false, error: err?.error?.message || err?.message };
    }
  }

  private startDurationTimer(): void {
    this.callDuration.set(0);
    this.durationInterval = setInterval(() => {
      this.callDuration.update(d => d + 1);
    }, 1000);
  }

  private cleanup(): void {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }

    if (this.remoteAudio) {
      this.remoteAudio.pause();
      this.remoteAudio.srcObject = null;
      this.remoteAudio = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.callState.set('idle');
    this.activeCallId.set(null);
    this.activePhoneNumberId.set(null);
    this.activeCallerName.set('');
    this.activeCallerPhone.set('');
    this.callDuration.set(0);
  }
}

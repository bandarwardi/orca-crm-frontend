import { Injectable, NgZone, inject, signal } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { RingCentralCall } from '../../features/inbox/models/inbox.models';
import { RingcentralApiService, RingcentralPhoneNumberModel } from './api/ringcentral-api.service';

declare const window: any;

@Injectable({ providedIn: 'root' })
export class RingCentralWidgetService {
  private zone = inject(NgZone);
  private ringcentralApi = inject(RingcentralApiService);

  // Softphone UI State
  readonly isDialerOpen = signal<boolean>(false);
  readonly isMinimized = signal<boolean>(false);
  readonly activeTab = signal<'keypad' | 'call-log' | 'sms'>('keypad');
  readonly targetPhoneNumber = signal<string>('');

  // Call Session State
  readonly callState = signal<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  readonly callDuration = signal<number>(0);
  readonly activeCallNumber = signal<string>('');
  readonly isMuted = signal<boolean>(false);
  private callTimer: any = null;

  // Multi-Line State
  readonly phoneLines = signal<RingcentralPhoneNumberModel[]>([]);
  readonly selectedLine = signal<RingcentralPhoneNumberModel | null>(null);
  readonly isLoadingLines = signal<boolean>(false);

  private callEndSubject = new Subject<RingCentralCall>();
  public callEnd$: Observable<RingCentralCall> = this.callEndSubject.asObservable();

  private newSmsSubject = new Subject<{ from: string; text: string }>();
  public newSms$: Observable<{ from: string; text: string }> = this.newSmsSubject.asObservable();

  constructor() {
    this.initMessageListener();
    this.loadPhoneLines();
  }

  loadPhoneLines(): void {
    this.isLoadingLines.set(true);
    this.ringcentralApi.getPhoneNumbers().subscribe({
      next: (lines) => {
        this.phoneLines.set(lines || []);
        const defaultLine = lines.find((l) => l.is_default) || lines[0] || null;
        this.selectedLine.set(defaultLine);
        this.isLoadingLines.set(false);
      },
      error: () => {
        this.isLoadingLines.set(false);
      },
    });
  }

  setSelectedLine(line: RingcentralPhoneNumberModel): void {
    this.selectedLine.set(line);
  }

  openDialer(phoneNumber?: string, tab: 'keypad' | 'call-log' | 'sms' = 'keypad') {
    if (phoneNumber) {
      this.targetPhoneNumber.set(phoneNumber);
    }
    this.activeTab.set(tab);
    this.isMinimized.set(false);
    this.isDialerOpen.set(true);
  }

  closeDialer() {
    this.isDialerOpen.set(false);
    this.isMinimized.set(false);
  }

  toggleDialer() {
    if (this.isDialerOpen()) {
      this.closeDialer();
    } else {
      this.openDialer();
    }
  }

  toggleMinimize() {
    this.isMinimized.update((v) => !v);
  }

  setActiveTab(tab: 'keypad' | 'call-log' | 'sms') {
    this.activeTab.set(tab);
  }

  setTargetPhoneNumber(phone: string) {
    this.targetPhoneNumber.set(phone);
  }

  /**
   * بدء مكالمة هاتفية عبر RingCentral
   */
  startCall(phoneNumber: string): void {
    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone) return;

    this.activeCallNumber.set(cleanPhone);
    this.targetPhoneNumber.set(cleanPhone);
    this.callState.set('calling');
    this.callDuration.set(0);
    this.isMuted.set(false);
    this.isDialerOpen.set(true);
    this.isMinimized.set(false);
    this.activeTab.set('keypad');

    // 1. استدعاء Click-to-Dial عبر RCAdapter أو iframe إن كان متاحاً
    this.triggerWidgetDial(cleanPhone);

    // 2. إرسال طلب RingOut للباك إند بالخط المختار كنسخة احتياطية
    const callerId = this.selectedLine()?.phone_number;
    this.ringcentralApi.initiateRingOut(cleanPhone, callerId, callerId).subscribe({
      next: (res) => {
        console.log('[RingCentral RingOut Success]', res);
      },
      error: (err) => {
        console.warn('[RingCentral RingOut Note]', err?.message || err);
      }
    });

    // 3. محاكاة الاتصال لتحديث العداد في واجهة المستخدم
    setTimeout(() => {
      if (this.callState() === 'calling') {
        this.callState.set('connected');
        this.startTimer();
      }
    }, 2000);
  }

  /**
   * طلب إجراء مكالمة هاتفية فورية لرقم العميل (Click-to-Dial)
   */
  dialNumber(phoneNumber: string): boolean {
    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone) return false;
    this.startCall(cleanPhone);
    return true;
  }

  /**
   * تشغيل الاتصال عبر RCAdapter المضمن أو Iframe
   */
  private triggerWidgetDial(cleanPhone: string): boolean {
    // 1. استخدام RCAdapter المباشر إذا كان معرّفاً
    if (typeof window !== 'undefined' && window.RCAdapter) {
      try {
        window.RCAdapter.clickToDial(cleanPhone);
        return true;
      } catch (err) {
        console.warn('Click-to-dial via RCAdapter failed, trying postMessage fallback:', err);
      }
    }

    // 2. محاولة التواصل عبر iframe postMessage
    if (typeof document !== 'undefined') {
      const iframe = document.querySelector('#rc-widget-adapter-frame') as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          {
            type: 'rc-adapter-new-call',
            phoneNumber: cleanPhone,
            toIntlCode: true,
          },
          '*',
        );
        return true;
      }
    }

    console.info(`[RingCentral Click-to-Dial] جاري طلب الرقم: ${cleanPhone}`);
    return false;
  }

  /**
   * إنهاء المكالمة الجارية
   */
  endCall(): void {
    if (this.callTimer) {
      clearInterval(this.callTimer);
      this.callTimer = null;
    }

    const duration = this.callDuration();
    const phone = this.activeCallNumber();

    this.callState.set('ended');

    // تسجيل المكالمة في الـ Subject
    if (phone) {
      const finishedCall: RingCentralCall = {
        id: `call-${Date.now()}`,
        direction: 'Outbound',
        from: { phoneNumber: 'الرقم الرئيسي' },
        to: { phoneNumber: phone },
        duration,
        result: duration > 0 ? 'Accepted' : 'Missed',
        startTime: new Date().toISOString(),
      };
      this.callEndSubject.next(finishedCall);
    }

    setTimeout(() => {
      this.callState.set('idle');
      this.callDuration.set(0);
      this.activeCallNumber.set('');
    }, 1200);
  }

  toggleMute(): void {
    this.isMuted.update((m) => !m);
  }

  private startTimer(): void {
    if (this.callTimer) clearInterval(this.callTimer);
    this.callTimer = setInterval(() => {
      this.zone.run(() => {
        this.callDuration.update((d) => d + 1);
      });
    }, 1000);
  }

  /**
   * الاستماع لأحداث الـ Embeddable Widget الصادرة عبر window.postMessage
   */
  private initMessageListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('message', (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      // 1. حدث انتهاء مكالمة (rc-call-end-notify)
      if (data.type === 'rc-call-end-notify' && data.call) {
        this.zone.run(() => {
          const callData = data.call;
          const formattedCall: RingCentralCall = {
            id: String(callData.id || Date.now()),
            sessionId: callData.sessionId,
            direction: callData.direction === 'Inbound' ? 'Inbound' : 'Outbound',
            from: {
              phoneNumber: callData.from?.phoneNumber || '',
              name: callData.from?.name,
            },
            to: {
              phoneNumber: callData.to?.phoneNumber || '',
              name: callData.to?.name,
            },
            duration: callData.duration || 0,
            result: callData.result || 'Accepted',
            startTime: callData.startTime || new Date().toISOString(),
          };
          this.callEndSubject.next(formattedCall);
          if (this.callState() !== 'idle') {
            this.endCall();
          }
        });
      }

      // 2. حدث وصول رسالة جديدة أو تحديثها (rc-message-updated-notify)
      if (data.type === 'rc-message-updated-notify' && data.message) {
        this.zone.run(() => {
          const msg = data.message;
          if (msg.type === 'SMS' && msg.direction === 'Inbound') {
            this.newSmsSubject.next({
              from: msg.from?.phoneNumber || '',
              text: msg.subject || '',
            });
          }
        });
      }
    });
  }



  /**
   * إرسال رسالة SMS عبر الـ Widget
   */
  sendSmsViaWidget(to: string, text: string): boolean {
    if (typeof document !== 'undefined') {
      const iframe = document.querySelector('#rc-widget-adapter-frame') as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          {
            type: 'rc-adapter-new-sms',
            phoneNumber: to,
            conversation: { text },
          },
          '*',
        );
        return true;
      }
    }
    return false;
  }

  /**
   * فحص ما إذا كان الـ Widget جاهزاً في المتصفح
   */
  isWidgetReady(): boolean {
    if (typeof window === 'undefined') return false;
    return !!window.RCAdapter || !!document.querySelector('#rc-widget-adapter-frame');
  }
}


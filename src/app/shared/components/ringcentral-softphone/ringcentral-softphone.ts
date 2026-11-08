/**
 * @file ringcentral-softphone.ts
 * @description Softphone dialer and communications widget for RingCentral WebRTC/telephony,
 * providing Keypad, Live In-Call management, Call Log, and Quick SMS.
 * Usage: <app-ringcentral-softphone /> placed in AppShell or layout wrapper.
 */

import { Component, inject, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RingCentralWidgetService } from '../../../core/services/ringcentral-widget.service';
import { RingcentralApiService, RingcentralConfigModel } from '../../../core/services/api/ringcentral-api.service';
import { RingCentralCall } from '../../../features/inbox/models/inbox.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ringcentral-softphone',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ringcentral-softphone.html',
})
export class RingCentralSoftphone implements OnInit, OnDestroy {
  rcService = inject(RingCentralWidgetService);
  private api = inject(RingcentralApiService);

  // Local phone number input model
  phoneNumber = signal<string>('');

  // Quick SMS form models
  smsTo = signal<string>('');
  smsText = signal<string>('');
  isSendingSms = signal<boolean>(false);
  smsStatusMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  // Call Log
  callLogs = signal<RingCentralCall[]>([]);
  isLoadingLogs = signal<boolean>(false);

  // Active RingCentral config details
  activeConfig = signal<RingcentralConfigModel | null>(null);

  private subs = new Subscription();

  constructor() {
    // Sync phone number from service if set externally (e.g. click-to-dial from Leads/Inbox)
    effect(() => {
      const targetPhone = this.rcService.targetPhoneNumber();
      if (targetPhone) {
        this.phoneNumber.set(targetPhone);
        this.smsTo.set(targetPhone);
      }
    });
  }

  ngOnInit(): void {
    // Load RingCentral config details (e.g. main number)
    this.api.getConfig().subscribe({
      next: (cfg) => this.activeConfig.set(cfg),
      error: () => {}
    });

    // Listen for call ends to refresh Call Log
    this.subs.add(
      this.rcService.callEnd$.subscribe((call) => {
        this.callLogs.update((logs) => [call, ...logs]);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // Keypad keys
  readonly keys = [
    { num: '1', sub: '' },
    { num: '2', sub: 'ABC' },
    { num: '3', sub: 'DEF' },
    { num: '4', sub: 'GHI' },
    { num: '5', sub: 'JKL' },
    { num: '6', sub: 'MNO' },
    { num: '7', sub: 'PQRS' },
    { num: '8', sub: 'TUV' },
    { num: '9', sub: 'WXYZ' },
    { num: '*', sub: '' },
    { num: '0', sub: '+' },
    { num: '#', sub: '' },
  ];

  appendDigit(digit: string): void {
    this.phoneNumber.update((p) => p + digit);
  }

  backspace(): void {
    this.phoneNumber.update((p) => p.slice(0, -1));
  }

  clearPhone(): void {
    this.phoneNumber.set('');
  }

  startCall(num?: string): void {
    const toCall = (num || this.phoneNumber()).trim();
    if (!toCall) return;
    this.rcService.startCall(toCall);
  }

  endCall(): void {
    this.rcService.endCall();
  }

  toggleMute(): void {
    this.rcService.toggleMute();
  }

  selectTab(tab: 'keypad' | 'call-log' | 'sms'): void {
    this.rcService.setActiveTab(tab);
    if (tab === 'call-log' && this.callLogs().length === 0) {
      this.loadCallLogs();
    }
  }

  loadCallLogs(): void {
    this.isLoadingLogs.set(true);
    this.api.getCallLog().subscribe({
      next: (res: any) => {
        const records = res?.records || res?.data || (Array.isArray(res) ? res : []);
        const mapped: RingCentralCall[] = records.map((r: any) => ({
          id: String(r.id || Date.now()),
          sessionId: r.sessionId,
          direction: (r.direction === 'Inbound' || r.direction === 'inbound') ? 'Inbound' : 'Outbound',
          from: {
            phoneNumber: r.from?.phoneNumber || r.from || '',
            name: r.from?.name
          },
          to: {
            phoneNumber: r.to?.phoneNumber || r.to || '',
            name: r.to?.name
          },
          duration: r.duration || 0,
          result: r.result || (r.duration > 0 ? 'Accepted' : 'Missed'),
          startTime: r.startTime || r.created_at || new Date().toISOString()
        }));
        this.callLogs.set(mapped);
        this.isLoadingLogs.set(false);
      },
      error: () => {
        this.isLoadingLogs.set(false);
      }
    });
  }

  onSelectLine(lineId: string): void {
    const found = this.rcService.phoneLines().find((l) => l.id === lineId);
    if (found) {
      this.rcService.setSelectedLine(found);
    }
  }

  sendSms(): void {
    const to = this.smsTo().trim();
    const text = this.smsText().trim();
    if (!to || !text) return;

    this.isSendingSms.set(true);
    this.smsStatusMessage.set(null);

    const from = this.rcService.selectedLine()?.phone_number;
    this.api.sendSms(to, text, from).subscribe({
      next: () => {
        this.isSendingSms.set(false);
        this.smsStatusMessage.set({
          type: 'success',
          text: 'تم إرسال رسالة SMS عبر RingCentral بنجاح'
        });
        this.smsText.set('');
        setTimeout(() => this.smsStatusMessage.set(null), 4000);
      },
      error: (err: any) => {
        this.isSendingSms.set(false);
        this.smsStatusMessage.set({
          type: 'error',
          text: err?.error?.message || err?.message || 'فشل إرسال رسالة SMS'
        });
      }
    });
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  formatCallTime(isoString: string): string {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  }
}

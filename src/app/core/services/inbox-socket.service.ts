import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InboxSocketService {
  private socket: Socket | null = null;
  
  onNewMessage$ = new Subject<any>();
  onConversationUpdated$ = new Subject<any>();
  onMessageStatusUpdated$ = new Subject<{
    messageId?: string;
    whatsappMessageId: string;
    status: string;
    conversationId?: string;
  }>();

  connect(token: string, tenantId: string): void {
    if (this.socket) {
      this.disconnect();
    }
    
    // Convert API URL to base URL for socket if needed, assuming they are on same domain
    // If apiUrl is http://localhost:3000/api/v1, socket should connect to http://localhost:3000
    const urlObj = new URL(environment.apiUrl);
    const socketUrl = `${urlObj.protocol}//${urlObj.host}/inbox`;
    
    this.socket = io(socketUrl, {
      auth: { token },
      query: { tenantId } // Sending as query param for testing purpose
    });
    
    this.socket.on('connect', () => {
      console.log('[InboxSocketService] Connected');
    });

    this.socket.on('new_message', (msg) => {
      console.log('[InboxSocketService] New message received:', msg);
      this.onNewMessage$.next(msg);
    });

    this.socket.on('conversation_updated', (conv) => {
      console.log('[InboxSocketService] Conversation updated:', conv);
      this.onConversationUpdated$.next(conv);
    });

    this.socket.on('message_status_updated', (data) => {
      console.log('[InboxSocketService] Message status updated:', data);
      this.onMessageStatusUpdated$.next(data);
    });
    
    this.socket.on('disconnect', () => {
      console.log('[InboxSocketService] Disconnected');
    });
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { InboxStore } from '../../store/inbox.store';
import { ConversationListComponent } from '../conversation-list/conversation-list';
import { ChatThreadComponent } from '../chat-thread/chat-thread';
import { InboxSocketService } from '../../../../core/services/inbox-socket.service';
import { AuthStore } from '../../../../core/state/auth.store';

/**
 * InboxShellComponent
 * Clean 2-column unified messaging workspace (Part A):
 * - Left/Leading (~65% width): Conversation Thread with AI Suggestion & Composer
 * - Right (~35% width): Searchable, filterable Conversation List
 * (Customer profile management belongs on the dedicated Customer Profile page).
 */
@Component({
  selector: 'app-inbox-shell',
  standalone: true,
  imports: [
    CommonModule,
    ConversationListComponent,
    ChatThreadComponent
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
    <div class="h-full w-full p-2 sm:p-3 lg:p-4 flex flex-col min-h-0 overflow-hidden bg-canvas">
      <!-- 2-Column Responsive Workspace Grid (A2) -->
      <div class="grid grid-cols-12 gap-3 lg:gap-4 h-full min-h-0 flex-1 items-stretch">
        <!-- 1. Conversation List: ~35% width (Right side in RTL) -->
        <div class="col-span-12 md:col-span-5 lg:col-span-4 xl:col-span-4 h-full min-h-0 flex flex-col overflow-hidden">
          <app-conversation-list class="h-full min-h-0 flex flex-col" />
        </div>

        <!-- 2. Active Conversation View: ~65% width (Leading Area in RTL) -->
        <div class="col-span-12 md:col-span-7 lg:col-span-8 xl:col-span-8 h-full min-h-0 flex flex-col overflow-hidden">
          <app-chat-thread class="h-full min-h-0 flex flex-col" />
        </div>
      </div>
    </div>
  `
})
export class InboxShellComponent implements OnInit, OnDestroy {
  store = inject(InboxStore);
  socketService = inject(InboxSocketService);
  private authStore = inject(AuthStore);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.store.loadConversations();
    this.store.loadWhatsAppAccounts();
    
    // فحص الاستعلام في الرابط (مثل التحويل من صفحة العملاء المحتملين أو الطلبات)
    this.route.queryParams.subscribe(params => {
      const phone = params['phone'];
      const name = params['name'];
      const channel = params['channel'];
      if (phone) {
        this.store.openConversationByPhone(phone, name, channel);
      }
    });

    const token = this.authStore.userToken() || '';
    const tenantId = this.authStore.tenantId() || '';
    if (token) {
      this.socketService.connect(token, tenantId);
    }
  }
  
  ngOnDestroy() {
    this.socketService.disconnect();
  }
}

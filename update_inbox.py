import re

file_path = "f:/apps/orca/crm/src/app/features/inbox/store/inbox.store.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add imports
content = content.replace(
    "import { computed } from '@angular/core';",
    "import { computed, inject } from '@angular/core';\nimport { ConversationsApiService } from '../../../../core/services/api/conversations-api.service';"
)

# Empty the arrays
content = re.sub(r"const initialConversations: Conversation\[\] = \[\s*\{[\s\S]*?\n\];", "const initialConversations: Conversation[] = [];", content)
content = re.sub(r"const initialMessages: Record<string, Message\[\]> = \{\s*'conv-1'[\s\S]*?\n\};", "const initialMessages: Record<string, Message[]> = {};", content)
content = re.sub(r"const initialAiSuggestions: Record<string, AiSuggestion> = \{\s*'conv-1'[\s\S]*?\n\};", "const initialAiSuggestions: Record<string, AiSuggestion> = {};", content)

# Update initial state injection
content = content.replace(
    "withMethods(store => ({",
    "withMethods((store, api = inject(ConversationsApiService)) => ({"
)

# Add loadConversations
load_conversations_str = """
    loadConversations() {
      patchState(store, { isLoading: true });
      api.search({}).subscribe({
        next: (data: any[]) => {
          const convs: Conversation[] = data.map(c => ({
            id: c.id,
            contactName: c.customer?.name || 'عميل غير معروف',
            contactNameEn: c.customer?.name || 'Customer',
            initial: (c.customer?.name || 'ع')[0],
            phone: c.customer?.phone || '',
            city: c.customer?.city || '',
            state: c.customer?.state || '',
            email: c.customer?.email || '',
            lastMessage: 'رسالة...',
            timeAgo: c.last_message_at ? new Date(c.last_message_at).toLocaleDateString('ar-SA') : 'الآن',
            timestamp: c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString('ar-SA') : 'الآن',
            status: c.status === 'open' ? 'needs-reply' : 'completed',
            statusLabel: c.status === 'open' ? 'يحتاج رد' : 'مكتمل',
            category: 'general',
            categoryLabel: 'عام',
            unreadCount: 0,
            isOnline: false,
            isTyping: false
          }));
          patchState(store, { conversations: convs, isLoading: false });
        },
        error: (err) => {
          console.error(err);
          patchState(store, { isLoading: false });
        }
      });
    },"""

content = content.replace(
    "withMethods((store, api = inject(ConversationsApiService)) => ({",
    "withMethods((store, api = inject(ConversationsApiService)) => ({" + load_conversations_str
)

# Update selectConversation
select_conv_old = r"selectConversation\(id: string\): void \{[\s\S]*?\}\);"
select_conv_new = """selectConversation(id: string): void {
      patchState(store, state => ({
        activeConversationId: id,
        conversations: state.conversations.map(c => c.id === id ? { ...c, unreadCount: 0 } : c)
      }));
      api.getById(id).subscribe({
        next: (data) => {
          const msgs: Message[] = (data.messages || []).map((m: any) => ({
            id: m.id,
            conversationId: m.conversation_id,
            content: m.content,
            direction: m.sender_type === 'user' || m.sender_type === 'system' ? 'outgoing' : 'incoming',
            time: new Date(m.created_at).toLocaleTimeString('ar-SA'),
            channel: 'whatsapp',
            senderName: m.sender_type === 'user' ? 'الوكيل' : 'العميل',
            deliveryStatus: m.status === 'sent' || m.status === 'delivered' ? 'read' : 'sending'
          }));
          patchState(store, (state) => ({
            messages: { ...state.messages, [id]: msgs }
          }));
        },
        error: (err) => console.error(err)
      });
    }"""
content = re.sub(select_conv_old, select_conv_new, content)

# Update sendCurrentMessage
send_msg_old = r"sendCurrentMessage\(\): void \{[\s\S]*?\}, 600\);\n    \}"
send_msg_new = """sendCurrentMessage(): void {
      const text = store.composerText().trim();
      const activeId = store.activeConversationId();
      if (!text || !activeId) return;

      const messageId = `msg-${Date.now()}`;
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ar-SA');

      const newMsg: Message = {
        id: messageId,
        conversationId: activeId,
        content: text,
        direction: 'outgoing',
        time: timeStr,
        channel: store.selectedChannel(),
        senderName: 'أنت',
        deliveryStatus: 'sending'
      };

      patchState(store, state => {
        const existingMessages = state.messages[activeId] ?? [];
        return {
          ...state,
          messages: { ...state.messages, [activeId]: [...existingMessages, newMsg] },
          composerText: ''
        };
      });

      api.sendMessage(activeId, { content: text, sender_type: 'user' }).subscribe({
        next: (savedMsg) => {
          // Update delivery status
          patchState(store, state => {
            const list = state.messages[activeId] ?? [];
            return {
              ...state,
              messages: {
                ...state.messages,
                [activeId]: list.map(m => m.id === messageId ? { ...m, deliveryStatus: 'read' as const, id: savedMsg.id } : m)
              }
            };
          });
          // Also optionally reload conversations to update last message
          this.loadConversations();
        },
        error: (err) => console.error(err)
      });
    }"""
content = re.sub(send_msg_old, send_msg_new, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Inbox store updated")

import { computed, inject } from '@angular/core';
import {
  InboxApiService,
  BackendConversation,
  BackendMessage,
} from '../../../core/services/api/inbox-api.service';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
  withHooks,
} from '@ngrx/signals';
import { InboxSocketService } from '../../../core/services/inbox-socket.service';
import { RingCentralWidgetService } from '../../../core/services/ringcentral-widget.service';
import {
  AiSuggestion,
  Conversation,
  FilterType,
  Message,
  MessageDeliveryStatus,
  MessagingChannel,
  RingCentralCall,
  WhatsAppTemplate,
} from '../models/inbox.models';
import { WhatsAppApiService, WhatsAppAccount } from '../../../core/services/api/whatsapp-api.service';
import {
  formatDateEn,
  formatRelativeDateEn,
  formatTimeEn,
} from '../../../core/utils/date-format.util';

export const OFFICIAL_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl-1',
    name: 'subscription_renewal_ar',
    title: 'تذكير تجديد الاشتراك السنوي',
    category: 'UTILITY',
    language: 'ar',
    previewText:
      'مرحباً بك! نود تذكيرك بأن اشتراكك في باقة القنوات ينتهي قريباً. لتجديد الاشتراك والاستمرار في المشاهدة دون انقطاع، يرجى الرد لتأكيد التجديد.',
  },
  {
    id: 'tpl-2',
    name: 'welcome_new_customer_ar',
    title: 'ترحيب بعميل جديد',
    category: 'MARKETING',
    language: 'ar',
    previewText:
      'أهلاً بك في عائلة ORCA! يسعدنا انضمامك إلينا، حسابك جاهز للاستخدام. إذا كان لديك أي استفسار فريق الدعم في خدمتك 24/7.',
  },
  {
    id: 'tpl-3',
    name: 'device_activation_ar',
    title: 'طلب بيانات تفعيل الجهاز',
    category: 'UTILITY',
    language: 'ar',
    previewText:
      'مرحباً بك! للبدء في تفعيل اشتراكك، يرجى تزويدنا بعنوان MAC ومفتاح الجهاز (Device Key) الظاهرين على شاشة التلفاز.',
  },
  {
    id: 'tpl-4',
    name: 'support_followup_ar',
    title: 'متابعة تذكرة الدعم الفني',
    category: 'UTILITY',
    language: 'ar',
    previewText:
      'مرحباً بك، نود التأكد من أن المشكلة التقنية قد تم حلها وأن القنوات تعمل لديك بسلاسة الآن. هل تحتاج إلى أي مساعدة إضافية؟',
  },
];

function mapDeliveryStatus(status: string): MessageDeliveryStatus {
  if (status === 'read') return 'read';
  if (status === 'delivered') return 'delivered';
  if (status === 'sent') return 'sent';
  if (status === 'failed') return 'failed';
  return 'sending';
}

export interface InboxState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  aiSuggestions: Record<string, AiSuggestion>;
  templates: WhatsAppTemplate[];
  callLogs: RingCentralCall[];
  filter: FilterType;
  searchQuery: string;
  composerText: string;
  selectedChannel: MessagingChannel;
  isLoading: boolean;

  // WhatsApp Multi-Account State
  whatsappAccounts: WhatsAppAccount[];
  selectedWhatsAppAccountId: string;
  isWhatsAppAccountsLoading: boolean;

  // New Chat Modal
  isNewChatModalOpen: boolean;
}

const initialConversations: Conversation[] = [];
const initialMessages: Record<string, Message[]> = {};
const initialAiSuggestions: Record<string, AiSuggestion> = {};

export const InboxStore = signalStore(
  { providedIn: 'root' },
  withState<InboxState>({
    conversations: initialConversations,
    activeConversationId: null,
    messages: initialMessages,
    aiSuggestions: initialAiSuggestions,
    templates: OFFICIAL_WHATSAPP_TEMPLATES,
    callLogs: [],
    filter: 'all',
    searchQuery: '',
    composerText: '',
    selectedChannel: 'whatsapp',
    isLoading: false,

    whatsappAccounts: [],
    selectedWhatsAppAccountId: 'all',
    isWhatsAppAccountsLoading: false,
    isNewChatModalOpen: false,
  }),
  withComputed(store => {
    const totalCount = computed(() => store.conversations().length);
    const unreadCount = computed(
      () => store.conversations().filter(c => (c.unreadCount ?? 0) > 0).length,
    );

    const selectedWhatsAppAccount = computed(() => {
      const id = store.selectedWhatsAppAccountId();
      if (!id || id === 'all') return null;
      return store.whatsappAccounts().find(a => a.id === id) ?? null;
    });

    const filteredConversations = computed(() => {
      const q = store.searchQuery().trim().toLowerCase();
      const filter = store.filter();
      let list = store.conversations();

      if (filter === 'unread') {
        list = list.filter(c => (c.unreadCount ?? 0) > 0);
      }

      if (q) {
        list = list.filter(
          c =>
            c.contactName.toLowerCase().includes(q) ||
            c.contactNameEn.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            (c.linkedOrderId && c.linkedOrderId.toLowerCase().includes(q)),
        );
      }

      return list;
    });

    const activeConversation = computed(() => {
      const id = store.activeConversationId();
      return store.conversations().find(c => c.id === id) ?? null;
    });

    const activeMessages = computed(() => {
      const id = store.activeConversationId();
      if (!id) return [];
      return store.messages()[id] ?? [];
    });

    const activeAiSuggestion = computed(() => {
      const id = store.activeConversationId();
      if (!id) return null;
      return store.aiSuggestions()[id] ?? null;
    });

    /**
     * التحقق مما إذا كانت نافذة الـ 24 ساعة للرسائل الحرة مفتوحة
     * وفقاً لتوثيق Meta: الرسائل الحرة مسموحة فقط خلال 24 ساعة من آخر رسالة من العميل
     */
    const is24HoursWindowOpen = computed(() => {
      const msgs = activeMessages();
      const lastIncoming = [...msgs].reverse().find(m => m.direction === 'incoming');
      if (!lastIncoming || !lastIncoming.createdAt) return true;

      const msgTime = new Date(lastIncoming.createdAt).getTime();
      if (isNaN(msgTime)) return true;

      const diffHours = (Date.now() - msgTime) / (1000 * 60 * 60);
      return diffHours <= 24;
    });

    return {
      totalCount,
      unreadCount,
      filteredConversations,
      activeConversation,
      activeMessages,
      activeAiSuggestion,
      selectedWhatsAppAccount,
      is24HoursWindowOpen,
    };
  }),
  withMethods((
    store,
    api = inject(InboxApiService),
    rcWidget = inject(RingCentralWidgetService),
    whatsAppApi = inject(WhatsAppApiService)
  ) => ({
    setSelectedWhatsAppAccount(accountId: string): void {
      patchState(store, { selectedWhatsAppAccountId: accountId });
    },

    loadWhatsAppAccounts(): void {
      patchState(store, { isWhatsAppAccountsLoading: true });
      whatsAppApi.getAccounts().subscribe({
        next: res => {
          const accounts = res?.data || [];
          patchState(store, {
            whatsappAccounts: accounts,
            isWhatsAppAccountsLoading: false,
          });
          // If a default account exists and current selection is 'all', auto-select default account
          if (accounts.length > 0 && store.selectedWhatsAppAccountId() === 'all') {
            const def = accounts.find(a => a.is_default);
            if (def) {
              patchState(store, { selectedWhatsAppAccountId: def.id });
            } else if (accounts[0]) {
              patchState(store, { selectedWhatsAppAccountId: accounts[0].id });
            }
          }
        },
        error: err => {
          console.error('Failed to load WhatsApp accounts in InboxStore:', err);
          patchState(store, { isWhatsAppAccountsLoading: false });
        },
      });
    },

    openNewChatModal(): void {
      patchState(store, { isNewChatModalOpen: true });
    },

    closeNewChatModal(): void {
      patchState(store, { isNewChatModalOpen: false });
    },

    startNewChat(payload: {
      phone: string;
      name?: string;
      message: string;
      whatsappAccountId?: string;
      templateName?: string;
      onSuccess?: () => void;
      onError?: (err: any) => void;
    }): void {
      patchState(store, { isLoading: true });
      api
        .startConversation({
          phone_number: payload.phone,
          contact_name: payload.name,
          content: payload.message,
          content_type: payload.templateName ? 'template' : 'text',
          whatsapp_account_id:
            payload.whatsappAccountId ||
            (store.selectedWhatsAppAccountId() !== 'all' ? store.selectedWhatsAppAccountId() : undefined),
          template_name: payload.templateName,
        })
        .subscribe({
          next: res => {
            const c = res.conversation;
            const m = res.message;
            const customerName = payload.name || c.customer?.name || c.phone_number;

            const newConv: Conversation = {
              id: c.id,
              contactName: customerName,
              contactNameEn: customerName,
              initial: customerName[0] || 'ع',
              phone: c.phone_number,
              city: c.customer?.city || '',
              state: c.customer?.state || '',
              lastMessage: m.content,
              timeAgo: 'Just now',
              timestamp: formatTimeEn(new Date()),
              lastMessageDirection: 'outgoing',
              lastMessageStatus: mapDeliveryStatus(m.status),
              status: 'awaiting-customer',
              statusLabel: 'بانتظار العميل',
              category: 'general',
              categoryLabel: '',
              unreadCount: 0,
              isOnline: false,
            };

            const newMsg: Message = {
              id: m.id,
              conversationId: c.id,
              content: m.content,
              direction: 'outgoing',
              time: formatTimeEn(m.created_at),
              createdAt: m.created_at,
              channel: 'whatsapp',
              senderName: 'أنت',
              deliveryStatus: mapDeliveryStatus(m.status),
              whatsappMessageId: m.whatsapp_message_id,
              isTemplate: m.content_type === 'template',
            };

            patchState(store, state => {
              const exists = state.conversations.some(item => item.id === c.id);
              const currentList = state.messages[c.id] || [];
              const alreadyHas = currentList.some(item => item.id === newMsg.id);
              const mergedMessages = alreadyHas
                ? currentList.map(item => (item.id === newMsg.id ? newMsg : item))
                : [...currentList, newMsg];

              return {
                ...state,
                conversations: exists
                  ? state.conversations.map(item => (item.id === c.id ? newConv : item))
                  : [newConv, ...state.conversations],
                activeConversationId: c.id,
                messages: {
                  ...state.messages,
                  [c.id]: mergedMessages,
                },
                isNewChatModalOpen: false,
                isLoading: false,
              };
            });
            payload.onSuccess?.();
          },
          error: err => {
            console.error('Error starting new chat:', err);
            patchState(store, { isLoading: false });
            payload.onError?.(err);
          },
        });
    },

    loadConversations() {
      patchState(store, { isLoading: true });
      api.getConversations().subscribe({
        next: res => {
          const list: BackendConversation[] = res?.data || [];
          const convs: Conversation[] = list.map((c: BackendConversation) => {
            const customerName =
              c.customer?.name || c.lead?.name || c.phone_number || 'غير معروف';
            return {
              id: c.id,
              contactName: customerName,
              contactNameEn: customerName,
              initial: customerName[0] || 'ع',
              phone: c.phone_number || '',
              city: c.customer?.city || '',
              state: c.customer?.state || '',
              email: c.customer?.email || '',
              lastMessage: c.last_message || '',
              timeAgo: c.last_message_at
                ? formatRelativeDateEn(c.last_message_at)
                : 'Just now',
              timestamp: c.last_message_at
                ? formatTimeEn(c.last_message_at)
                : 'Just now',
              lastMessageAt: c.last_message_at,
              lastMessageDirection: c.last_message_direction === 'outbound' ? 'outgoing' : (c.last_message_direction === 'inbound' ? 'incoming' : undefined),
              lastMessageStatus: c.last_message_status ? mapDeliveryStatus(c.last_message_status) : undefined,
              status: 'completed',
              statusLabel: '',
              category: 'general',
              categoryLabel: '',
              unreadCount: 0,
              isOnline: false,
              isTyping: false,
            };
          });

          const activeId = store.activeConversationId() || (convs.length > 0 ? convs[0].id : null);
          patchState(store, {
            conversations: convs,
            activeConversationId: activeId,
            isLoading: false,
          });

          if (activeId) {
            this.selectConversation(activeId);
          }
        },
        error: (err: any) => {
          console.error(err);
          patchState(store, { isLoading: false });
        },
      });
    },

    selectConversation(id: string): void {
      patchState(store, state => ({
        activeConversationId: id,
        conversations: state.conversations.map(c =>
          c.id === id ? { ...c, unreadCount: 0 } : c,
        ),
      }));

      api.getMessages(id).subscribe({
        next: res => {
          const data = res?.data || [];
          const msgs: Message[] = data.map((m: BackendMessage) => ({
            id: m.id,
            conversationId: m.conversation_id,
            content: m.content,
            contentType: (m.content_type as any) || 'text',
            direction: m.direction === 'outbound' ? 'outgoing' : 'incoming',
            time: formatTimeEn(m.created_at),
            createdAt: m.created_at,
            channel: 'whatsapp',
            senderName: m.direction === 'outbound' ? 'أنت' : 'العميل',
            deliveryStatus: mapDeliveryStatus(m.status),
            whatsappMessageId: m.whatsapp_message_id,
            isTemplate: m.content_type === 'template',
          }));

          patchState(store, state => ({
            messages: { ...state.messages, [id]: msgs },
          }));
        },
        error: (err: any) => console.error(err),
      });
    },

    openConversationByPhone(rawPhone: string, contactName?: string, channel?: MessagingChannel): void {
      const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
      const existing = store.conversations().find(c => {
        const cPhone = (c.phone || '').replace(/[^0-9]/g, '');
        return cPhone.length > 5 && (cPhone.includes(cleanPhone) || cleanPhone.includes(cPhone));
      });

      if (existing) {
        this.selectConversation(existing.id);
        if (channel) {
          patchState(store, { selectedChannel: channel });
        }
      } else {
        const displayName = contactName || `عميل (${cleanPhone.slice(-4)})`;
        const newConv: Conversation = {
          id: `conv-dynamic-${Date.now()}`,
          contactName: displayName,
          contactNameEn: displayName,
          initial: displayName[0] || 'ع',
          phone: rawPhone,
          city: '',
          state: '',
          lastMessage: 'محادثة جديدة جاهزة للإرسال...',
          timeAgo: 'Just now',
          timestamp: formatTimeEn(new Date()),
          status: 'awaiting-customer',
          statusLabel: 'بانتظار العميل',
          category: 'general',
          categoryLabel: '',
          unreadCount: 0,
          isOnline: false,
        };

        patchState(store, state => ({
          conversations: [newConv, ...state.conversations],
          activeConversationId: newConv.id,
          messages: { ...state.messages, [newConv.id]: [] },
          selectedChannel: channel || 'whatsapp',
        }));
      }
    },

    setFilter(filter: FilterType): void {
      patchState(store, { filter });
    },

    setSearchQuery(searchQuery: string): void {
      patchState(store, { searchQuery });
    },

    setComposerText(composerText: string): void {
      patchState(store, { composerText });
    },

    setSelectedChannel(channel: MessagingChannel): void {
      patchState(store, { selectedChannel: channel });
    },

    applyAiSuggestionToComposer(): void {
      const suggestion = store.activeAiSuggestion();
      if (suggestion) {
        patchState(store, { composerText: suggestion.text });
      }
    },

    sendCurrentMessage(): void {
      const text = store.composerText().trim();
      const activeId = store.activeConversationId();
      if (!text || !activeId) return;

      const messageId = `msg-${Date.now()}`;
      const now = new Date();
      const timeStr = formatTimeEn(now);

      const newMsg: Message = {
        id: messageId,
        conversationId: activeId,
        content: text,
        direction: 'outgoing',
        time: timeStr,
        createdAt: now.toISOString(),
        channel: store.selectedChannel(),
        senderName: 'أنت',
        deliveryStatus: 'sending',
      };

      patchState(store, state => {
        const existingMessages = state.messages[activeId] ?? [];
        return {
          ...state,
          conversations: state.conversations.map(c =>
            c.id === activeId
              ? {
                  ...c,
                  lastMessage: text,
                  timeAgo: 'Just now',
                  timestamp: timeStr,
                  lastMessageDirection: 'outgoing',
                  lastMessageStatus: 'sending',
                }
              : c,
          ),
          messages: { ...state.messages, [activeId]: [...existingMessages, newMsg] },
          composerText: '',
        };
      });

      const channel = store.selectedChannel();
      if (channel === 'ringcentral' || channel === 'sms') {
        const activeConv = store.activeConversation();
        const destPhone = activeConv?.phone || '';
        const widgetSuccess = rcWidget.sendSmsViaWidget(destPhone, text);

        if (!widgetSuccess && destPhone) {
          api.sendRingCentralSms({ to: destPhone, text }).subscribe({
            next: (res: any) => {
              patchState(store, state => {
                const list = state.messages[activeId] ?? [];
                return {
                  ...state,
                  messages: {
                    ...state.messages,
                    [activeId]: list.map(m =>
                      m.id === messageId
                        ? { ...m, deliveryStatus: 'sent' as const, id: res.messageId || m.id }
                        : m,
                    ),
                  },
                };
              });
            },
            error: () => {
              patchState(store, state => {
                const list = state.messages[activeId] ?? [];
                return {
                  ...state,
                  messages: {
                    ...state.messages,
                    [activeId]: list.map(m =>
                      m.id === messageId ? { ...m, deliveryStatus: 'failed' as const } : m,
                    ),
                  },
                };
              });
            },
          });
        } else {
          patchState(store, state => {
            const list = state.messages[activeId] ?? [];
            return {
              ...state,
              messages: {
                ...state.messages,
                [activeId]: list.map(m =>
                  m.id === messageId ? { ...m, deliveryStatus: 'sent' as const } : m,
                ),
              },
            };
          });
        }
        return;
      }

      const waAccountId = store.selectedWhatsAppAccountId();
      api
        .sendMessage(activeId, {
          content: text,
          whatsapp_account_id: waAccountId && waAccountId !== 'all' ? waAccountId : undefined,
        })
        .subscribe({
        next: savedMsg => {
          const mappedSt = mapDeliveryStatus(savedMsg.status);
          patchState(store, state => {
            const list = state.messages[activeId] ?? [];
            const alreadyExists = list.some(
              m => m.id === savedMsg.id || (savedMsg.whatsapp_message_id && m.whatsappMessageId === savedMsg.whatsapp_message_id),
            );
            let updatedMessages: Message[];
            if (alreadyExists) {
              updatedMessages = list.filter(m => m.id !== messageId);
            } else {
              updatedMessages = list.map(m =>
                m.id === messageId
                  ? {
                      ...m,
                      deliveryStatus: mappedSt,
                      id: savedMsg.id,
                      whatsappMessageId: savedMsg.whatsapp_message_id,
                    }
                  : m,
              );
            }
            return {
              ...state,
              conversations: state.conversations.map(c =>
                c.id === activeId && c.lastMessageDirection === 'outgoing'
                  ? { ...c, lastMessageStatus: mappedSt }
                  : c,
              ),
              messages: {
                ...state.messages,
                [activeId]: updatedMessages,
              },
            };
          });
        },
        error: err => {
          console.error(err);
          patchState(store, state => {
            const list = state.messages[activeId] ?? [];
            return {
              ...state,
              conversations: state.conversations.map(c =>
                c.id === activeId && c.lastMessageDirection === 'outgoing'
                  ? { ...c, lastMessageStatus: 'failed' }
                  : c,
              ),
              messages: {
                ...state.messages,
                [activeId]: list.map(m =>
                  m.id === messageId ? { ...m, deliveryStatus: 'failed' as const } : m,
                ),
              },
            };
          });
        },
      });
    },

    sendWhatsAppTemplate(template: WhatsAppTemplate): void {
      const activeId = store.activeConversationId();
      if (!activeId) return;

      const messageId = `msg-${Date.now()}`;
      const now = new Date();
      const timeStr = formatTimeEn(now);

      const newMsg: Message = {
        id: messageId,
        conversationId: activeId,
        content: template.previewText,
        direction: 'outgoing',
        time: timeStr,
        createdAt: now.toISOString(),
        channel: 'whatsapp',
        senderName: 'أنت',
        deliveryStatus: 'sending',
        isTemplate: true,
      };

      patchState(store, state => {
        const existingMessages = state.messages[activeId] ?? [];
        return {
          ...state,
          conversations: state.conversations.map(c =>
            c.id === activeId
              ? {
                  ...c,
                  lastMessage: template.previewText,
                  timeAgo: 'Just now',
                  timestamp: timeStr,
                  lastMessageDirection: 'outgoing',
                  lastMessageStatus: 'sending',
                }
              : c,
          ),
          messages: { ...state.messages, [activeId]: [...existingMessages, newMsg] },
        };
      });

      const templateWaAccountId = store.selectedWhatsAppAccountId();
      api
        .sendTemplateMessage(activeId, {
          templateName: template.name,
          templateText: template.previewText,
          language: template.language,
          whatsapp_account_id: templateWaAccountId && templateWaAccountId !== 'all' ? templateWaAccountId : undefined,
        })
        .subscribe({
          next: savedMsg => {
            const mappedSt = mapDeliveryStatus(savedMsg.status);
            patchState(store, state => {
              const list = state.messages[activeId] ?? [];
              return {
                ...state,
                conversations: state.conversations.map(c =>
                  c.id === activeId && c.lastMessageDirection === 'outgoing'
                    ? { ...c, lastMessageStatus: mappedSt }
                    : c,
                ),
                messages: {
                  ...state.messages,
                  [activeId]: list.map(m =>
                    m.id === messageId
                      ? {
                          ...m,
                          deliveryStatus: mappedSt,
                          id: savedMsg.id,
                          whatsappMessageId: savedMsg.whatsapp_message_id,
                        }
                      : m,
                  ),
                },
              };
            });
          },
          error: err => {
            console.error('Error sending WhatsApp template:', err);
            patchState(store, state => {
              const list = state.messages[activeId] ?? [];
              return {
                ...state,
                messages: {
                  ...state.messages,
                  [activeId]: list.map(m =>
                    m.id === messageId ? { ...m, deliveryStatus: 'failed' as const } : m,
                  ),
                },
              };
            });
          },
        });
    },

    retryMessage(msgId: string): void {
      const activeId = store.activeConversationId();
      if (!activeId) return;

      const msg = (store.messages()[activeId] ?? []).find(m => m.id === msgId);
      if (!msg) return;

      patchState(store, state => {
        const list = state.messages[activeId] ?? [];
        return {
          ...state,
          messages: {
            ...state.messages,
            [activeId]: list.map(m =>
              m.id === msgId ? { ...m, deliveryStatus: 'sending' as const } : m,
            ),
          },
        };
      });

      const waAccountId = store.selectedWhatsAppAccountId();
      api.sendMessage(activeId, {
        content: msg.content,
        content_type: msg.contentType,
        filename: msg.fileName,
        whatsapp_account_id: waAccountId && waAccountId !== 'all' ? waAccountId : undefined,
      }).subscribe({
        next: savedMsg => {
          patchState(store, state => {
            const list = state.messages[activeId] ?? [];
            return {
              ...state,
              messages: {
                ...state.messages,
                [activeId]: list.map(m =>
                  m.id === msgId
                    ? {
                        ...m,
                        deliveryStatus: mapDeliveryStatus(savedMsg.status),
                        id: savedMsg.id,
                        whatsappMessageId: savedMsg.whatsapp_message_id,
                      }
                    : m,
                ),
              },
            };
          });
        },
        error: () => {
          patchState(store, state => {
            const list = state.messages[activeId] ?? [];
            return {
              ...state,
              messages: {
                ...state.messages,
                [activeId]: list.map(m =>
                  m.id === msgId ? { ...m, deliveryStatus: 'failed' as const } : m,
                ),
              },
            };
          });
        },
      });
    },

    sendAttachmentMessage(payload: { file?: File; dataUrl: string; type: 'image' | 'document'; fileName: string; fileSize?: string; caption?: string }): void {
      const activeId = store.activeConversationId();
      if (!activeId) return;

      const messageId = `msg-${Date.now()}`;
      const now = new Date();
      const timeStr = formatTimeEn(now);
      const displayContent = payload.caption ? payload.caption : (payload.type === 'image' ? '[صورة]' : `[ملف: ${payload.fileName}]`);

      const newMsg: Message = {
        id: messageId,
        conversationId: activeId,
        content: payload.dataUrl,
        contentType: payload.type,
        fileName: payload.fileName,
        fileSize: payload.fileSize,
        direction: 'outgoing',
        time: timeStr,
        createdAt: now.toISOString(),
        channel: store.selectedChannel(),
        senderName: 'أنت',
        deliveryStatus: 'sending',
      };

      patchState(store, state => {
        const existingMessages = state.messages[activeId] ?? [];
        return {
          ...state,
          conversations: state.conversations.map(c =>
            c.id === activeId
              ? {
                  ...c,
                  lastMessage: displayContent,
                  timeAgo: 'Just now',
                  timestamp: timeStr,
                  lastMessageDirection: 'outgoing',
                  lastMessageStatus: 'sending',
                }
              : c,
          ),
          messages: { ...state.messages, [activeId]: [...existingMessages, newMsg] },
          composerText: '',
        };
      });

      const waAccountId = store.selectedWhatsAppAccountId();
      const sendToServer = (mediaUrl: string) => {
        api.sendMessage(activeId, {
          content: mediaUrl,
          content_type: payload.type,
          filename: payload.fileName,
          caption: payload.caption,
          whatsapp_account_id: waAccountId && waAccountId !== 'all' ? waAccountId : undefined,
        }).subscribe({
          next: savedMsg => {
            const mappedSt = mapDeliveryStatus(savedMsg.status);
            patchState(store, state => {
              const list = state.messages[activeId] ?? [];
              const alreadyExists = list.some(
                m => m.id === savedMsg.id || (savedMsg.whatsapp_message_id && m.whatsappMessageId === savedMsg.whatsapp_message_id),
              );
              let updatedMessages: Message[];
              if (alreadyExists) {
                updatedMessages = list.filter(m => m.id !== messageId);
              } else {
                updatedMessages = list.map(m =>
                  m.id === messageId
                    ? {
                        ...m,
                        content: savedMsg.content || mediaUrl,
                        deliveryStatus: mappedSt,
                        id: savedMsg.id,
                        whatsappMessageId: savedMsg.whatsapp_message_id,
                      }
                    : m,
                );
              }
              return {
                ...state,
                conversations: state.conversations.map(c =>
                  c.id === activeId && c.lastMessageDirection === 'outgoing'
                    ? { ...c, lastMessageStatus: mappedSt }
                    : c,
                ),
                messages: {
                  ...state.messages,
                  [activeId]: updatedMessages,
                },
              };
            });
          },
          error: err => {
            console.error('Failed to send media message:', err);
            patchState(store, state => {
              const list = state.messages[activeId] ?? [];
              return {
                ...state,
                conversations: state.conversations.map(c =>
                  c.id === activeId && c.lastMessageDirection === 'outgoing'
                    ? { ...c, lastMessageStatus: 'failed' }
                    : c,
                ),
                messages: {
                  ...state.messages,
                  [activeId]: list.map(m =>
                    m.id === messageId ? { ...m, deliveryStatus: 'failed' as const } : m,
                  ),
                },
              };
            });
          },
        });
      };

      if (payload.file) {
        api.uploadMedia(payload.file).subscribe({
          next: uploadRes => {
            sendToServer(uploadRes.url);
          },
          error: err => {
            console.error('Failed to upload media file:', err);
            sendToServer(payload.dataUrl);
          },
        });
      } else {
        sendToServer(payload.dataUrl);
      }
    },

    sendVoiceMessage(audioDataUrl: string, durationSeconds: number, audioBlob?: Blob): void {
      const activeId = store.activeConversationId();
      if (!activeId) return;

      const messageId = `msg-${Date.now()}`;
      const now = new Date();
      const timeStr = formatTimeEn(now);

      const newMsg: Message = {
        id: messageId,
        conversationId: activeId,
        content: audioDataUrl,
        contentType: 'audio',
        audioDuration: durationSeconds,
        direction: 'outgoing',
        time: timeStr,
        createdAt: now.toISOString(),
        channel: store.selectedChannel(),
        senderName: 'أنت',
        deliveryStatus: 'sending',
      };

      patchState(store, state => {
        const existingMessages = state.messages[activeId] ?? [];
        return {
          ...state,
          conversations: state.conversations.map(c =>
            c.id === activeId
              ? {
                  ...c,
                  lastMessage: '🎤 رسالة صوتية',
                  timeAgo: 'Just now',
                  timestamp: timeStr,
                  lastMessageDirection: 'outgoing',
                  lastMessageStatus: 'sending',
                }
              : c,
          ),
          messages: { ...state.messages, [activeId]: [...existingMessages, newMsg] },
        };
      });

      const waAccountId = store.selectedWhatsAppAccountId();
      const sendAudioToServer = (finalMediaUrl: string) => {
        api.sendMessage(activeId, {
          content: finalMediaUrl,
          content_type: 'audio',
          filename: 'voice_note.ogg',
          whatsapp_account_id: waAccountId && waAccountId !== 'all' ? waAccountId : undefined,
        }).subscribe({
        next: savedMsg => {
          const mappedSt = mapDeliveryStatus(savedMsg.status);
          patchState(store, state => {
            const list = state.messages[activeId] ?? [];
            const alreadyExists = list.some(
              m => m.id === savedMsg.id || (savedMsg.whatsapp_message_id && m.whatsappMessageId === savedMsg.whatsapp_message_id),
            );
            let updatedMessages: Message[];
            if (alreadyExists) {
              updatedMessages = list.filter(m => m.id !== messageId);
            } else {
              updatedMessages = list.map(m =>
                m.id === messageId
                  ? {
                      ...m,
                      content: savedMsg.content || finalMediaUrl,
                      deliveryStatus: mappedSt,
                      id: savedMsg.id,
                      whatsappMessageId: savedMsg.whatsapp_message_id,
                    }
                  : m,
              );
            }
            return {
              ...state,
              conversations: state.conversations.map(c =>
                c.id === activeId && c.lastMessageDirection === 'outgoing'
                  ? { ...c, lastMessageStatus: mappedSt }
                  : c,
              ),
              messages: {
                ...state.messages,
                [activeId]: updatedMessages,
              },
            };
          });
        },
        error: err => {
          console.error(err);
          patchState(store, state => {
            const list = state.messages[activeId] ?? [];
            return {
              ...state,
              conversations: state.conversations.map(c =>
                c.id === activeId && c.lastMessageDirection === 'outgoing'
                  ? { ...c, lastMessageStatus: 'failed' }
                  : c,
              ),
              messages: {
                ...state.messages,
                [activeId]: list.map(m =>
                  m.id === messageId ? { ...m, deliveryStatus: 'failed' as const } : m,
                ),
              },
            };
          });
        },
      });
    };

    if (audioBlob) {
      const audioFile = new File([audioBlob], `voice_${Date.now()}.ogg`, { type: 'audio/ogg' });
      api.uploadMedia(audioFile).subscribe({
        next: uploadRes => sendAudioToServer(uploadRes.url),
        error: () => sendAudioToServer(audioDataUrl),
      });
    } else {
      sendAudioToServer(audioDataUrl);
    }
  },

    dialActiveCustomer(): void {
      const active = store.activeConversation();
      if (!active || !active.phone) return;
      const success = rcWidget.dialNumber(active.phone);
      if (!success) {
        api.triggerRingOut({ toNumber: active.phone }).subscribe({
          next: () => console.log('RingOut triggered for active conversation'),
          error: err => console.error('Failed to trigger RingOut:', err),
        });
      }
    },

    loadCallLogs(): void {
      api.getRingCentralCallLog().subscribe({
        next: res => {
          const records: RingCentralCall[] = (res.records || []).map((r: any) => ({
            id: String(r.id),
            sessionId: r.sessionId,
            direction: r.direction === 'Outbound' ? 'Outbound' : 'Inbound',
            from: { phoneNumber: r.from?.phoneNumber || '', name: r.from?.name },
            to: { phoneNumber: r.to?.phoneNumber || '', name: r.to?.name },
            duration: r.duration || 0,
            result: r.result || 'Accepted',
            startTime: r.startTime || new Date().toISOString(),
          }));
          patchState(store, { callLogs: records });
        },
        error: err => console.error('Failed to load call logs:', err),
      });
    },
  })),
  withHooks({
    onInit(
      store,
      socketService = inject(InboxSocketService),
      rcWidget = inject(RingCentralWidgetService),
    ) {
      rcWidget.callEnd$.subscribe((call: RingCentralCall) => {
        const activeId = store.activeConversationId();
        const durationMin = Math.floor(call.duration / 60);
        const durationSec = call.duration % 60;
        const durationText = `${durationMin}د ${durationSec}ث`;
        const callContent = `📞 مكالمة ${call.direction === 'Outbound' ? 'صادرة' : 'واردة'} عبر RingCentral — المدة: ${durationText} — النتيجة: ${call.result}`;

        const callMsg: Message = {
          id: `rc-call-${Date.now()}`,
          conversationId: activeId || '',
          content: callContent,
          direction: call.direction === 'Outbound' ? 'outgoing' : 'incoming',
          time: formatTimeEn(new Date()),
          createdAt: new Date().toISOString(),
          channel: 'ringcentral',
          senderName: 'RingCentral Telephony',
          deliveryStatus: 'read',
          rcCallId: call.id,
          rcCallDuration: call.duration,
          rcCallResult: call.result,
        };

        patchState(store, state => {
          const targetId = activeId || (state.conversations.length > 0 ? state.conversations[0].id : null);
          if (!targetId) return { ...state, callLogs: [call, ...state.callLogs] };
          const list = state.messages[targetId] ?? [];
          return {
            ...state,
            callLogs: [call, ...state.callLogs],
            messages: { ...state.messages, [targetId]: [...list, callMsg] },
          };
        });
      });
      socketService.onNewMessage$.subscribe((msg: BackendMessage) => {
        const conversationId = msg.conversation_id;
        const mappedMsg: Message = {
          id: msg.id,
          conversationId: msg.conversation_id,
          content: msg.content,
          contentType: (msg.content_type as any) || 'text',
          direction: msg.direction === 'outbound' ? 'outgoing' : 'incoming',
          time: formatTimeEn(msg.created_at),
          createdAt: msg.created_at,
          channel: 'whatsapp',
          senderName: msg.direction === 'outbound' ? 'أنت' : 'العميل',
          deliveryStatus: mapDeliveryStatus(msg.status),
          whatsappMessageId: msg.whatsapp_message_id,
          isTemplate: msg.content_type === 'template',
        };

        patchState(store, state => {
          const existingMessages = state.messages[conversationId] ?? [];

          // 1. تحقق إذا كانت الرسالة موجودة مسبقاً بنفس الـ id أو الـ whatsappMessageId
          const existingByIdIndex = existingMessages.findIndex(
            m => m.id === mappedMsg.id || (m.whatsappMessageId && m.whatsappMessageId === mappedMsg.whatsappMessageId),
          );

          // 2. إذا كانت رسالة صادرة متطابقة مع رسالة مؤقتة محلية جاري إرسالها (optimistic pending)
          const optimisticIndex = mappedMsg.direction === 'outgoing'
            ? existingMessages.findIndex(
                m => m.direction === 'outgoing' &&
                     (m.id.startsWith('msg-') || m.deliveryStatus === 'sending') &&
                     (
                       m.content.trim() === mappedMsg.content.trim() ||
                       (mappedMsg.contentType === 'audio' && (m.contentType === 'audio' || m.content.startsWith('data:audio/'))) ||
                       (mappedMsg.contentType === 'image' && (m.contentType === 'image' || m.content.startsWith('data:image/'))) ||
                       (mappedMsg.contentType === 'document' && (m.contentType === 'document' || m.content.startsWith('data:application/'))) ||
                       (mappedMsg.isTemplate && m.isTemplate)
                     ),
              )
            : -1;

          let updatedList: Message[];
          if (existingByIdIndex !== -1) {
            updatedList = existingMessages.map((m, idx) =>
              idx === existingByIdIndex ? { ...m, ...mappedMsg } : m,
            );
          } else if (optimisticIndex !== -1) {
            updatedList = existingMessages.map((m, idx) =>
              idx === optimisticIndex ? { ...m, ...mappedMsg } : m,
            );
          } else {
            updatedList = [...existingMessages, mappedMsg];
          }

          // تنظيف أي رسائل متفائلة معلقة مطابقة لمنع التكرار نهائياً
          if (mappedMsg.direction === 'outgoing') {
            updatedList = updatedList.filter(m => {
              if (m.id === mappedMsg.id) return true;
              if (m.id.startsWith('msg-') && m.deliveryStatus === 'sending') {
                if (mappedMsg.contentType === 'audio' && (m.contentType === 'audio' || m.content.startsWith('data:audio/'))) return false;
                if (mappedMsg.contentType === 'image' && (m.contentType === 'image' || m.content.startsWith('data:image/'))) return false;
                if (mappedMsg.contentType === 'document' && (m.contentType === 'document' || m.content.startsWith('data:application/'))) return false;
                if (mappedMsg.contentType === 'text' && m.content.trim() === mappedMsg.content.trim()) return false;
              }
              return true;
            });
          }

          // تطبيق عدم تكرار الـ IDs
          const seenIds = new Set<string>();
          const dedupedList: Message[] = [];
          for (const m of updatedList) {
            if (seenIds.has(m.id)) continue;
            seenIds.add(m.id);
            if (m.whatsappMessageId) {
              const waKey = `wa-${m.whatsappMessageId}`;
              if (seenIds.has(waKey)) continue;
              seenIds.add(waKey);
            }
            dedupedList.push(m);
          }

          const updatedConvs = state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage:
                    mappedMsg.contentType === 'image' || (mappedMsg.content && mappedMsg.content.includes('/media/'))
                      ? 'صورة'
                      : mappedMsg.contentType === 'document'
                        ? 'مستند'
                        : mappedMsg.contentType === 'audio'
                          ? 'تسجيل صوتي'
                          : mappedMsg.content,
                  lastMessageAt: mappedMsg.createdAt,
                  timeAgo: 'Just now',
                  timestamp: formatTimeEn(mappedMsg.createdAt),
                  lastMessageDirection: mappedMsg.direction,
                  lastMessageStatus: mappedMsg.deliveryStatus,
                }
              : c,
          );

          return {
            ...state,
            conversations: updatedConvs,
            messages: {
              ...state.messages,
              [conversationId]: dedupedList,
            },
          };
        });
      });

      socketService.onConversationUpdated$.subscribe((conv: BackendConversation) => {
        patchState(store, state => {
          const updatedConversations = state.conversations.map(c => {
            if (c.id === conv.id) {
              return {
                ...c,
                lastMessage: conv.last_message || c.lastMessage || '',
                timeAgo: conv.last_message_at
                  ? formatRelativeDateEn(conv.last_message_at)
                  : 'Just now',
                timestamp: conv.last_message_at
                  ? formatTimeEn(conv.last_message_at)
                  : 'Just now',
                lastMessageAt: conv.last_message_at,
                lastMessageDirection: conv.last_message_direction === 'outbound' ? 'outgoing' : (conv.last_message_direction === 'inbound' ? 'incoming' : c.lastMessageDirection),
                lastMessageStatus: conv.last_message_status ? mapDeliveryStatus(conv.last_message_status) : c.lastMessageStatus,
                status: 'completed' as any,
                statusLabel: '',
                unreadCount:
                  store.activeConversationId() !== c.id
                    ? (c.unreadCount ?? 0) + 1
                    : 0,
              };
            }
            return c;
          });
          return { ...state, conversations: updatedConversations };
        });
      });

      socketService.onMessageStatusUpdated$.subscribe(data => {
        patchState(store, state => {
          const mappedStatus = mapDeliveryStatus(data.status);
          const convId = data.conversationId;
          const targetIds = convId ? [convId] : Object.keys(state.messages);

          const newMessages = { ...state.messages };
          for (const cId of targetIds) {
            const list = state.messages[cId];
            if (!list) continue;
            newMessages[cId] = list.map(m => {
              if (
                (data.messageId && m.id === data.messageId) ||
                (data.whatsappMessageId && m.whatsappMessageId === data.whatsappMessageId)
              ) {
                return {
                  ...m,
                  deliveryStatus: mappedStatus,
                };
              }
              return m;
            });
          }

          const updatedConversations = state.conversations.map(c => {
            if (targetIds.includes(c.id) && c.lastMessageDirection === 'outgoing') {
              return {
                ...c,
                lastMessageStatus: mappedStatus,
              };
            }
            return c;
          });

          return { ...state, conversations: updatedConversations, messages: newMessages };
        });
      });
    },
  }),
);

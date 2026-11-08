export type ConversationStatus = 'needs-reply' | 'completed' | 'unread' | 'awaiting-customer';

export type RequestCategory =
  | 'renewal'
  | 'audio-issue'
  | 'payment-confirm'
  | 'hardware-setup'
  | 'general';

export type FilterType = 'all' | 'unread';

export type MessageDeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type MessagingChannel = 'whatsapp' | 'sms' | 'ringcentral';

export interface DeviceCredentials {
  macAddress: string;
  deviceKey: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  title: string;
  category: 'UTILITY' | 'MARKETING';
  language: string;
  previewText: string;
}

export interface Conversation {
  id: string;
  contactName: string;
  contactNameEn: string;
  initial: string;
  phone: string;
  city: string;
  state: string;
  email?: string;
  lastMessage: string;
  timeAgo: string;
  timestamp: string;
  lastMessageAt?: string;
  lastCustomerMessageAt?: string;
  status: ConversationStatus;
  statusLabel: string;
  category: RequestCategory;
  categoryLabel: string;
  unreadCount?: number;
  lastMessageDirection?: 'incoming' | 'outgoing';
  lastMessageStatus?: MessageDeliveryStatus;
  isOnline: boolean;
  isTyping?: boolean;
  linkedOrderId?: string;
  orderIdRaw?: string;
  linkedPlan?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  contentType?: 'text' | 'image' | 'document' | 'audio' | 'template';
  fileName?: string;
  fileSize?: string;
  audioDuration?: number;
  direction: 'incoming' | 'outgoing';
  time: string;
  channel: MessagingChannel;
  channelLabel?: string;
  senderName?: string;
  isAwaitingReply?: boolean;
  deliveryStatus?: MessageDeliveryStatus;
  deviceCreds?: DeviceCredentials;
  whatsappMessageId?: string;
  rcCallId?: string;
  rcCallDuration?: number;
  rcCallResult?: string;
  isTemplate?: boolean;
  createdAt?: string;
}

export interface RingCentralCall {
  id: string;
  sessionId?: string;
  direction: 'Inbound' | 'Outbound';
  from: { phoneNumber: string; name?: string };
  to: { phoneNumber: string; name?: string };
  duration: number; // بالثانية
  result: 'Accepted' | 'Missed' | 'Declined' | 'NoAnswer' | string;
  startTime: string;
  recordingUrl?: string;
}

export interface AiSuggestion {
  conversationId: string;
  text: string;
}


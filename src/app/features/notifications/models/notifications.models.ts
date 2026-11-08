export type NotificationCategory = 'all' | 'followup' | 'expiry' | 'messages' | 'tasks' | 'system';
export type NotificationStatus = 'read' | 'unread';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  category: NotificationCategory;
  status: NotificationStatus;
  groupDate: 'اليوم' | 'أمس' | 'الأسبوع الماضي';
  icon: string;
  tags?: string[];
  actionLabel?: string;
  isImportant?: boolean;
}

export interface NotificationFilterState {
  activeCategory: NotificationCategory;
}

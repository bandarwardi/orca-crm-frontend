import { computed, inject } from '@angular/core';
import { NotificationsApiService } from '../../../core/services/api/notifications-api.service';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { NotificationCategory, NotificationFilterState, NotificationItem } from '../models/notifications.models';
import { formatDateTimeEn } from '../../../core/utils/date-format.util';

export interface NotificationsState {
  items: NotificationItem[];
  filters: NotificationFilterState;
  isLoading: boolean;
}

const initialState: NotificationsState = {
  items: [],
  filters: {
    activeCategory: 'all'
  },
  isLoading: false
};

export const NotificationsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ items, filters }) => ({
    filteredItems: computed(() => {
      const active = filters.activeCategory();
      if (active === 'all') return items();
      return items().filter(item => item.category === active);
    }),
    
    // Grouping by date
    groupedItems: computed(() => {
      const active = filters.activeCategory();
      const filtered = active === 'all' ? items() : items().filter(item => item.category === active);
      
      const groups = new Map<string, NotificationItem[]>();
      filtered.forEach(item => {
        const group = item.groupDate;
        if (!groups.has(group)) {
          groups.set(group, []);
        }
        groups.get(group)!.push(item);
      });
      
      // Convert to array of { label: string, items: NotificationItem[] }
      const result = [];
      if (groups.has('اليوم')) result.push({ label: 'اليوم', items: groups.get('اليوم')! });
      if (groups.has('أمس')) result.push({ label: 'أمس', items: groups.get('أمس')! });
      if (groups.has('الأسبوع الماضي')) result.push({ label: 'الأسبوع الماضي', items: groups.get('الأسبوع الماضي')! });
      
      return result;
    }),

    // Counters
    totalUnread: computed(() => items().filter(i => i.status === 'unread').length),
    followupCount: computed(() => items().filter(i => i.category === 'followup').length),
    expiryCount: computed(() => items().filter(i => i.category === 'expiry').length),
    messagesCount: computed(() => items().filter(i => i.category === 'messages').length),
    tasksCount: computed(() => items().filter(i => i.category === 'tasks').length)
  })),
  withMethods((store, api = inject(NotificationsApiService)) => ({
    loadNotifications() {
      patchState(store, { isLoading: true });
      api.getMyNotifications().subscribe({
        next: (res: any) => {
          const list: any[] = Array.isArray(res) ? res : (res?.data || []);
          const items: NotificationItem[] = list.map(n => {
             const categoryMap: any = {
               'system': 'system',
               'followup': 'followup',
               'expiry': 'expiry',
               'messages': 'messages',
               'tasks': 'tasks'
             };
             const iconMap: any = {
               'system': 'campaign',
               'followup': 'schedule',
               'expiry': 'warning',
               'messages': 'forum',
               'tasks': 'checklist'
             };
             
             return {
               id: n.id,
               title: n.title,
               description: n.description || '',
               timeLabel: formatDateTimeEn(n.created_at),
               category: categoryMap[n.category] || 'system',
               status: n.status === 'read' ? 'read' : 'unread',
               groupDate: 'اليوم',
               icon: iconMap[n.category] || 'notifications',
               tags: [],
               isImportant: n.is_important
             };
          });
          patchState(store, { items, isLoading: false });
        },
        error: (err: any) => {
          console.error(err);
          patchState(store, { isLoading: false });
        }
      });
    },
    setCategory(category: NotificationCategory): void {
      patchState(store, (state) => ({
        filters: { ...state.filters, activeCategory: category }
      }));
    },
    markAllAsRead(): void {
      patchState(store, (state) => ({
        items: state.items.map(item => ({ ...item, status: 'read' }))
      }));
    },
    markAsRead(id: string): void {
      patchState(store, (state) => ({
        items: state.items.map(item => item.id === id ? { ...item, status: 'read' } : item)
      }));
    }
  }))
);

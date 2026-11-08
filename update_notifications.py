import re

file_path = "f:/apps/orca/crm/src/app/features/notifications/store/notifications.store.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add imports
content = content.replace(
    "import { computed } from '@angular/core';",
    "import { computed, inject } from '@angular/core';\nimport { NotificationsApiService } from '../../../../core/services/api/notifications-api.service';"
)

# Update Interface
content = content.replace(
    "export interface NotificationsState {\n  items: NotificationItem[];\n  filters: NotificationFilterState;\n}",
    "export interface NotificationsState {\n  items: NotificationItem[];\n  filters: NotificationFilterState;\n  isLoading: boolean;\n}"
)

# Replace mock data
initial_state_match = re.search(r"const initialState: NotificationsState = \{[\s\S]*?filters: \{\n    activeCategory: 'all'\n  \}\n\};", content)
if initial_state_match:
    new_initial_state = """const initialState: NotificationsState = {
  items: [],
  filters: {
    activeCategory: 'all'
  },
  isLoading: false
};"""
    content = content.replace(initial_state_match.group(0), new_initial_state)

# Update withMethods injection
content = content.replace(
    "withMethods((store) => ({",
    "withMethods((store, api = inject(NotificationsApiService)) => ({"
)

# Add loadNotifications
load_notifications_str = """
    loadNotifications() {
      patchState(store, { isLoading: true });
      api.getMyNotifications().subscribe({
        next: (data: any[]) => {
          const items: NotificationItem[] = data.map(n => {
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
               timeLabel: new Date(n.created_at).toLocaleString('ar-SA'),
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
        error: (err) => {
          console.error(err);
          patchState(store, { isLoading: false });
        }
      });
    },"""

content = content.replace(
    "withMethods((store, api = inject(NotificationsApiService)) => ({",
    "withMethods((store, api = inject(NotificationsApiService)) => ({" + load_notifications_str
)

# Update markAllAsRead
old_mark_all = r"markAllAsRead\(\): void \{[\s\S]*?\}\)\n    \},"
new_mark_all = """markAllAsRead(): void {
      // Pass the required userId if you have it or modify the backend/api service to not require it if it reads from token.
      // For now passing empty string as it might be handled in backend.
      api.markAllAsRead('').subscribe({
        next: () => {
          patchState(store, (state) => ({
            items: state.items.map(item => ({ ...item, status: 'read' }))
          }));
        },
        error: (err) => console.error(err)
      });
    },"""
content = re.sub(old_mark_all, new_mark_all, content)

# Update markAsRead
old_mark = r"markAsRead\(id: string\): void \{[\s\S]*?\}\)\n    \}"
new_mark = """markAsRead(id: string): void {
      api.markAsRead(id).subscribe({
        next: () => {
          patchState(store, (state) => ({
            items: state.items.map(item => item.id === id ? { ...item, status: 'read' } : item)
          }));
        },
        error: (err) => console.error(err)
      });
    }"""
content = re.sub(old_mark, new_mark, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Notifications store updated")

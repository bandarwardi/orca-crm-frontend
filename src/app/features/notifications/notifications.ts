import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsStore } from './store/notifications.store';
import { NotificationCategory } from './models/notifications.models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  host: {
    class: 'flex-1 min-h-0 overflow-y-auto w-full p-space-sm sm:p-space-md lg:p-space-lg'
  }
})
export class Notifications implements OnInit {
  store = inject(NotificationsStore);

  ngOnInit() {
    this.store.loadNotifications();
  }

  setCategory(category: NotificationCategory): void {
    this.store.setCategory(category);
  }
}

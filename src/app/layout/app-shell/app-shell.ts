import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Avatar } from '../../shared/components/avatar/avatar';
import { GlobalSearchComponent } from '../../shared/components/global-search/global-search';
import { AuthStore } from '../../core/state/auth.store';
import { OrdersStore } from '../../features/orders/store/orders.store';
import { LeadsStore } from '../../features/leads/state/leads.store';
import { InboxStore } from '../../features/inbox/store/inbox.store';
import { NotificationsStore } from '../../features/notifications/store/notifications.store';
import { NotificationItem } from '../../features/notifications/models/notifications.models';
import { RingCentralSoftphone } from '../../shared/components/ringcentral-softphone/ringcentral-softphone';
import { RingCentralWidgetService } from '../../core/services/ringcentral-widget.service';
import { CallNotificationComponent } from '../../shared/components/call-notification/call-notification';
import { InboxSocketService } from '../../core/services/inbox-socket.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, Avatar, GlobalSearchComponent, RingCentralSoftphone, CallNotificationComponent],
  template: `
    <div class="bg-canvas font-body-md text-on-surface antialiased h-screen w-full flex flex-row overflow-hidden relative" dir="rtl">
      <!-- Mobile Backdrop Overlay -->
      @if (isSidebarOpen()) {
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          (click)="closeSidebar()"
        ></div>
      }

      <!-- 1. RIGHT SIDEBAR (Full height, Deep Indigo Dark Surface for High Contrast) -->
      <aside
        class="fixed inset-y-0 right-0 z-50 w-72 flex-shrink-0 bg-sidebar border-s border-border-dark flex flex-col justify-between select-none h-screen shadow-2xl lg:shadow-none transition-transform duration-300 lg:static lg:translate-x-0"
        [class.translate-x-full]="!isSidebarOpen()"
        [class.translate-x-0]="isSidebarOpen()"
      >
        <div class="flex flex-col flex-1 min-h-0">
          <!-- Logo & Brand Header -->
          <div class="h-16 px-space-md flex items-center justify-between bg-sidebar border-b border-white/10 flex-shrink-0">
            <div class="flex items-center gap-space-xs">
              <div class="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-[16px] shadow-sm">
                <span class="material-symbols-outlined text-[20px]">play_arrow</span>
              </div>
              <div class="flex flex-col">
                <span class="font-headline-sm text-headline-sm text-white tracking-tight font-bold leading-tight">orca CRM</span>
                <span class="font-label-sm text-[10px] leading-tight text-sidebar-text/70 font-medium">نظام إدارة المشتركين</span>
              </div>
            </div>

            <div class="flex items-center gap-1.5">
              <div class="inline-flex items-center px-2 py-0.5 rounded-full bg-white/10 text-brand-100 font-label-sm text-[11px] font-semibold border border-white/10">
                مؤسسي
              </div>
              <!-- Mobile close button -->
              <button
                type="button"
                class="lg:hidden p-1 rounded-lg text-sidebar-icon hover:bg-white/10 hover:text-white transition-colors"
                (click)="closeSidebar()"
                title="إغلاق القائمة"
              >
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          <!-- Navigation links -->
          <nav class="p-space-sm space-y-1 flex-1 overflow-y-auto custom-scrollbar">
            <a routerLink="/dashboard" routerLinkActive="bg-sidebar-active !text-white font-semibold shadow-sm" [routerLinkActiveOptions]="{exact: true}"
               (click)="closeSidebar()"
               class="group flex items-center gap-space-sm px-space-sm py-2.5 rounded-lg text-sidebar-text hover:bg-white/5 hover:text-white transition-all font-label-md text-label-md">
              <span class="material-symbols-outlined text-[20px] text-sidebar-icon group-hover:text-white transition-colors">dashboard</span>
              <span>الرئيسية</span>
            </a>
            <a routerLink="/leads" routerLinkActive="bg-sidebar-active !text-white font-semibold shadow-sm"
               (click)="closeSidebar()"
               class="group flex items-center gap-space-sm px-space-sm py-2.5 rounded-lg text-sidebar-text hover:bg-white/5 hover:text-white transition-all font-label-md text-label-md">
              <span class="material-symbols-outlined text-[20px] text-sidebar-icon group-hover:text-white transition-colors">person_search</span>
              <span>العملاء المحتملون</span>
            </a>
            <a routerLink="/orders" routerLinkActive="bg-sidebar-active !text-white font-semibold shadow-sm"
               (click)="closeSidebar()"
               class="group flex items-center justify-between px-space-sm py-2.5 rounded-lg text-sidebar-text hover:bg-white/5 hover:text-white transition-all font-label-md text-label-md">
              <div class="flex items-center gap-space-sm">
                <span class="material-symbols-outlined text-[20px] text-sidebar-icon group-hover:text-white transition-colors">receipt_long</span>
                <span>الطلبات</span>
              </div>
              @if (ordersStore.totalOrdersCount() > 0) {
                <span class="px-1.5 py-0.2 rounded-full bg-white/10 text-brand-100 font-code-sm text-[11px] font-semibold">{{ ordersStore.totalOrdersCount() }}</span>
              }
            </a>
            <a routerLink="/inbox" routerLinkActive="bg-sidebar-active !text-white font-semibold shadow-sm"
               (click)="closeSidebar()"
               class="group flex items-center justify-between px-space-sm py-2.5 rounded-lg text-sidebar-text hover:bg-white/5 hover:text-white transition-all font-label-md text-label-md">
              <div class="flex items-center gap-space-sm">
                <span class="material-symbols-outlined text-[20px] text-sidebar-icon group-hover:text-white transition-colors">forum</span>
                <span>صندوق المحادثات</span>
              </div>
              @if (inboxBadge() > 0) {
                <span class="px-1.5 py-0.2 rounded-full bg-white/10 text-brand-100 font-code-sm text-[11px] font-semibold">{{ inboxBadge() }}</span>
              }
            </a>
            <a routerLink="/performance" routerLinkActive="bg-sidebar-active !text-white font-semibold shadow-sm"
               (click)="closeSidebar()"
               class="group flex items-center gap-space-sm px-space-sm py-2.5 rounded-lg text-sidebar-text hover:bg-white/5 hover:text-white transition-all font-label-md text-label-md">
              <span class="material-symbols-outlined text-[20px] text-sidebar-icon group-hover:text-white transition-colors">monitoring</span>
              <span>الأداء</span>
            </a>
            <a routerLink="/map" routerLinkActive="bg-sidebar-active !text-white font-semibold shadow-sm"
               (click)="closeSidebar()"
               class="group flex items-center gap-space-sm px-space-sm py-2.5 rounded-lg text-sidebar-text hover:bg-white/5 hover:text-white transition-all font-label-md text-label-md">
              <span class="material-symbols-outlined text-[20px] text-sidebar-icon group-hover:text-white transition-colors">map</span>
              <span>خريطة المشتركين</span>
            </a>
            <a routerLink="/notifications" routerLinkActive="bg-sidebar-active !text-white font-semibold shadow-sm"
               (click)="closeSidebar()"
               class="group flex items-center justify-between px-space-sm py-2.5 rounded-lg text-sidebar-text hover:bg-white/5 hover:text-white transition-all font-label-md text-label-md">
              <div class="flex items-center gap-space-sm">
                <span class="material-symbols-outlined text-[20px] text-sidebar-icon group-hover:text-white transition-colors">notifications</span>
                <span>الإشعارات</span>
              </div>
              @if (notificationsStore.totalUnread() > 0) {
                <span class="px-1.5 py-0.2 rounded-full bg-accent-rose text-white font-code-sm text-[10px] font-bold">{{ notificationsStore.totalUnread() }}</span>
              }
            </a>
            <a routerLink="/settings" routerLinkActive="bg-sidebar-active !text-white font-semibold shadow-sm"
               (click)="closeSidebar()"
               class="group flex items-center gap-space-sm px-space-sm py-2.5 rounded-lg text-sidebar-text hover:bg-white/5 hover:text-white transition-all font-label-md text-label-md">
              <span class="material-symbols-outlined text-[20px] text-sidebar-icon group-hover:text-white transition-colors">settings</span>
              <span>الإعدادات</span>
            </a>
          </nav>
        </div>

        <!-- User Profile Card & Footer -->
        <div class="p-space-sm bg-sidebar border-t border-white/10 flex-shrink-0">
          <div class="p-space-xs rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-space-xs mb-space-xs">
            <div class="flex items-center gap-space-xs min-w-0">
              <div class="relative flex-shrink-0">
                <app-avatar [name]="userName()" size="sm"></app-avatar>
                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-accent-emerald ring-2 ring-sidebar" title="متصل"></span>
              </div>
              <div class="flex flex-col truncate">
                <span class="font-label-md text-label-md text-white font-semibold truncate leading-tight">{{ userName() }}</span>
                <span class="font-label-sm text-[11px] leading-tight text-sidebar-text/80 truncate">{{ userRoleLabel() }}</span>
              </div>
            </div>
            <button class="w-8 h-8 rounded-lg flex items-center justify-center text-sidebar-icon hover:bg-white/10 hover:text-white transition-colors flex-shrink-0" title="تسجيل خروج" (click)="onLogout()">
              <span class="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
          <div class="text-center px-1">
            <span class="font-code-sm text-[10px] text-sidebar-icon/60 block tracking-tight">Powered by orcaXTECH • v4.18.2</span>
          </div>
        </div>
      </aside>

      <!-- 2. MAIN CONTENT AREA (Left of sidebar in RTL) -->
      <div class="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-canvas">
        <!-- Top Header inside content area -->
        <header class="h-16 flex-shrink-0 bg-surface/90 backdrop-blur-xl border-b border-border-subtle z-30 px-3 sm:px-space-lg flex items-center justify-between gap-2 sm:gap-space-md shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <!-- Right side in RTL: Hamburger Menu (Mobile) + Search Input -->
          <div class="flex items-center gap-2 sm:gap-space-md flex-1 max-w-xl">
            <!-- Mobile Hamburger Toggle -->
            <button
              type="button"
              class="lg:hidden w-10 h-10 -mr-1 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors shrink-0"
              (click)="toggleSidebar()"
              title="القائمة الجانبية"
            >
              <span class="material-symbols-outlined text-[24px]">menu</span>
            </button>

            <!-- Search bar (Global search palette) -->
            <div class="relative w-full hidden sm:block">
              <app-global-search></app-global-search>
            </div>

            <!-- Mobile-only quick title or logo mark if search is hidden -->
            <div class="sm:hidden flex items-center gap-1.5">
              <span class="font-headline-sm text-headline-sm text-brand-600 font-bold">orca</span>
            </div>
          </div>

          <!-- Actions on Left in RTL -->
          <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <!-- Notifications Dropdown -->
            <div class="relative">
              <button
                type="button"
                (click)="toggleNotifications()"
                class="relative w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
                title="الإشعارات"
                [attr.aria-expanded]="isNotificationsOpen()"
              >
                <span class="material-symbols-outlined text-[22px]">notifications</span>
                @if (notificationsStore.totalUnread() > 0) {
                  <span class="absolute top-1.5 left-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 text-white font-code-sm text-[10px] font-bold px-1 shadow-xs">
                    {{ notificationsStore.totalUnread() }}
                  </span>
                }
              </button>

              <!-- Notifications Menu Dropdown -->
              @if (isNotificationsOpen()) {
                <!-- Backdrop to dismiss dropdown -->
                <div class="fixed inset-0 z-40" (click)="closeNotifications()"></div>

                <div class="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface border border-border-subtle shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150" dir="rtl">
                  <!-- Header -->
                  <div class="p-3.5 px-4 bg-surface-alt border-b border-border-subtle flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-[20px] text-brand-600">notifications</span>
                      <h3 class="font-bold text-sm text-on-surface">الإشعارات</h3>
                      @if (notificationsStore.totalUnread() > 0) {
                        <span class="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 text-[11px] font-bold">
                          {{ notificationsStore.totalUnread() }} غير مقروء
                        </span>
                      }
                    </div>

                    @if (notificationsStore.totalUnread() > 0) {
                      <button
                        type="button"
                        (click)="markAllNotificationsRead()"
                        class="text-xs text-brand-600 hover:text-brand-700 font-semibold hover:underline cursor-pointer"
                      >
                        تحديد الكل كمقروء
                      </button>
                    }
                  </div>

                  <!-- Notifications Items List -->
                  <div class="max-h-80 overflow-y-auto divide-y divide-border-subtle/50 custom-scrollbar">
                    @if (recentNotifications().length === 0) {
                      <div class="py-8 px-4 text-center text-on-surface-variant flex flex-col items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-[32px] text-outline">notifications_off</span>
                        <p class="text-xs font-medium">لا توجد إشعارات حالياً</p>
                      </div>
                    } @else {
                      @for (item of recentNotifications(); track item.id) {
                        <div
                          (click)="onNotificationItemClick(item)"
                          class="p-3.5 px-4 hover:bg-surface-container/60 transition-colors cursor-pointer flex items-start gap-3 relative"
                          [class.bg-brand-500/5]="item.status === 'unread'"
                        >
                          <!-- Category Icon Badge -->
                          <div
                            class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            [ngClass]="{
                              'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400': item.category === 'expiry',
                              'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400': item.category === 'messages',
                              'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400': item.category === 'followup',
                              'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400': item.category === 'tasks',
                              'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300': item.category === 'system'
                            }"
                          >
                            <span class="material-symbols-outlined text-[17px]">{{ item.icon || 'notifications' }}</span>
                          </div>

                          <!-- Text Content -->
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between gap-1 mb-0.5">
                              <h4 class="text-xs font-bold text-on-surface truncate">{{ item.title }}</h4>
                              <span class="text-[10px] text-on-surface-variant shrink-0">{{ item.timeLabel }}</span>
                            </div>
                            <p class="text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">
                              {{ item.description }}
                            </p>
                          </div>

                          <!-- Unread Indicator Dot -->
                          @if (item.status === 'unread') {
                            <span class="w-2 h-2 rounded-full bg-brand-600 shrink-0 self-center"></span>
                          }
                        </div>
                      }
                    }
                  </div>

                  <!-- Footer: Link to Full Notifications Page -->
                  <div class="p-2.5 bg-surface-alt border-t border-border-subtle flex items-center justify-center">
                    <a
                      routerLink="/notifications"
                      (click)="closeNotifications()"
                      class="w-full py-1.5 text-center text-xs font-bold text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      عرض جميع الإشعارات
                    </a>
                  </div>
                </div>
              }
            </div>

            <!-- RingCentral Phone Launcher Button -->
            <button
              type="button"
              (click)="rcService.toggleDialer()"
              class="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer"
              [class.bg-emerald-500/15]="rcService.isDialerOpen() || rcService.callState() !== 'idle'"
              [class.text-emerald-600]="rcService.isDialerOpen() || rcService.callState() !== 'idle'"
              [class.text-on-surface-variant]="!rcService.isDialerOpen() && rcService.callState() === 'idle'"
              [class.hover:bg-surface-container]="!rcService.isDialerOpen() && rcService.callState() === 'idle'"
              title="هاتف RingCentral (الاتصال الهاتفي و SMS)"
            >
              <span class="material-symbols-outlined text-[22px]" [class.animate-pulse]="rcService.callState() !== 'idle'">
                phone_in_talk
              </span>
              @if (rcService.callState() !== 'idle') {
                <span class="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span class="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              } @else {
                <span class="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              }
            </button>

            <!-- Primary Button: طلب جديد -->
            <button class="h-9 px-3 sm:px-space-sm rounded-xl bg-brand-600 text-white hover:bg-brand-700 font-label-md text-label-md flex items-center gap-1.5 transition-colors shadow-sm active:scale-95 cursor-pointer" routerLink="/orders/new">
              <span class="material-symbols-outlined text-[18px]">add</span>
              <span class="hidden sm:inline font-semibold">طلب جديد</span>
            </button>
          </div>
        </header>

        <!-- Main Routed Content -->
        <main class="flex-1 bg-canvas min-w-0 flex flex-col overflow-hidden min-h-0">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- RingCentral Softphone Floating Widget -->
      <app-ringcentral-softphone></app-ringcentral-softphone>

      <!-- WhatsApp WebRTC Incoming & Active Call Floating Banner -->
      <app-call-notification></app-call-notification>
    </div>
  `
})
export class AppShell implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly ordersStore = inject(OrdersStore);
  readonly leadsStore = inject(LeadsStore);
  readonly inboxStore = inject(InboxStore);
  readonly notificationsStore = inject(NotificationsStore);
  readonly rcService = inject(RingCentralWidgetService);
  readonly socketService = inject(InboxSocketService);
  private router = inject(Router);

  isSidebarOpen = signal(false);
  isNotificationsOpen = signal(false);

  readonly userName = computed(() => this.authStore.user()?.name || 'مستخدم النظام');
  readonly userRoleLabel = computed(() => {
    const role = this.authStore.user()?.role;
    switch (role) {
      case 'admin':
      case 'ADMIN':
        return 'مدير النظام';
      case 'sales_rep':
      case 'SALES_REP':
        return 'موظف مبيعات';
      case 'sales_supervisor':
      case 'SALES_SUPERVISOR':
        return 'مشرف مبيعات';
      case 'support':
      case 'SUPPORT':
        return 'دعم فني';
      default:
        return 'مدير إدارة الحسابات';
    }
  });

  readonly inboxBadge = computed(() => {
    const unread = this.inboxStore.unreadCount();
    return unread > 0 ? unread : this.inboxStore.conversations().length;
  });

  readonly recentNotifications = computed(() => this.notificationsStore.items().slice(0, 5));

  ngOnInit(): void {
    // Ensure default light mode
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');

    this.ordersStore.loadOrders();
    this.leadsStore.loadLeads();
    this.inboxStore.loadConversations();
    this.notificationsStore.loadNotifications();

    const token = this.authStore.userToken() || '';
    const tenantId = this.authStore.tenantId() || '';
    if (token) {
      this.socketService.connect(token, tenantId);
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  toggleNotifications(): void {
    this.isNotificationsOpen.update(v => !v);
  }

  closeNotifications(): void {
    this.isNotificationsOpen.set(false);
  }

  markAllNotificationsRead(): void {
    this.notificationsStore.markAllAsRead();
  }

  onNotificationItemClick(item: NotificationItem): void {
    if (item.status === 'unread') {
      this.notificationsStore.markAsRead(item.id);
    }
    this.closeNotifications();
    this.router.navigate(['/notifications']);
  }

  onLogout(): void {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }
}

import re

# File 1: Orders List
orders_path = "f:/apps/orca/crm/src/app/features/orders/components/orders-list/orders-list.ts"
with open(orders_path, "r", encoding="utf-8") as f:
    orders_content = f.read()

orders_content = orders_content.replace(
    "import { PhoneFormatPipe } from '../../../../shared/pipes/phone-format.pipe';",
    "import { PhoneFormatPipe } from '../../../../shared/pipes/phone-format.pipe';\nimport { ErrorState } from '../../../../shared/components/error-state/error-state';\nimport { LoadingState } from '../../../../shared/components/loading-state/loading-state';\nimport { EmptyState } from '../../../../shared/components/empty-state/empty-state';"
)

orders_content = orders_content.replace(
    "imports: [CommonModule, RouterModule, FormsModule, OrderStatusBadge, PhoneFormatPipe],",
    "imports: [CommonModule, RouterModule, FormsModule, OrderStatusBadge, PhoneFormatPipe, ErrorState, LoadingState, EmptyState],"
)

orders_list_replacement = """        <!-- Orders Cards List -->
        @if (store.isLoading() && store.orders().length === 0) {
          <div class="flex-1 flex items-center justify-center p-10">
            <app-loading-state type="spinner" text="جاري تحميل الطلبات..."></app-loading-state>
          </div>
        } @else if (store.error()) {
          <div class="flex-1 flex items-center justify-center p-10">
            <app-error-state [message]="store.error() || ''" (retry)="store.loadOrders()"></app-error-state>
          </div>
        } @else if (store.filteredOrders().length > 0) {
          <div class="flex flex-col gap-3 relative">
            @if (store.isLoading()) {
              <div class="absolute inset-0 z-10 bg-canvas/50 backdrop-blur-[2px] flex items-center justify-center">
                <app-loading-state type="spinner" text="جاري التحديث..."></app-loading-state>
              </div>
            }"""
orders_content = orders_content.replace(
    """        <!-- Orders Cards List -->
        @if (store.filteredOrders().length > 0) {
          <div class="flex flex-col gap-3">""",
    orders_list_replacement
)

with open(orders_path, "w", encoding="utf-8") as f:
    f.write(orders_content)

# File 2: Inbox Shell
inbox_path = "f:/apps/orca/crm/src/app/features/inbox/components/inbox-shell/inbox-shell.ts"
with open(inbox_path, "r", encoding="utf-8") as f:
    inbox_content = f.read()

inbox_content = inbox_content.replace(
    "import { ChatArea } from '../chat-area/chat-area';",
    "import { ChatArea } from '../chat-area/chat-area';\nimport { ErrorState } from '../../../../shared/components/error-state/error-state';\nimport { LoadingState } from '../../../../shared/components/loading-state/loading-state';\nimport { EmptyState } from '../../../../shared/components/empty-state/empty-state';"
)

inbox_content = inbox_content.replace(
    "imports: [CommonModule, ConversationList, ChatArea],",
    "imports: [CommonModule, ConversationList, ChatArea, ErrorState, LoadingState, EmptyState],"
)

inbox_replacement = """    <div class="flex-1 flex overflow-hidden relative">
      @if (store.isLoading() && store.conversations().length === 0) {
        <div class="absolute inset-0 z-10 flex items-center justify-center bg-surface">
          <app-loading-state type="spinner" text="جاري تحميل المحادثات..."></app-loading-state>
        </div>
      } @else if (store.error()) {
        <div class="absolute inset-0 z-10 flex items-center justify-center bg-surface">
          <app-error-state [message]="store.error() || ''" (retry)="store.loadConversations()"></app-error-state>
        </div>
      } @else {
        <!-- Sidebar -->"""
inbox_content = inbox_content.replace(
    """    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->""",
    inbox_replacement
)
inbox_content = inbox_content.replace(
    "      </main>\n    </div>",
    "      </main>\n      }\n    </div>"
)

with open(inbox_path, "w", encoding="utf-8") as f:
    f.write(inbox_content)


# File 3: Notifications
notif_path = "f:/apps/orca/crm/src/app/features/notifications/notifications.ts"
with open(notif_path, "r", encoding="utf-8") as f:
    notif_content = f.read()

notif_content = notif_content.replace(
    "import { NotificationsStore } from './store/notifications.store';",
    "import { NotificationsStore } from './store/notifications.store';\nimport { ErrorState } from '../../shared/components/error-state/error-state';\nimport { LoadingState } from '../../shared/components/loading-state/loading-state';\nimport { EmptyState } from '../../shared/components/empty-state/empty-state';"
)

notif_content = notif_content.replace(
    "imports: [CommonModule],",
    "imports: [CommonModule, ErrorState, LoadingState, EmptyState],"
)

notif_replacement = """      <div class="flex-1 overflow-y-auto custom-scrollbar p-space-md lg:p-space-lg relative">
        @if (store.isLoading()) {
          <div class="absolute inset-0 z-10 bg-canvas/50 flex items-center justify-center">
             <app-loading-state type="spinner" text="جاري تحميل الإشعارات..."></app-loading-state>
          </div>
        } @else if (store.error()) {
          <div class="flex-1 flex items-center justify-center p-10">
             <app-error-state [message]="store.error() || ''" (retry)="store.loadNotifications()"></app-error-state>
          </div>
        }"""
notif_content = notif_content.replace(
    """      <div class="flex-1 overflow-y-auto custom-scrollbar p-space-md lg:p-space-lg">""",
    notif_replacement
)
with open(notif_path, "w", encoding="utf-8") as f:
    f.write(notif_content)

# File 4: Performance Shell
perf_path = "f:/apps/orca/crm/src/app/features/performance/performance-shell.ts"
with open(perf_path, "r", encoding="utf-8") as f:
    perf_content = f.read()

perf_content = perf_content.replace(
    "import { EmployeeList } from './components/employee-list';\nimport { PerformanceStore } from './store/performance.store';",
    "import { EmployeeList } from './components/employee-list';\nimport { PerformanceStore } from './store/performance.store';\nimport { ErrorState } from '../../shared/components/error-state/error-state';\nimport { LoadingState } from '../../shared/components/loading-state/loading-state';\nimport { EmptyState } from '../../shared/components/empty-state/empty-state';"
)

perf_content = perf_content.replace(
    "imports: [CommonModule, PerformanceKpis, PerformanceChart, EmployeeList],",
    "imports: [CommonModule, PerformanceKpis, PerformanceChart, EmployeeList, ErrorState, LoadingState, EmptyState],"
)

perf_replacement = """      <!-- Scrollable Main Content -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-space-md lg:p-space-lg relative">
        @if (store.isLoading()) {
          <div class="absolute inset-0 z-10 bg-canvas/50 flex items-center justify-center">
             <app-loading-state type="spinner" text="جاري تحميل الإحصائيات..."></app-loading-state>
          </div>
        } @else if (store.error()) {
          <div class="flex-1 flex items-center justify-center p-10">
             <app-error-state [message]="store.error() || ''" (retry)="store.loadPerformanceData()"></app-error-state>
          </div>
        } @else {
          <div class="flex flex-col xl:flex-row gap-space-md lg:gap-space-lg min-h-full">"""
perf_content = perf_content.replace(
    """      <!-- Scrollable Main Content -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-space-md lg:p-space-lg">
        <div class="flex flex-col xl:flex-row gap-space-md lg:gap-space-lg min-h-full">""",
    perf_replacement
)

perf_content = perf_content.replace(
    "          </div>\n        </div>\n      </div>",
    "          </div>\n        </div>\n        }\n      </div>"
)
with open(perf_path, "w", encoding="utf-8") as f:
    f.write(perf_content)

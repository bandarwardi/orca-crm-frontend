import re

file_path = "f:/apps/orca/crm/src/app/features/dashboard/dashboard.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add imports for ErrorState, EmptyState, LoadingState
content = content.replace(
    "import { StatusBadge } from '../../shared/components/status-badge/status-badge';",
    "import { StatusBadge } from '../../shared/components/status-badge/status-badge';\nimport { ErrorState } from '../../shared/components/error-state/error-state';\nimport { LoadingState } from '../../shared/components/loading-state/loading-state';\nimport { EmptyState } from '../../shared/components/empty-state/empty-state';"
)

content = content.replace(
    "imports: [CommonModule, KpiCard, Avatar, Timeline, StatusBadge],",
    "imports: [CommonModule, KpiCard, Avatar, Timeline, StatusBadge, ErrorState, LoadingState, EmptyState],"
)

# Find the start of the main div and wrap it
main_div_start = '<div class="flex-1 flex flex-col min-h-0 overflow-y-auto p-space-md lg:p-space-lg gap-space-lg custom-scrollbar">'

wrapper = """
    @if (store.isLoading()) {
      <div class="flex-1 p-space-lg flex items-center justify-center">
        <app-loading-state type="spinner" text="جاري تحميل الإحصائيات..."></app-loading-state>
      </div>
    } @else if (store.error()) {
      <div class="flex-1 p-space-lg flex items-center justify-center">
        <app-error-state [message]="store.error() || ''" (retry)="store.loadSummary()"></app-error-state>
      </div>
    } @else {
      <div class="flex-1 flex flex-col min-h-0 overflow-y-auto p-space-md lg:p-space-lg gap-space-lg custom-scrollbar">"""

content = content.replace(main_div_start, wrapper)

# Find the end of the main div
# We know the template ends at:
#     </div>
#   `
# })

content = content.replace(
    "    </div>\n  `\n})",
    "    </div>\n    }\n  `\n})"
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

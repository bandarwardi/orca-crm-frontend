import re

# Fix inbox.store.ts
inbox_file = "f:/apps/orca/crm/src/app/features/inbox/store/inbox.store.ts"
with open(inbox_file, "r", encoding="utf-8") as f:
    inbox = f.read()

inbox = inbox.replace("    }\n    },", "    },")
inbox = inbox.replace("this.loadConversations();", "")
inbox = inbox.replace("../../../../core/services/api/conversations-api.service", "../../../core/services/api/conversations-api.service")
inbox = inbox.replace("const list = state.messages[activeId] ?? [];", "const list = (state.messages as any)[activeId] ?? [];")

with open(inbox_file, "w", encoding="utf-8") as f:
    f.write(inbox)

# Fix orders.store.ts
orders_file = "f:/apps/orca/crm/src/app/features/orders/store/orders.store.ts"
with open(orders_file, "r", encoding="utf-8") as f:
    orders = f.read()
    
# Fix `any` type for parameters in orders
orders = orders.replace("error: (err) => {", "error: (err: any) => {")
orders = orders.replace("next: (order) => {", "next: (order: any) => {")
orders = orders.replace("../../../../core/services/api/orders-api.service", "../../../core/services/api/orders-api.service")
with open(orders_file, "w", encoding="utf-8") as f:
    f.write(orders)
    
# Fix performance.store.ts
perf_file = "f:/apps/orca/crm/src/app/features/performance/store/performance.store.ts"
with open(perf_file, "r", encoding="utf-8") as f:
    perf = f.read()

perf = perf.replace("error: err => console.error(err)", "error: (err: any) => console.error(err)")
perf = perf.replace("next: (kpis) => {", "next: (kpis: any) => {")
perf = perf.replace("../../../../core/services/api/performance-api.service", "../../../core/services/api/performance-api.service")

with open(perf_file, "w", encoding="utf-8") as f:
    f.write(perf)
    
# Fix notifications.store.ts
notif_file = "f:/apps/orca/crm/src/app/features/notifications/store/notifications.store.ts"
with open(notif_file, "r", encoding="utf-8") as f:
    notif = f.read()

notif = notif.replace("error: (err) => console.error(err)", "error: (err: any) => console.error(err)")
notif = notif.replace("error: (err) => {", "error: (err: any) => {")
notif = notif.replace("../../../../core/services/api/notifications-api.service", "../../../core/services/api/notifications-api.service")

with open(notif_file, "w", encoding="utf-8") as f:
    f.write(notif)

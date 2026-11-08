import re

orders_file = "f:/apps/orca/crm/src/app/features/orders/store/orders.store.ts"
with open(orders_file, "r", encoding="utf-8") as f:
    orders = f.read()

# Add Router import
orders = orders.replace(
    "import { OrdersApiService } from '../../../core/services/api/orders-api.service';",
    "import { OrdersApiService } from '../../../core/services/api/orders-api.service';\nimport { Router } from '@angular/router';"
)

# Update injection
orders = orders.replace(
    "withMethods((store, api = inject(OrdersApiService)) => ({",
    "withMethods((store, api = inject(OrdersApiService), router = inject(Router)) => ({"
)

# Replace the next block in submitNewOrder
old_next = """        next: (order: any) => {
          patchState(store, { 
            selectedOrderId: order.id, 
            wizardStep: 1,
            isLoading: false
          });
          // Note: you should call loadOrders() here or use this.loadOrders()
          // We will use window.location.reload() or router for simplicity or just reload state.
        },"""
new_next = """        next: (order: any) => {
          patchState(store, { 
            selectedOrderId: order.id, 
            wizardStep: 1,
            isLoading: false
          });
          router.navigate(['/orders', order.id]);
        },"""
orders = orders.replace(old_next, new_next)

with open(orders_file, "w", encoding="utf-8") as f:
    f.write(orders)

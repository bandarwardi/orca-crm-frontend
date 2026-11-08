import re

file_path = "f:/apps/orca/crm/src/app/features/orders/store/orders.store.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add imports
content = content.replace(
    "import { computed } from '@angular/core';",
    "import { computed, inject } from '@angular/core';\nimport { OrdersApiService } from '../../../../core/services/api/orders-api.service';"
)

# Replace mockOrders declaration with empty array
mock_orders_match = re.search(r"const mockOrders: Order\[\] = \[\s*\{[\s\S]*?\n\];", content)
if mock_orders_match:
    content = content.replace(mock_orders_match.group(0), "const mockOrders: Order[] = [];")

# Inject OrdersApiService in withMethods
content = content.replace(
    "withMethods((store) => ({",
    "withMethods((store, api = inject(OrdersApiService)) => ({"
)

# Add loadOrders
load_orders_str = """
    loadOrders() {
      patchState(store, { isLoading: true });
      api.getAll().subscribe({
        next: (data: any[]) => {
          const orders: Order[] = data.map(o => {
            const customerInitials = (o.customer?.name || 'عميل').split(' ').map((w: string) => w[0]).join('').slice(0, 2);
            let statusLabel = 'غير معروف';
            let status: any = 'expired';
            
            if (o.status === 'active') {
               statusLabel = 'نشط';
               status = 'active';
            } else if (o.status === 'expired') {
               statusLabel = 'منتهي';
               status = 'expired';
            } else if (o.status === 'expiring') {
               statusLabel = 'ينتهي قريباً';
               status = 'expiring';
            }
            
            return {
              id: o.id,
              orderNumber: `#${o.id.slice(0, 8)}`,
              customerName: o.customer?.name || 'عميل',
              customerInitials,
              phone: o.customer?.phone || '',
              email: o.customer?.email || '',
              city: o.customer?.city || '',
              address: o.customer?.address || '',
              location: `${o.customer?.city || ''}, ${o.customer?.state || ''}`,
              status,
              statusLabel,
              price: parseFloat(o.price || 0),
              createdAt: new Date(o.created_at).toLocaleDateString('ar-SA'),
              expiresAt: o.expires_at ? new Date(o.expires_at).toLocaleDateString('ar-SA') : '',
              expiryWarningDays: 0,
              server: o.server || 'افتراضي',
              agentName: o.assignedTo?.name || 'غير محدد',
              agentRole: o.assignedTo?.role || '',
              paymentMethod: 'تحويل',
              totalPaid: parseFloat(o.price || 0),
              packageName: 'باقة مخصصة',
              leadId: o.lead_id,
              devices: [],
              payments: []
            };
          });
          patchState(store, { orders, isLoading: false });
        },
        error: (err) => {
          console.error(err);
          patchState(store, { isLoading: false });
        }
      });
    },"""

content = content.replace(
    "withMethods((store, api = inject(OrdersApiService)) => ({",
    "withMethods((store, api = inject(OrdersApiService)) => ({" + load_orders_str
)

# Update submitNewOrder
old_submit = r"submitNewOrder\(\): Order \{[\s\S]*?return newOrder;\n    \}"
new_submit = """submitNewOrder() {
      const state = store;
      const customer = state.wizardCustomer();
      const sub = state.wizardSubscription();
      const devices = state.wizardDevices();

      const dto = {
        customer: {
          name: customer.fullName,
          phone: customer.phone,
          email: customer.email,
          city: customer.city,
          address: customer.address
        },
        price: sub.price,
        server: sub.server,
        durationMonths: sub.durationMonths,
        devices: devices.map(d => ({
          name: d.name,
          device_type: d.deviceType,
          mac_address: d.macAddress,
          device_key: d.deviceKey,
          app_name: d.app
        }))
      };

      patchState(store, { isLoading: true });
      api.create(dto).subscribe({
        next: (order) => {
          patchState(store, { 
            selectedOrderId: order.id, 
            wizardStep: 1,
            isLoading: false
          });
          // Note: you should call loadOrders() here or use this.loadOrders()
          // We will use window.location.reload() or router for simplicity or just reload state.
        },
        error: (err) => {
          console.error(err);
          patchState(store, { isLoading: false });
        }
      });
    }"""

content = re.sub(old_submit, new_submit, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Orders store updated")

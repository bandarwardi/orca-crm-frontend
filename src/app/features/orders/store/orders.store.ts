import { computed, inject } from '@angular/core';
import { OrdersApiService } from '../../../core/services/api/orders-api.service';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { matchesPhone, normalizeArabicSearch } from '../../../shared/pipes/phone-format.pipe';
import {
  Order,
  OrderStatus,
  OrderDevice,
  WizardCustomerData,
  WizardDeviceItem,
  WizardSubscriptionData
} from '../models/order.model';
import { formatDateEn } from '../../../core/utils/date-format.util';

export interface OrdersState {
  orders: Order[];
  selectedOrderId: string | null;
  activeTab: 'all' | 'active' | 'expiring' | 'expired';
  searchQuery: string;
  selectedAgent: string;
  selectedStatus: string;
  dateRange: string;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  // Wizard state
  wizardStep: 1 | 2 | 3 | 4;
  wizardCustomer: WizardCustomerData;
  wizardSubscription: WizardSubscriptionData;
  wizardDevices: WizardDeviceItem[];
}

const mockOrders: Order[] = [];

const initialWizardCustomer: WizardCustomerData = {
  fullName: '',
  phone: '',
  email: '',
  city: '',
  address: '',
  leadId: ''
};

const initialWizardSubscription: WizardSubscriptionData = {
  packageName: 'اشتراك 12 شهر',
  durationMonths: 12,
  server: 'سيرفر VIP 1',
  price: 120,
  allowedDevices: 1,
  paymentMethod: 'بطاقة ائتمانية عبر Stripe'
};

const initialWizardDevices: WizardDeviceItem[] = [
  {
    id: 'w-dev-1',
    name: 'شاشة ذكية 1',
    subtitle: 'الجهاز الأساسي للاشتراك',
    deviceType: 'smart_tv',
    macAddress: '',
    deviceKey: '',
    username: '',
    app: 'IBO Player Pro'
  }
];

function mapOrderDevice(d: any): OrderDevice {
  const typeMap: Record<string, string> = {
    smart_tv: 'شاشة ذكية',
    android_box: 'جهاز أندرويد بوكس',
    firestick: 'أمازون فايرستيك',
    apple_tv: 'أبل تي في',
    mobile: 'هاتف محمول',
    pc: 'كمبيوتر',
    mag: 'جهاز MAG'
  };

  const rawType = d.device_type || d.deviceType || 'smart_tv';
  const typeName = d.device_type_name || d.deviceTypeName || typeMap[rawType] || 'جهاز مشغل';

  return {
    id: d.id || `dev-${Date.now()}`,
    name: d.name || typeName,
    deviceType: rawType,
    deviceTypeName: typeName,
    macAddress: d.mac_address || d.macAddress || '—',
    deviceKey: d.device_key || d.deviceKey || '—',
    username: d.username || '—',
    app: d.app_name || d.app || 'IBO Player Pro',
    status: d.status || 'active',
    qualityTag: d.quality_tag || d.qualityTag || '4K'
  };
}

function mapBackendOrder(o: any): Order {
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

  const rawDevices = o.devices || [];
  const devices = rawDevices.map(mapOrderDevice);

  return {
    id: o.id,
    orderNumber: o.order_number || `#${o.id.slice(0, 8)}`,
    customerName: o.customer?.name || 'عميل',
    customerInitials,
    phone: o.customer?.phone || '',
    email: o.customer?.email || '',
    city: o.customer?.city || '',
    address: o.customer?.address || '',
    location: `${o.customer?.city || ''}${o.customer?.state ? ', ' + o.customer.state : ''}`,
    status,
    statusLabel,
    price: parseFloat(o.price || 0),
    createdAt: formatDateEn(o.created_at) || formatDateEn(new Date()),
    expiresAt: o.expires_at ? formatDateEn(o.expires_at) : '',
    expiryWarningDays: 0,
    server: o.server_name || o.server || 'افتراضي',
    agentName: o.assignedUser?.name || o.assignedTo?.name || 'غير محدد',
    agentRole: o.assignedUser?.role || o.assignedTo?.role || '',
    paymentMethod: o.payment_method || o.paymentMethod || 'غير محدد',
    totalPaid: parseFloat(o.price || 0),
    packageName: o.package_name || o.packageName || 'باقة مخصصة',
    leadId: o.lead_id,
    devices,
    payments: o.payments || []
  };
}

const initialState: OrdersState = {
  orders: mockOrders,
  selectedOrderId: null,
  activeTab: 'all',
  searchQuery: '',
  selectedAgent: '',
  selectedStatus: '',
  dateRange: 'آخر ٣٠ يوماً: من ١ إلى ٣١ أكتوبر',
  currentPage: 1,
  pageSize: 10,
  isLoading: false, error: null as string | null,
  wizardStep: 1, // Step 1 as default for creating new orders
  wizardCustomer: initialWizardCustomer,
  wizardSubscription: initialWizardSubscription,
  wizardDevices: initialWizardDevices
};

export const OrdersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    const filteredOrders = computed(() => {
      let list = store.orders();

      // Tab filter
      const tab = store.activeTab();
      if (tab === 'active') {
        list = list.filter(o => o.status === 'active');
      } else if (tab === 'expiring') {
        list = list.filter(o => o.status === 'expiring');
      } else if (tab === 'expired') {
        list = list.filter(o => o.status === 'expired');
      }

      // Search filter
      const query = store.searchQuery().trim();
      if (query) {
        const normQ = normalizeArabicSearch(query);
        list = list.filter(o =>
          matchesPhone(o.phone, query) ||
          normalizeArabicSearch(o.customerName).includes(normQ) ||
          normalizeArabicSearch(o.orderNumber).includes(normQ) ||
          normalizeArabicSearch(o.city).includes(normQ)
        );
      }

      // Dropdown status filter
      const statusFilter = store.selectedStatus();
      if (statusFilter) {
        list = list.filter(o => o.status === statusFilter);
      }

      // Dropdown agent filter
      const agentFilter = store.selectedAgent();
      if (agentFilter) {
        list = list.filter(o => o.agentName.includes(agentFilter));
      }

      return list;
    });

    const activeOrdersCount = computed(() =>
      store.orders().filter(o => o.status === 'active').length
    );

    const expiringOrdersCount = computed(() =>
      store.orders().filter(o => o.status === 'expiring').length
    );

    const expiredOrdersCount = computed(() =>
      store.orders().filter(o => o.status === 'expired').length
    );

    const totalOrdersCount = computed(() => store.orders().length);

    const totalRevenue = computed(() => {
      return store.orders().reduce((sum, order) => sum + order.price, 0);
    });

    const selectedOrder = computed(() => {
      const id = store.selectedOrderId();
      if (!id) return store.orders()[0] || null;
      return store.orders().find(o => o.id === id || o.orderNumber === id) || store.orders()[0] || null;
    });

    const paginatedOrders = computed(() => {
      const list = filteredOrders();
      const page = store.currentPage();
      const size = store.pageSize();
      const start = (page - 1) * size;
      return list.slice(start, start + size);
    });

    return {
      filteredOrders,
      activeOrdersCount,
      expiringOrdersCount,
      expiredOrdersCount,
      totalOrdersCount,
      totalRevenue,
      selectedOrder,
      paginatedOrders
    };
  }),
  withMethods((store, api = inject(OrdersApiService), router = inject(Router)) => ({
    loadOrders() {
      patchState(store, { isLoading: true });
      api.getAll().subscribe({
        next: (res: any) => {
          const list: any[] = Array.isArray(res) ? res : (res?.data || []);
          const orders: Order[] = list.map(mapBackendOrder);
          patchState(store, { orders, isLoading: false });
        },
        error: (err: any) => {
          console.error(err);
          patchState(store, { isLoading: false });
        }
      });
    },
    setActiveTab(tab: 'all' | 'active' | 'expiring' | 'expired') {
      patchState(store, { activeTab: tab, currentPage: 1 });
    },
    setSearchQuery(searchQuery: string) {
      patchState(store, { searchQuery, currentPage: 1 });
    },
    setFilters(status: string, agent: string) {
      patchState(store, { selectedStatus: status, selectedAgent: agent, currentPage: 1 });
    },
    resetFilters() {
      patchState(store, {
        activeTab: 'all',
        searchQuery: '',
        selectedAgent: '',
        selectedStatus: '',
        currentPage: 1
      });
    },
    selectOrder(orderId: string) {
      patchState(store, { selectedOrderId: orderId });
      if (orderId && orderId.length > 10) {
        api.getById(orderId).subscribe({
          next: (res: any) => {
            const freshOrder = mapBackendOrder(res?.data || res);
            patchState(store, (state) => {
              const index = state.orders.findIndex(o => o.id === freshOrder.id);
              let updatedOrders = [...state.orders];
              if (index !== -1) {
                updatedOrders[index] = freshOrder;
              } else {
                updatedOrders.push(freshOrder);
              }
              return { orders: updatedOrders };
            });
          },
          error: () => {}
        });
      }
    },
    setPage(page: number) {
      patchState(store, { currentPage: page });
    },
    setPageSize(size: number) {
      patchState(store, { pageSize: size, currentPage: 1 });
    },
    setWizardStep(step: 1 | 2 | 3 | 4) {
      patchState(store, { wizardStep: step });
    },
    updateWizardCustomer(data: Partial<WizardCustomerData>) {
      patchState(store, (state) => ({
        wizardCustomer: { ...state.wizardCustomer, ...data }
      }));
    },
    updateWizardSubscription(data: Partial<WizardSubscriptionData>) {
      patchState(store, (state) => ({
        wizardSubscription: { ...state.wizardSubscription, ...data }
      }));
    },
    updateWizardDevice(index: number, device: Partial<WizardDeviceItem>) {
      patchState(store, (state) => {
        const devices = [...state.wizardDevices];
        if (devices[index]) {
          devices[index] = { ...devices[index], ...device };
        }
        return { wizardDevices: devices };
      });
    },
    addWizardDevice() {
      patchState(store, (state) => {
        const nextNum = state.wizardDevices.length + 1;
        const newDevice: WizardDeviceItem = {
          id: `w-dev-${Date.now()}`,
          name: `الجهاز ${nextNum}`,
          subtitle: 'جهاز إضافي للباقة',
          deviceType: 'شاشة ذكية',
          macAddress: '',
          deviceKey: '',
          username: '',
          app: 'IBO Player Pro'
        };
        return {
          wizardDevices: [...state.wizardDevices, newDevice],
          wizardSubscription: {
            ...state.wizardSubscription,
            allowedDevices: state.wizardSubscription.allowedDevices + 1
          }
        };
      });
    },
    removeWizardDevice(index: number) {
      patchState(store, (state) => {
        const devices = state.wizardDevices.filter((_, i) => i !== index);
        return { wizardDevices: devices };
      });
    },
    initNewOrderWizard(params?: { phone?: string; name?: string; email?: string; city?: string; address?: string; leadId?: string }) {
      patchState(store, {
        wizardStep: 1,
        selectedOrderId: null,
        wizardCustomer: {
          fullName: params?.name || '',
          phone: params?.phone || '',
          email: params?.email || '',
          city: params?.city || '',
          address: params?.address || '',
          leadId: params?.leadId || ''
        },
        wizardSubscription: {
          packageName: 'اشتراك 12 شهر',
          durationMonths: 12,
          server: 'سيرفر VIP 1',
          price: 120,
          allowedDevices: 1,
          paymentMethod: 'بطاقة ائتمانية عبر Stripe'
        },
        wizardDevices: [
          {
            id: `w-dev-${Date.now()}`,
            name: 'شاشة ذكية 1',
            subtitle: 'الجهاز الأساسي للاشتراك',
            deviceType: 'smart_tv',
            macAddress: '',
            deviceKey: '',
            username: '',
            app: 'IBO Player Pro'
          }
        ]
      });
    },
    submitNewOrder() {
      const state = store;
      const customer = state.wizardCustomer();
      const sub = state.wizardSubscription();
      const devices = state.wizardDevices();

      const dto = {
        customer: {
          name: customer.fullName || 'عميل جديد',
          phone: customer.phone,
          email: customer.email,
          city: customer.city,
          address: customer.address
        },
        lead_id: customer.leadId || undefined,
        price: sub.price,
        server_name: sub.server || 'سيرفر VIP 1',
        duration_months: sub.durationMonths || 12,
        package_name: sub.packageName || `اشتراك ${sub.durationMonths || 12} شهر`,
        payment_method: sub.paymentMethod || 'بطاقة ائتمانية عبر Stripe',
        allowed_devices: devices.length || 1,
        devices: devices.map(d => ({
          name: d.name,
          device_type: d.deviceType || 'smart_tv',
          mac_address: d.macAddress || '—',
          device_key: d.deviceKey || '—',
          username: d.username || '—',
          app_name: d.app || 'IBO Player Pro'
        }))
      };

      patchState(store, { isLoading: true });
      api.create(dto).subscribe({
        next: (res: any) => {
          const raw = res?.data || res;
          const order = mapBackendOrder(raw);
          patchState(store, (s) => ({ 
            orders: [order, ...s.orders],
            selectedOrderId: order.id, 
            wizardStep: 1 as const,
            isLoading: false
          }));
          router.navigate(['/orders', order.id]);
        },
        error: (err: any) => {
          console.error(err);
          patchState(store, { isLoading: false });
        }
      });
    },
    addDevice(orderId: string, deviceDto: any, onSuccess?: () => void, onError?: (err: any) => void) {
      api.addDevice(orderId, deviceDto).subscribe({
        next: (newDeviceRaw: any) => {
          const savedDevice = mapOrderDevice(newDeviceRaw);
          patchState(store, (state) => {
            const updatedOrders = state.orders.map(order => {
              if (order.id === orderId) {
                return {
                  ...order,
                  devices: [...order.devices, savedDevice]
                };
              }
              return order;
            });
            return { orders: updatedOrders };
          });
          if (onSuccess) onSuccess();
        },
        error: (err: any) => {
          if (onError) onError(err);
        }
      });
    },
    removeDevice(orderId: string, deviceId: string, onSuccess?: () => void, onError?: (err: any) => void) {
      api.removeDevice(orderId, deviceId).subscribe({
        next: () => {
          patchState(store, (state) => {
            const updatedOrders = state.orders.map(order => {
              if (order.id === orderId) {
                return {
                  ...order,
                  devices: order.devices.filter(d => d.id !== deviceId)
                };
              }
              return order;
            });
            return { orders: updatedOrders };
          });
          if (onSuccess) onSuccess();
        },
        error: (err: any) => {
          if (onError) onError(err);
        }
      });
    }
  }))
);

export type OrderStatus = 'active' | 'expiring' | 'expired';

export interface OrderDevice {
  id: string;
  name: string;
  deviceType: 'smart_tv' | 'android_box' | 'mobile' | 'pc' | 'firestick' | 'apple_tv' | 'mag' | string;
  deviceTypeName: string;
  macAddress: string;
  deviceKey: string;
  username: string;
  app: string;
  status: 'active' | 'pending' | 'expired';
  qualityTag?: string;
}

export interface OrderPayment {
  id: string;
  invoiceNumber: string;
  packageName: string;
  duration: string;
  paymentDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'refunded';
  statusLabel: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. '#ORD-8934'
  customerName: string;
  customerInitials: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  location: string;
  status: OrderStatus;
  statusLabel: string;
  price: number;
  createdAt: string;
  expiresAt: string;
  expiryWarningDays?: number;
  server: string;
  agentName: string;
  agentRole: string;
  paymentMethod: string;
  totalPaid: number;
  devices: OrderDevice[];
  payments: OrderPayment[];
  leadId?: string;
  packageName?: string;
}

export interface WizardCustomerData {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  leadId?: string;
}

export interface WizardSubscriptionData {
  packageName: string;
  durationMonths: number;
  server?: string;
  price: number;
  allowedDevices: number;
  paymentMethod?: string;
}

export interface WizardDeviceItem {
  id: string;
  name: string;
  subtitle: string;
  deviceType: string;
  macAddress: string;
  deviceKey: string;
  username: string;
  app: string;
}

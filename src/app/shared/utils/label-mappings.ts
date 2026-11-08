/**
 * Label Mapping Utilities for orca CRM
 * Ensures 100% natural Arabic text representation without raw English enum leaks or awkward parentheses.
 */

export const DEVICE_TYPE_LABELS: Record<string, string> = {
  'smart_tv': 'شاشة ذكية',
  'android_box': 'جهاز استقبال ذكي',
  'mobile': 'هاتف ذكي',
  'pc': 'حاسوب شخصي',
  // Specific device models:
  'Samsung Smart TV (Tizen)': 'شاشة سامسونج ذكية',
  'LG Smart TV (webOS)': 'شاشة إل جي ذكية',
  'Android TV / Google TV': 'شاشة أندرويد',
  'Apple TV': 'جهاز آبل تي في',
  'Android Box': 'جهاز أندرويد بوكس',
  'Amazon Fire TV': 'أمازون فاير ستيك',
  'MAG Device': 'جهاز ماج',
  'Formuler Box': 'جهاز فورمولر',
  'iOS (iPhone / iPad)': 'آيفون / آيباد',
  'Android Mobile': 'هاتف أندرويد',
  'Windows PC': 'كمبيوتر ويندوز',
  'macOS': 'كمبيوتر ماك',
  // Legacy / Raw values containing parentheses:
  'شاشة ذكية (Smart TV)': 'شاشة ذكية',
  'جوال (Mobile / iOS)': 'هاتف ذكي',
  'جهاز استقبال (Android Box / Apple TV)': 'جهاز استقبال ذكي',
  'حاسوب (PC / Mac)': 'حاسوب شخصي'
};

/**
 * Returns a clean Arabic display label for a device type or device type name.
 * Automatically cleans any leftover parenthetical English leaks.
 */
export function getDeviceTypeLabel(typeOrName: string | null | undefined): string {
  if (!typeOrName) return 'جهاز غير محدد';
  const clean = typeOrName.trim();
  if (DEVICE_TYPE_LABELS[clean]) {
    return DEVICE_TYPE_LABELS[clean];
  }
  // Strip any English in parentheses e.g. "شاشة ذكية (Smart TV)" -> "شاشة ذكية"
  const stripped = clean.replace(/\s*\([a-zA-Z0-9\s\/\-_.]+\)/g, '').trim();
  return stripped || clean;
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  'بطاقة ائتمانية (Stripe)': 'بطاقة ائتمانية عبر Stripe',
  'بطاقة ائتمانية': 'بطاقة ائتمانية',
  'stripe': 'بطاقة ائتمانية عبر Stripe',
  'تحويل Zelle': 'تحويل عبر Zelle',
  'تحويل عبر Zelle': 'تحويل عبر Zelle',
  'zelle': 'تحويل عبر Zelle',
  'نقداً': 'نقداً',
  'cash': 'نقداً',
  'تحويل بنكي': 'تحويل بنكي مباشر',
  'bank_transfer': 'تحويل بنكي مباشر'
};

export function getPaymentMethodLabel(method: string | null | undefined): string {
  if (!method) return 'بطاقة ائتمانية';
  const clean = method.trim();
  if (PAYMENT_METHOD_LABELS[clean]) {
    return PAYMENT_METHOD_LABELS[clean];
  }
  // Localize '(Stripe)' -> 'عبر Stripe', '(Zelle)' -> 'عبر Zelle'
  return clean
    .replace(/\(Stripe\)/gi, 'عبر Stripe')
    .replace(/\(Zelle\)/gi, 'عبر Zelle')
    .trim();
}

export const SERVER_LABELS: Record<string, string> = {
  'سيرفر النخبة 4K (رئيسي)': 'سيرفر النخبة 4K الرئيسي',
  'سيرفر النخبة 4K الرئيسي': 'سيرفر النخبة 4K الرئيسي',
  'سيرفر النخبة 4K': 'سيرفر النخبة 4K',
  'سيرفر العائلة VIP': 'سيرفر العائلة VIP',
  'سيرفر العائلة VIP (احتياطي)': 'سيرفر العائلة VIP الاحتياطي',
  'سيرفر تجريبي': 'السيرفر التجريبي',
  'افتراضي': 'السيرفر الافتراضي'
};

export function getServerLabel(server: string | null | undefined): string {
  if (!server) return 'السيرفر الافتراضي';
  const clean = server.trim();
  if (SERVER_LABELS[clean]) {
    return SERVER_LABELS[clean];
  }
  return clean
    .replace(/\(رئيسي\)/g, 'الرئيسي')
    .replace(/\(احتياطي\)/g, 'الاحتياطي')
    .replace(/\s+/g, ' ')
    .trim();
}

export const PLAN_LABELS: Record<string, string> = {
  'باقة VIP السنوية (جهازان)': 'باقة VIP السنوية - جهازان',
  'باقة VIP السنوية - جهازان': 'باقة VIP السنوية - جهازان',
  'باقة 6 أشهر (جهاز واحد)': 'باقة 6 أشهر - جهاز واحد',
  'باقة 6 أشهر - جهاز واحد': 'باقة 6 أشهر - جهاز واحد',
  'الباقة السنوية الأساسية': 'الباقة السنوية الأساسية',
  'باقة 3 أشهر التجريبية': 'باقة 3 أشهر التجريبية',
  'باقة 6 أشهر المميزة': 'باقة 6 أشهر المميزة',
  'اشتراك مخصص': 'اشتراك مخصص'
};

export function getPlanLabel(plan: string | null | undefined): string {
  if (!plan) return 'اشتراك مخصص';
  const clean = plan.trim();
  if (PLAN_LABELS[clean]) {
    return PLAN_LABELS[clean];
  }
  return clean
    .replace(/\(جهازان\)/g, '- جهازان')
    .replace(/\(جهاز واحد\)/g, '- جهاز واحد')
    .replace(/\(3 أجهزة\)/g, '- 3 أجهزة')
    .replace(/\s+/g, ' ')
    .trim();
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  'active': 'نشط',
  'expiring': 'ينتهي قريباً',
  'expired': 'منتهي / متأخر'
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  'paid': 'مدفوع بالكامل',
  'pending': 'قيد المعالجة',
  'refunded': 'مسترجع'
};

/**
 * Standardized terminology for active devices count
 */
export function formatActiveDevicesCount(count: number): string {
  return `${count} أجهزة نشطة`;
}

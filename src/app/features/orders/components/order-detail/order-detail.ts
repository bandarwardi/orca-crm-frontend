import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrdersStore } from '../../store/orders.store';
import { RingCentralWidgetService } from '../../../../core/services/ringcentral-widget.service';
import { OrderStatusBadge } from '../order-status-badge/order-status-badge';
import { Order, OrderDevice } from '../../models/order.model';
import { formatPhoneNumber } from '../../../../shared/pipes/phone-format.pipe';
import {
  getDeviceTypeLabel,
  getPaymentMethodLabel,
  getServerLabel,
  getPlanLabel,
  formatActiveDevicesCount
} from '../../../../shared/utils/label-mappings';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, OrderStatusBadge],
  host: { class: 'flex-1 flex flex-col min-h-0 overflow-hidden' },
  template: `
    <div class="flex-1 flex flex-col min-h-0 overflow-y-auto px-3 sm:px-space-lg py-4 pb-space-xl bg-canvas custom-scrollbar" dir="rtl">
      @if (order(); as o) {
        <div class="order-details-content flex flex-col gap-5 sm:gap-6 w-full max-w-7xl mx-auto">
          
          <!-- Top Breadcrumb Navigation Bar -->
          <nav aria-label="مسار التنقل" class="flex flex-wrap items-center justify-between gap-3 py-1 sm:py-2">
            <div class="flex items-center gap-2 sm:gap-3">
              <a
                routerLink="/orders"
                class="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-container text-on-surface font-label-md text-label-sm sm:text-label-md transition-colors shadow-xs border border-border-subtle cursor-pointer"
              >
                <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                <span>العودة للطلبات</span>
              </a>
              <div class="hidden sm:flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
                <span class="text-border-subtle">/</span>
                <a routerLink="/orders" class="hover:text-brand-600 transition-colors">الطلبات</a>
                <span class="text-border-subtle">/</span>
                <span class="text-on-surface font-semibold">ملف العميل ({{ o.orderNumber }})</span>
              </div>
            </div>

            <div class="flex items-center gap-2 sm:gap-3">
              <div class="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-surface-container text-on-surface font-code-sm text-code-sm border border-border-subtle">
                <span class="material-symbols-outlined text-[15px] sm:text-[16px] text-brand-600">tag</span>
                <span class="font-bold tracking-wide">{{ o.orderNumber }}</span>
              </div>
              <div class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-surface text-on-surface-variant font-label-sm text-[11px] sm:text-label-sm shadow-xs border border-border-subtle">
                <span class="material-symbols-outlined text-[15px] sm:text-[16px] text-outline">calendar_today</span>
                <span>الإنشاء: {{ o.createdAt }}</span>
              </div>
            </div>
          </nav>

          <!-- 1. Dominant Visual Anchor: Customer Identity Header -->
          <section aria-label="بيانات وهوية العميل" class="bg-surface rounded-2xl p-5 sm:p-6 shadow-sm border border-border-subtle border-t-4 border-t-brand-600 relative overflow-hidden">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              
              <!-- Customer Identity Group (Name, Badges, Phone, City) -->
              <div class="flex items-center min-w-0">
                <div class="flex flex-col gap-1.5 min-w-0">
                  <div class="flex items-center gap-2.5 flex-wrap">
                    <h1 class="text-xl sm:text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
                      {{ o.customerName }}
                    </h1>
                    <app-order-status-badge [status]="o.status" [label]="o.statusLabel"></app-order-status-badge>
                  </div>

                  <!-- Glanceable Quick Summary Pills: Phone + City (Primary Location of Contact Info) -->
                  <div class="flex items-center gap-2 sm:gap-3 text-on-surface-variant text-xs sm:text-sm flex-wrap">
                    <span class="inline-flex items-center gap-1.5 bg-surface-container/60 px-2.5 py-1 rounded-lg border border-border-subtle/50">
                      <span class="material-symbols-outlined text-[16px] text-brand-600">call</span>
                      <span dir="ltr" class="font-code-sm font-semibold text-on-surface">{{ formatPhone(o.phone) }}</span>
                    </span>
                    <span class="inline-flex items-center gap-1.5 bg-surface-container/60 px-2.5 py-1 rounded-lg border border-border-subtle/50">
                      <span class="material-symbols-outlined text-[16px] text-outline">location_on</span>
                      <span>{{ o.city }}</span>
                    </span>
                    <span class="inline-flex items-center gap-1.5 text-on-surface-variant/70 text-xs">
                      <span>المسؤول:</span>
                      <strong class="text-on-surface font-medium">{{ o.agentName }}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Action Button: Print Invoice -->
              <div class="flex items-center gap-2.5 self-stretch md:self-center justify-end flex-wrap pt-3 md:pt-0 border-t md:border-t-0 border-border-subtle">
                <button
                  (click)="openInvoiceModal()"
                  class="h-9 sm:h-10 px-3.5 rounded-xl bg-surface hover:bg-surface-container text-on-surface font-label-md text-xs sm:text-sm flex items-center gap-2 transition-colors border border-border-subtle shadow-xs cursor-pointer active:scale-95"
                  title="طباعة الفاتورة"
                  type="button"
                >
                  <span class="material-symbols-outlined text-[18px] text-brand-600">print</span>
                  <span class="font-semibold">طباعة الفاتورة</span>
                </button>
              </div>
            </div>
          </section>



          <!-- Main Two-Column Layout (Content Priority Hierarchy) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            
            <!-- Right Main Column (8 Cols in Desktop): Subscription, Devices, Payments -->
            <div class="lg:col-span-8 flex flex-col gap-5 sm:gap-6">
              
              <!-- 3. Active Subscription & Billing Summary Card -->
              <section class="bg-surface rounded-2xl p-5 shadow-xs border border-border-subtle space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <div class="flex items-center gap-2.5">
                    <span class="material-symbols-outlined text-brand-600 text-[22px]">workspace_premium</span>
                    <h2 class="text-sm sm:text-base font-bold text-on-surface">تفاصيل الاشتراك الحالي</h2>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div class="p-3 bg-surface-alt rounded-xl border border-border-subtle/60">
                    <span class="text-on-surface-variant block text-[11px] mb-1">المبلغ الإجمالي</span>
                    <span class="text-sm font-extrabold text-on-surface font-code-sm" dir="ltr">\${{ o.totalPaid.toFixed(2) }}</span>
                  </div>
                  <div class="p-3 bg-surface-alt rounded-xl border border-border-subtle/60">
                    <span class="text-on-surface-variant block text-[11px] mb-1">طريقة الدفع</span>
                    <!-- Natural localized payment method e.g. "بطاقة ائتمانية عبر Stripe" -->
                    <span class="text-xs font-semibold text-on-surface truncate block">{{ getPayment(o.paymentMethod) }}</span>
                  </div>
                  <div class="p-3 bg-surface-alt rounded-xl border border-border-subtle/60">
                    <span class="text-on-surface-variant block text-[11px] mb-1">تاريخ الانتهاء</span>
                    <span class="text-xs font-semibold text-on-surface truncate block">{{ o.expiresAt }}</span>
                  </div>
                </div>

                <!-- High-Urgency Renewal Alert -->
                @if (o.expiryWarningDays) {
                  <div class="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/50 rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3 text-slate-800 dark:text-slate-200">
                    <div class="flex items-center gap-2.5 text-xs">
                      <span class="w-8 h-8 rounded-lg bg-amber-500/15 text-[#D97706] flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-[20px]">warning</span>
                      </span>
                      <div>
                        <span class="font-extrabold text-[#D97706] text-xs">تنبيه:</span>
                        <span class="text-slate-700 dark:text-slate-300 mr-1">ينتهي الاشتراك خلال <strong>{{ o.expiryWarningDays }} أيام</strong>.</span>
                      </div>
                    </div>
                    <button type="button" class="px-3.5 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0">
                      تجديد فوري
                    </button>
                  </div>
                }
              </section>

              <!-- 4. Connected Devices Section (Glanceable + Collapsed Technical Diagnostics) -->
              <section class="bg-surface rounded-2xl p-5 shadow-xs border border-border-subtle space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <div class="flex items-center gap-2.5">
                    <span class="material-symbols-outlined text-brand-600 text-[22px]">devices</span>
                    <h2 class="text-sm sm:text-base font-bold text-on-surface">الأجهزة المشغلة</h2>
                    <!-- Unified Terminology: "أجهزة نشطة" -->
                    <span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold">
                      {{ formatDevices(o.devices.length) }}
                    </span>
                  </div>

                  <button
                    (click)="openAddDeviceModal()"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:hover:bg-brand-500/30 text-xs font-semibold transition-colors cursor-pointer"
                    type="button"
                  >
                    <span class="material-symbols-outlined text-[17px]">add_circle</span>
                    <span>إضافة أو ترقية جهاز</span>
                  </button>
                </div>

                <!-- Device Items List -->
                <div class="space-y-3">
                  @for (device of o.devices; track device.id; let idx = $index) {
                    <div class="bg-surface-alt rounded-xl border border-border-subtle overflow-hidden">
                      
                      <!-- Glanceable Essential Row (Always Visible) -->
                      <div class="p-3.5 sm:p-4 flex items-center justify-between gap-3 flex-wrap">
                        <div class="flex items-center gap-3 min-w-0">
                          <div class="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/20 text-brand-600 flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-[22px]">
                              {{ device.deviceType === 'smart_tv' ? 'tv' : device.deviceType === 'mobile' ? 'smartphone' : device.deviceType === 'firestick' ? 'usb' : 'devices' }}
                            </span>
                          </div>
                          <div class="min-w-0">
                            <div class="flex items-center gap-2">
                              <h3 class="text-xs sm:text-sm font-bold text-on-surface">{{ device.deviceTypeName || device.name }}</h3>
                            </div>
                            <div class="text-[11px] text-slate-500 mt-0.5">
                              التطبيق المشغل: <strong class="text-slate-700 dark:text-slate-300 font-semibold">{{ device.app }}</strong>
                            </div>
                          </div>
                        </div>

                        <div class="flex items-center gap-3">
                          <!-- Disconnect Action -->
                          <button
                            type="button"
                            (click)="confirmDisconnectDevice(device)"
                            class="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-2.5 py-1 rounded-lg transition-colors font-medium cursor-pointer flex items-center gap-1"
                            title="فصل هذا الجهاز"
                          >
                            <span class="material-symbols-outlined text-[15px]">power_off</span>
                            <span>فصل الجهاز</span>
                          </button>
                        </div>
                      </div>

                      <!-- Collapsed Technical Details (Subtle, Monospace, Collapsed by Default) -->
                      <details class="group border-t border-border-subtle bg-surface">
                        <summary class="px-4 py-2 text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-surface-container/50 cursor-pointer flex items-center justify-between select-none transition-colors">
                          <span class="flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-[15px] text-outline">tune</span>
                            <span>تفاصيل تقنية (MAC Address & Device Key)</span>
                          </span>
                          <span class="material-symbols-outlined text-[18px] text-outline transition-transform duration-200 group-open:rotate-180">
                            expand_more
                          </span>
                        </summary>

                        <div class="p-3.5 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-slate-50/50 dark:bg-surface-container/20">
                          <!-- MAC Address with Copy -->
                          <div class="p-2.5 rounded-lg bg-surface border border-border-subtle flex flex-col gap-1">
                            <span class="text-[10px] text-slate-400 font-medium">عنوان الماك (MAC Address)</span>
                            <div class="flex items-center justify-between">
                              <span class="font-code-sm text-xs text-slate-700 dark:text-slate-200 font-mono" dir="ltr">{{ device.macAddress }}</span>
                              <button (click)="copyToClipboard(device.macAddress)" class="text-slate-400 hover:text-brand-600 transition-colors p-1 cursor-pointer" title="نسخ الماك">
                                <span class="material-symbols-outlined text-[15px]">content_copy</span>
                              </button>
                            </div>
                          </div>

                          <!-- Device Key with Copy -->
                          <div class="p-2.5 rounded-lg bg-surface border border-border-subtle flex flex-col gap-1">
                            <span class="text-[10px] text-slate-400 font-medium">مفتاح الجهاز (Device Key)</span>
                            <div class="flex items-center justify-between">
                              <span class="font-code-sm text-xs text-slate-700 dark:text-slate-200 font-mono" dir="ltr">{{ device.deviceKey }}</span>
                              <button (click)="copyToClipboard(device.deviceKey)" class="text-slate-400 hover:text-brand-600 transition-colors p-1 cursor-pointer" title="نسخ المفتاح">
                                <span class="material-symbols-outlined text-[15px]">content_copy</span>
                              </button>
                            </div>
                          </div>

                          <!-- Server Username with Copy -->
                          <div class="p-2.5 rounded-lg bg-surface border border-border-subtle flex flex-col gap-1">
                            <span class="text-[10px] text-slate-400 font-medium">اسم المستخدم للسيرفر</span>
                            <div class="flex items-center justify-between">
                              <span class="font-code-sm text-xs text-slate-700 dark:text-slate-200 font-mono" dir="ltr">{{ device.username }}</span>
                              <button (click)="copyToClipboard(device.username)" class="text-slate-400 hover:text-brand-600 transition-colors p-1 cursor-pointer" title="نسخ الحساب">
                                <span class="material-symbols-outlined text-[15px]">content_copy</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </details>
                    </div>
                  } @empty {
                    <div class="py-8 px-4 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border-subtle bg-surface-alt/50">
                      <div class="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 flex items-center justify-center mb-2">
                        <span class="material-symbols-outlined text-[24px]">devices</span>
                      </div>
                      <p class="text-sm font-bold text-on-surface">لا توجد أجهزة مربوطة بهذا الطلب حالياً</p>
                      <p class="text-xs text-on-surface-variant mt-1 mb-3">يمكنك ربط شاشة ذكية، جهاز أندرويد بوكس، أو هاتف باشتراك العميل الآن</p>
                      <button
                        (click)="openAddDeviceModal()"
                        type="button"
                        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <span class="material-symbols-outlined text-[16px]">add_circle</span>
                        <span>إضافة أو ترقية جهاز</span>
                      </button>
                    </div>
                  }
                </div>
              </section>


            </div>

            <!-- Left Secondary Column (4 Cols): Non-Duplicated Contact Info & Quick Actions -->
            <aside class="lg:col-span-4 flex flex-col gap-5">
              <div class="bg-surface rounded-2xl p-5 shadow-xs border border-border-subtle space-y-4">
                
                <!-- Section Header: "بيانات الاتصال" -->
                <div class="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <h3 class="text-xs sm:text-sm font-bold text-on-surface flex items-center gap-2">
                    <span class="material-symbols-outlined text-outline text-[18px]">contact_phone</span>
                    <span>بيانات الاتصال</span>
                  </h3>
                </div>

                <!-- Unique Contact Fields (Phone & City removed from here to eliminate duplication) -->
                <div class="space-y-3 text-xs">
                  <!-- Email Address -->
                  <div class="flex items-start gap-2.5 p-2.5 rounded-lg bg-surface-alt border border-border-subtle/50">
                    <span class="material-symbols-outlined text-outline text-[18px] mt-0.5">mail</span>
                    <div class="min-w-0">
                      <span class="text-[10px] text-on-surface-variant block mb-0.5">البريد الإلكتروني</span>
                      <span class="font-code-sm text-on-surface truncate block" dir="ltr">{{ o.email }}</span>
                    </div>
                  </div>

                  <!-- Full Street Address -->
                  <div class="flex items-start gap-2.5 p-2.5 rounded-lg bg-surface-alt border border-border-subtle/50">
                    <span class="material-symbols-outlined text-outline text-[18px] mt-0.5">home_pin</span>
                    <div class="min-w-0">
                      <span class="text-[10px] text-on-surface-variant block mb-0.5">العنوان الجغرافي الكامل</span>
                      <span class="text-on-surface leading-relaxed">{{ o.address }}</span>
                    </div>
                  </div>
                </div>

                <!-- Quick Action Communication Buttons -->
                <div class="pt-2 border-t border-border-subtle space-y-2">
                  <button
                    type="button"
                    class="w-full h-10 px-4 rounded-xl bg-[#25D366] text-white hover:bg-[#20ba59] transition-colors flex items-center justify-center gap-2 text-xs font-bold shadow-xs cursor-pointer"
                    (click)="openWhatsAppChat(o.phone, o.customerName)"
                  >
                    <span class="material-symbols-outlined text-[18px]">chat</span>
                    <span>مراسلة عبر واتساب (في النظام)</span>
                  </button>

                  <div class="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      class="h-9 px-3 rounded-lg bg-surface hover:bg-surface-container text-on-surface transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold shadow-xs border border-border-subtle cursor-pointer"
                      (click)="callViaRingCentral(o.phone)"
                    >
                      <span class="material-symbols-outlined text-[16px] text-brand-600">call</span>
                      <span>اتصال RingCentral</span>
                    </button>
                    <a
                      routerLink="/map"
                      class="h-9 px-3 rounded-lg bg-surface hover:bg-surface-container text-on-surface transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold shadow-xs border border-border-subtle cursor-pointer"
                    >
                      <span class="material-symbols-outlined text-[16px] text-accent-emerald">explore</span>
                      <span>عرض بالخريطة</span>
                    </a>
                  </div>
                </div>
              </div>
            </aside>

          </div>
        </div>

        <!-- ADD / UPGRADE DEVICE MODAL -->
        @if (isAddDeviceModalOpen()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs" (click)="closeAddDeviceModal()">
            <div class="bg-surface rounded-2xl border border-border-subtle shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-fade-in" (click)="$event.stopPropagation()">
              
              <!-- Modal Header -->
              <div class="h-16 px-6 bg-surface-alt border-b border-border-subtle flex items-center justify-between shrink-0">
                <div class="flex items-center gap-2.5">
                  <div class="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/20 text-brand-600 flex items-center justify-center">
                    <span class="material-symbols-outlined text-[22px]">devices</span>
                  </div>
                  <div>
                    <h3 class="font-bold text-sm sm:text-base text-on-surface">إضافة أو ترقية جهاز للطلب</h3>
                    <p class="text-xs text-on-surface-variant">ربط بيانات التشغيل باشتراك العميل ({{ o.orderNumber }})</p>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="closeAddDeviceModal()"
                  class="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer"
                >
                  <span class="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <!-- Modal Body (Scrollable) -->
              <div class="p-6 overflow-y-auto space-y-4 text-xs">

                @if (addDeviceError()) {
                  <div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">error</span>
                    <span>{{ addDeviceError() }}</span>
                  </div>
                }

                <!-- Device Type Selector -->
                <div>
                  <label class="block text-xs font-bold text-on-surface mb-2">نوع الجهاز المشغل *</label>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      (click)="onDeviceTypeChange('smart_tv')"
                      [class]="deviceForm.deviceType === 'smart_tv' ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 font-bold' : 'border-border-subtle bg-surface hover:bg-surface-container text-on-surface'"
                      class="p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center"
                    >
                      <span class="material-symbols-outlined text-[20px]">tv</span>
                      <span class="text-[11px]">شاشة ذكية</span>
                    </button>

                    <button
                      type="button"
                      (click)="onDeviceTypeChange('android_box')"
                      [class]="deviceForm.deviceType === 'android_box' ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 font-bold' : 'border-border-subtle bg-surface hover:bg-surface-container text-on-surface'"
                      class="p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center"
                    >
                      <span class="material-symbols-outlined text-[20px]">developer_board</span>
                      <span class="text-[11px]">أندرويد بوكس</span>
                    </button>

                    <button
                      type="button"
                      (click)="onDeviceTypeChange('firestick')"
                      [class]="deviceForm.deviceType === 'firestick' ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 font-bold' : 'border-border-subtle bg-surface hover:bg-surface-container text-on-surface'"
                      class="p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center"
                    >
                      <span class="material-symbols-outlined text-[20px]">usb</span>
                      <span class="text-[11px]">فاير ستيك</span>
                    </button>

                    <button
                      type="button"
                      (click)="onDeviceTypeChange('mobile')"
                      [class]="deviceForm.deviceType === 'mobile' ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 font-bold' : 'border-border-subtle bg-surface hover:bg-surface-container text-on-surface'"
                      class="p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center"
                    >
                      <span class="material-symbols-outlined text-[20px]">smartphone</span>
                      <span class="text-[11px]">هاتف محمول</span>
                    </button>
                  </div>
                </div>

                <!-- Device Name -->
                <div>
                  <label class="block text-xs font-bold text-on-surface mb-1">اسم الجهاز *</label>
                  <input
                    type="text"
                    [(ngModel)]="deviceForm.name"
                    placeholder="مثال: شاشة الصالة الرئيسية"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface text-on-surface text-xs focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <!-- App Name -->
                <div>
                  <label class="block text-xs font-bold text-on-surface mb-1">التطبيق المشغل</label>
                  <select
                    [(ngModel)]="deviceForm.appName"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface text-on-surface text-xs focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 cursor-pointer"
                  >
                    <option value="IBO Player Pro">IBO Player Pro (الأكثر استخداماً)</option>
                    <option value="Smart IPTV">Smart IPTV</option>
                    <option value="IPTV Smarters Pro">IPTV Smarters Pro</option>
                    <option value="Smarters Player Lite">Smarters Player Lite</option>
                    <option value="Bob Player">Bob Player</option>
                    <option value="XCIPTV Player">XCIPTV Player</option>
                    <option value="TiviMate IPTV">TiviMate IPTV</option>
                    <option value="FLIX IPTV">FLIX IPTV</option>
                    <option value="Net IPTV">Net IPTV</option>
                    <option value="تطبيق آخر">تطبيق آخر</option>
                  </select>
                </div>

                <!-- Technical Credentials Box -->
                <div class="p-4 rounded-xl border border-border-subtle bg-surface-alt/70 space-y-3">
                  <div class="flex items-center gap-2 font-bold text-on-surface text-xs">
                    <span class="material-symbols-outlined text-[16px] text-brand-600">vpn_key</span>
                    <span>البيانات التقنية والربط (MAC Address & Device Key)</span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[11px] font-semibold text-on-surface-variant mb-1">عنوان الماك (MAC Address)</label>
                      <input
                        type="text"
                        dir="ltr"
                        [(ngModel)]="deviceForm.macAddress"
                        placeholder="00:1A:79:XX:XX:XX"
                        class="w-full px-3 py-2 rounded-lg border border-border-subtle bg-surface text-on-surface font-mono text-xs focus:outline-none focus:border-brand-600"
                      />
                    </div>

                    <div>
                      <label class="block text-[11px] font-semibold text-on-surface-variant mb-1">مفتاح الجهاز (Device Key)</label>
                      <input
                        type="text"
                        dir="ltr"
                        [(ngModel)]="deviceForm.deviceKey"
                        placeholder="e.g. 123456"
                        class="w-full px-3 py-2 rounded-lg border border-border-subtle bg-surface text-on-surface font-mono text-xs focus:outline-none focus:border-brand-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-[11px] font-semibold text-on-surface-variant mb-1">اسم مستخدم السيرفر (Username - اختياري)</label>
                    <input
                      type="text"
                      dir="ltr"
                      [(ngModel)]="deviceForm.username"
                      placeholder="e.g. user_8923"
                      class="w-full px-3 py-2 rounded-lg border border-border-subtle bg-surface text-on-surface font-mono text-xs focus:outline-none focus:border-brand-600"
                    />
                  </div>
                </div>

                <!-- Auto-Upgrade Toggle -->
                <label class="flex items-center gap-2.5 p-3 rounded-xl border border-brand-200 dark:border-brand-900 bg-brand-50/50 dark:bg-brand-950/20 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="deviceForm.upgradeSlot"
                    class="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                  <div class="text-[11px]">
                    <span class="font-bold text-brand-900 dark:text-brand-300 block">ترقية سعة الأجهزة تلقائياً (+1)</span>
                    <span class="text-on-surface-variant block mt-0.5">زيادة عدد الأجهزة المسموحة في الطلب إذا وصل العميل إلى الحد الأقصى للباقة</span>
                  </div>
                </label>

              </div>

              <!-- Modal Footer -->
              <div class="h-16 px-6 bg-surface-alt border-t border-border-subtle flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  (click)="closeAddDeviceModal()"
                  class="px-4 py-2 rounded-xl border border-border-subtle bg-surface hover:bg-surface-container text-on-surface text-xs font-semibold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  (click)="submitAddDevice()"
                  [disabled]="isSubmittingDevice() || !deviceForm.name.trim()"
                  class="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  @if (isSubmittingDevice()) {
                    <span class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    <span>جاري الإضافة والتفعيل...</span>
                  } @else {
                    <span class="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>إضافة وتفعيل الجهاز</span>
                  }
                </button>
              </div>

            </div>
          </div>
        }

        <!-- DISCONNECT DEVICE CONFIRMATION MODAL -->
        @if (isDisconnectModalOpen()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs" (click)="closeDisconnectModal()">
            <div class="bg-surface rounded-2xl border border-border-subtle shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in" (click)="$event.stopPropagation()">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[22px]">power_off</span>
                </div>
                <div>
                  <h3 class="font-bold text-sm text-on-surface">تأكيد فصل الجهاز</h3>
                  <p class="text-xs text-on-surface-variant">إلغاء ربط الجهاز باشتراك العميل</p>
                </div>
              </div>

              <div class="p-3.5 rounded-xl bg-surface-alt border border-border-subtle text-xs space-y-1">
                <div class="text-on-surface font-semibold">
                  الجهاز: <span class="text-brand-600 font-bold">{{ deviceToDisconnect()?.name }}</span>
                </div>
                <div class="text-[11px] text-on-surface-variant">
                  التطبيق: {{ deviceToDisconnect()?.app }}
                </div>
              </div>

              <p class="text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
                تنبيه: سيتم إيقاف تشغيل الباقة على هذا الجهاز فوراً وحذفه من قائمة الأجهزة المرتبطة بالطلب.
              </p>

              <div class="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  (click)="closeDisconnectModal()"
                  class="px-4 py-2 rounded-xl border border-border-subtle bg-surface hover:bg-surface-container text-on-surface text-xs font-semibold transition-colors cursor-pointer"
                >
                  تراجع
                </button>

                <button
                  type="button"
                  (click)="executeDisconnectDevice()"
                  [disabled]="isDisconnectingDevice()"
                  class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  @if (isDisconnectingDevice()) {
                    <span class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    <span>جاري الفصل...</span>
                  } @else {
                    <span class="material-symbols-outlined text-[16px]">power_off</span>
                    <span>تأكيد فصل الجهاز</span>
                  }
                </button>
              </div>
            </div>
          </div>
        }

        <!-- INVOICE PREVIEW & PRINT MODAL -->
        @if (isInvoiceModalOpen()) {
            <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs invoice-modal-overlay" (click)="closeInvoiceModal()">
              <div class="bg-surface rounded-2xl border border-border-subtle shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden invoice-modal-container" (click)="$event.stopPropagation()">
                <!-- Modal Top Bar -->
                <div class="h-16 px-6 bg-surface-alt border-b border-border-subtle flex items-center justify-between shrink-0 no-print">
                  <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-xl bg-brand-600/10 text-brand-600 flex items-center justify-center">
                      <span class="material-symbols-outlined text-[20px]">receipt_long</span>
                    </div>
                    <div>
                      <h3 class="font-bold text-sm sm:text-base text-on-surface">معاينة الفاتورة الرسمية (Official Invoice)</h3>
                      <span class="text-xs text-on-surface-variant font-code-sm">{{ o.orderNumber }}</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="printInvoice()"
                      class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
                    >
                      <span class="material-symbols-outlined text-[18px]">print</span>
                      <span>طباعة (Print)</span>
                    </button>
                    <button
                      type="button"
                      (click)="closeInvoiceModal()"
                      class="w-9 h-9 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
                      title="إغلاق"
                    >
                      <span class="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                </div>

                <!-- Modal Body: Printable Invoice Document (English & LTR, Strictly zero mentions of IPTV) -->
                <div class="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-900/40 custom-scrollbar flex justify-center invoice-modal-body">
                  <div
                    id="printable-invoice"
                    class="printable-invoice-area bg-white text-slate-900 rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-10 w-full max-w-3xl flex flex-col gap-6 text-sm"
                    style="background-color: #ffffff; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; width: 100%; max-width: 768px; font-family: 'Inter', system-ui, -apple-system, sans-serif;"
                    dir="ltr"
                  >
                    
                    <!-- Invoice Header -->
                    <div class="flex items-start justify-between border-b border-slate-200 pb-6 gap-4" style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 24px;">
                      <div class="flex items-center gap-3" style="display: flex; align-items: center; gap: 14px;">
                        <div class="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xl shadow-md" style="width: 48px; height: 48px; border-radius: 12px; background-color: #2563eb; color: #ffffff; display: flex; align-items: center; justify-content: center; print-color-adjust: exact; -webkit-print-color-adjust: exact;">
                          <span class="material-symbols-outlined text-[28px]">live_tv</span>
                        </div>
                        <div>
                          <h1 class="text-2xl font-black text-slate-900 tracking-tight leading-none" style="font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; line-height: 1;">ORCA NETWORKS</h1>
                          <span class="text-xs text-slate-500 font-medium block mt-1" style="font-size: 12px; color: #64748b; margin-top: 4px; display: block;">Digital Media & Streaming Subscriptions</span>
                        </div>
                      </div>

                      <div class="text-right" style="text-align: right;">
                        <div class="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2 tracking-wide uppercase" style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: #d1fae5; color: #065f46; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; border: 1px solid #a7f3d0; print-color-adjust: exact; -webkit-print-color-adjust: exact;">
                          PAID INVOICE
                        </div>
                        <div class="space-y-0.5 text-xs text-slate-600" style="font-size: 12px; color: #475569; line-height: 1.5;">
                          <div><strong>Invoice #:</strong> <span class="font-mono text-slate-900 font-bold" style="font-family: monospace; font-weight: 700; color: #0f172a;">{{ o.orderNumber }}</span></div>
                          <div><strong>Issue Date:</strong> {{ formatDateEnglish(o.createdAt) }}</div>
                          <div><strong>Valid Until:</strong> {{ formatDateEnglish(o.expiresAt) }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Parties Info (Billed From / Billed To) -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100 text-left" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: left; print-color-adjust: exact; -webkit-print-color-adjust: exact;">
                      <div>
                        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5" style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">Billed From (Provider)</span>
                        <h4 class="font-bold text-slate-900 text-sm" style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0;">Orca Networks LLC</h4>
                        <div class="text-xs text-slate-600 space-y-0.5 mt-1" style="font-size: 12px; color: #475569; margin-top: 4px; line-height: 1.5;">
                          <div>United States &middot; Michigan</div>
                          <div>Support: support&#64;orcanetworks.tv</div>
                          <div>Account Rep: {{ getAgentEnglish(o.agentName) }}</div>
                        </div>
                      </div>

                      <div>
                        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5" style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">Billed To (Customer)</span>
                        <h4 class="font-bold text-slate-900 text-sm" style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0;">{{ o.customerName }}</h4>
                        <div class="text-xs text-slate-600 space-y-0.5 mt-1" style="font-size: 12px; color: #475569; margin-top: 4px; line-height: 1.5;">
                          <div style="font-family: monospace;">{{ formatPhone(o.phone) }}</div>
                          @if (o.address) { <div>{{ o.address }}</div> }
                          @if (o.email) { <div>{{ o.email }}</div> }
                        </div>
                      </div>
                    </div>

                    <!-- Line Items Table -->
                    <div class="overflow-hidden rounded-xl border border-slate-200" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                      <table class="w-full text-left text-xs border-collapse" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;">
                        <thead>
                          <tr class="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold" style="background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0; color: #334155; font-weight: 700; print-color-adjust: exact; -webkit-print-color-adjust: exact;">
                            <th class="py-3 px-4 text-left" style="padding: 12px 16px; text-align: left;">Item Description</th>
                            <th class="py-3 px-4 text-center" style="padding: 12px 16px; text-align: center;">Service Node</th>
                            <th class="py-3 px-4 text-center" style="padding: 12px 16px; text-align: center;">Duration</th>
                            <th class="py-3 px-4 text-right" style="padding: 12px 16px; text-align: right;">Amount</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-800" style="color: #1e293b;">
                          <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td class="py-3.5 px-4" style="padding: 14px 16px;">
                              <span class="font-bold text-slate-900 block text-sm" style="font-size: 14px; font-weight: 700; color: #0f172a; display: block;">{{ getPackageTitleEnglish(o.packageName) }}</span>
                              <span class="text-[11px] text-slate-500 mt-0.5 block" style="font-size: 11px; color: #64748b; margin-top: 4px; display: block; line-height: 1.4;">
                                Full access to international digital HD/4K streams, premium sports channels, and video on-demand catalog.
                              </span>
                              @if (o.devices && o.devices.length > 0) {
                                <div class="mt-2 text-[11px] text-slate-600" style="font-size: 11px; color: #475569; margin-top: 6px;">
                                  <span class="font-semibold text-slate-700" style="font-weight: 600; color: #334155;">Authorized Devices:</span>
                                  {{ o.devices.length }} Active Device(s)
                                </div>
                              }
                            </td>
                            <td class="py-3.5 px-4 text-center font-medium" style="padding: 14px 16px; text-align: center; font-weight: 500;">{{ getServerEnglish(o.server) }}</td>
                            <td class="py-3.5 px-4 text-center font-medium" style="padding: 14px 16px; text-align: center; font-weight: 500;">12 Months</td>
                            <td class="py-3.5 px-4 text-right font-bold font-mono text-sm" style="padding: 14px 16px; text-align: right; font-weight: 700; font-family: monospace; font-size: 14px;">\${{ o.price.toFixed(2) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- Financial Summary Calculation -->
                    <div class="flex justify-end pt-2" style="display: flex; justify-content: flex-end; padding-top: 8px;">
                      <div class="w-full sm:w-72 space-y-2 text-xs" style="width: 280px; font-size: 12px;">
                        <div class="flex justify-between text-slate-600" style="display: flex; justify-content: space-between; color: #475569; padding: 3px 0;">
                          <span>Subtotal:</span>
                          <span class="font-mono font-semibold" style="font-family: monospace; font-weight: 600;">\${{ o.price.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between text-slate-600" style="display: flex; justify-content: space-between; color: #475569; padding: 3px 0;">
                          <span>Sales Tax (0%):</span>
                          <span class="font-mono font-semibold" style="font-family: monospace; font-weight: 600;">\$0.00</span>
                        </div>
                        <div class="flex justify-between text-slate-600" style="display: flex; justify-content: space-between; color: #475569; padding: 3px 0;">
                          <span>Payment Method:</span>
                          <span class="font-semibold" style="font-weight: 600;">{{ getPaymentMethodEnglish(o.paymentMethod) }}</span>
                        </div>
                        <div class="h-px bg-slate-200 my-1" style="height: 1px; background-color: #e2e8f0; margin: 6px 0;"></div>
                        <div class="flex justify-between text-sm font-extrabold text-slate-900 bg-brand-50 p-2.5 rounded-lg border border-brand-100" style="display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 800; color: #0f172a; background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 10px 12px; border-radius: 8px; print-color-adjust: exact; -webkit-print-color-adjust: exact;">
                          <span>Total Amount Paid:</span>
                          <span class="font-mono text-brand-700 font-bold" style="font-family: monospace; color: #1d4ed8; font-weight: 700;">\${{ o.totalPaid.toFixed(2) }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Legal Terms & Footer -->
                    <div class="border-t border-slate-200 pt-5 mt-auto text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 text-left" style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: auto; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; align-items: center; text-align: left;">
                      <div style="max-width: 500px;">
                        <span class="font-semibold text-slate-700 block" style="font-weight: 600; color: #334155; display: block;">Terms & Service Agreement:</span>
                        <p class="leading-relaxed mt-0.5" style="margin-top: 2px; line-height: 1.5;">
                          This document serves as an official receipt and proof of payment issued by Orca Networks LLC. For technical assistance or account management, please contact customer support.
                        </p>
                      </div>
                      <div class="shrink-0 text-center sm:text-right" style="flex-shrink: 0; text-align: right;">
                        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-[10px] font-bold" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 8px; border: 1px solid #86efac; background-color: #f0fdf4; color: #166534; font-size: 10px; font-weight: 700; print-color-adjust: exact; -webkit-print-color-adjust: exact;">
                          <span class="material-symbols-outlined text-[14px]">verified</span>
                          <span>Digitally Verified & Secured</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          }
      } @else {
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <span class="material-symbols-outlined text-[48px] text-outline mb-3">error_outline</span>
          <h2 class="font-headline-md text-on-surface font-bold">لم يتم العثور على الطلب</h2>
          <a routerLink="/orders" class="mt-4 px-4 py-2 rounded-lg bg-brand-600 text-white font-label-md">
            العودة إلى قائمة الطلبات
          </a>
        </div>
      }
    </div>
  `
})
export class OrderDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private rcWidget = inject(RingCentralWidgetService);
  readonly store = inject(OrdersStore);

  isInvoiceModalOpen = signal(false);
  isAddDeviceModalOpen = signal(false);
  isDisconnectModalOpen = signal(false);
  isSubmittingDevice = signal(false);
  isDisconnectingDevice = signal(false);
  addDeviceError = signal<string | null>(null);
  deviceToDisconnect = signal<OrderDevice | null>(null);

  deviceForm = {
    name: 'شاشة ذكية 1',
    deviceType: 'smart_tv' as 'smart_tv' | 'android_box' | 'mobile' | 'pc' | 'firestick' | 'apple_tv' | 'mag',
    appName: 'IBO Player Pro',
    macAddress: '',
    deviceKey: '',
    username: '',
    upgradeSlot: true
  };

  order = computed(() => this.store.selectedOrder());
  formatPhone = formatPhoneNumber;
  getDeviceLabel = getDeviceTypeLabel;
  getPayment = getPaymentMethodLabel;
  getServer = getServerLabel;
  getPlan = getPlanLabel;
  formatDevices = formatActiveDevicesCount;

  openAddDeviceModal(): void {
    const currentCount = this.order()?.devices?.length || 0;
    this.deviceForm = {
      name: `شاشة ذكية ${currentCount + 1}`,
      deviceType: 'smart_tv',
      appName: 'IBO Player Pro',
      macAddress: '',
      deviceKey: '',
      username: '',
      upgradeSlot: true
    };
    this.addDeviceError.set(null);
    this.isAddDeviceModalOpen.set(true);
  }

  closeAddDeviceModal(): void {
    this.isAddDeviceModalOpen.set(false);
    this.addDeviceError.set(null);
  }

  onDeviceTypeChange(type: any): void {
    this.deviceForm.deviceType = type;
    const currentCount = this.order()?.devices?.length || 0;
    const namesMap: Record<string, string> = {
      smart_tv: `شاشة ذكية ${currentCount + 1}`,
      android_box: `أندرويد بوكس ${currentCount + 1}`,
      firestick: `فاير ستيك ${currentCount + 1}`,
      apple_tv: `أبل تي في ${currentCount + 1}`,
      mobile: `هاتف محمول ${currentCount + 1}`,
      pc: `كمبيوتر ${currentCount + 1}`,
      mag: `جهاز MAG ${currentCount + 1}`
    };
    this.deviceForm.name = namesMap[type] || `جهاز ${currentCount + 1}`;
  }

  submitAddDevice(): void {
    const o = this.order();
    if (!o) return;

    if (!this.deviceForm.name.trim()) {
      this.addDeviceError.set('يرجى إدخال اسم الجهاز');
      return;
    }

    this.isSubmittingDevice.set(true);
    this.addDeviceError.set(null);

    const dto = {
      name: this.deviceForm.name.trim(),
      device_type: this.deviceForm.deviceType,
      mac_address: this.deviceForm.macAddress.trim(),
      device_key: this.deviceForm.deviceKey.trim(),
      username: this.deviceForm.username.trim(),
      app_name: this.deviceForm.appName,
      upgrade_slot: this.deviceForm.upgradeSlot
    };

    this.store.addDevice(
      o.id,
      dto,
      () => {
        this.isSubmittingDevice.set(false);
        this.closeAddDeviceModal();
      },
      (err: any) => {
        this.isSubmittingDevice.set(false);
        const msg = err?.error?.message || 'تعذر إضافة الجهاز، يرجى التحقق من البيانات والمحاولة مجدداً';
        this.addDeviceError.set(Array.isArray(msg) ? msg.join(', ') : msg);
      }
    );
  }

  confirmDisconnectDevice(device: OrderDevice): void {
    this.deviceToDisconnect.set(device);
    this.isDisconnectModalOpen.set(true);
  }

  closeDisconnectModal(): void {
    this.isDisconnectModalOpen.set(false);
    this.deviceToDisconnect.set(null);
  }

  executeDisconnectDevice(): void {
    const o = this.order();
    const dev = this.deviceToDisconnect();
    if (!o || !dev) return;

    this.isDisconnectingDevice.set(true);
    this.store.removeDevice(
      o.id,
      dev.id,
      () => {
        this.isDisconnectingDevice.set(false);
        this.closeDisconnectModal();
      },
      () => {
        this.isDisconnectingDevice.set(false);
        this.closeDisconnectModal();
      }
    );
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.selectOrder(id);
    }
  }

  ngOnDestroy(): void {
    document.body.classList.remove('printing-invoice');
  }

  openInvoiceModal(): void {
    this.isInvoiceModalOpen.set(true);
    document.body.classList.add('printing-invoice');
  }

  closeInvoiceModal(): void {
    this.isInvoiceModalOpen.set(false);
    document.body.classList.remove('printing-invoice');
  }

  printInvoice(): void {
    window.print();
  }

  copyToClipboard(text: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  }

  openWhatsAppChat(phone: string, name?: string): void {
    if (phone) {
      this.router.navigate(['/inbox'], {
        queryParams: { phone, name: name || '', channel: 'whatsapp' },
      });
    }
  }

  callViaRingCentral(phone: string): void {
    if (phone) {
      this.rcWidget.dialNumber(phone);
    }
  }

  getWhatsAppUrl(phone: string): string {
    const clean = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${clean}`;
  }

  stripIptv(text: string | null | undefined): string {
    if (!text) return '';
    return text.replace(/iptv/gi, '').replace(/\s{2,}/g, ' ').trim();
  }

  formatDateEnglish(dateStr: string | null | undefined): string {
    if (!dateStr) return '2026/09/29';
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    let formatted = dateStr;
    for (let i = 0; i < 10; i++) {
      formatted = formatted.replaceAll(arabicNumerals[i], i.toString());
    }
    return formatted;
  }

  getAgentEnglish(agent: string | null | undefined): string {
    if (!agent || agent.trim() === 'غير محدد' || agent.trim() === '') {
      return 'Orca Support Representative';
    }
    return agent;
  }

  getPackageTitleEnglish(name: string | null | undefined): string {
    if (!name) return 'Premium Annual Digital Subscription';
    const cleaned = this.stripIptv(name);
    const lower = cleaned.toLowerCase();
    if (cleaned.includes('سنوي') || lower.includes('annual') || lower.includes('year')) {
      return 'Premium Annual Digital Subscription';
    }
    if (cleaned.includes('مخصص') || lower.includes('custom')) {
      return 'Custom Premium Media Plan';
    }
    if (cleaned.includes('نصف') || cleaned.includes('6') || lower.includes('semi')) {
      return '6-Month Digital Media Subscription';
    }
    if (cleaned.includes('3') || cleaned.includes('ربع') || lower.includes('quarter')) {
      return '3-Month Digital Media Subscription';
    }
    if (cleaned.includes('شهر') || lower.includes('month')) {
      return '1-Month Digital Media Subscription';
    }
    const hasArabic = /[\u0600-\u06FF]/.test(cleaned);
    if (hasArabic) {
      return 'Custom Premium Media Plan';
    }
    return cleaned || 'Premium Digital Media Subscription';
  }

  getServerEnglish(server: string | null | undefined): string {
    if (!server) return 'Primary Streaming Node (Standard)';
    const s = server.toLowerCase();
    if (s.includes('افتراض') || s.includes('default')) {
      return 'Primary Streaming Node (Standard)';
    }
    if (s.includes('gold') || s.includes('ذهب') || s.includes('1')) {
      return 'Primary Streaming Node (High Speed)';
    }
    if (s.includes('silver') || s.includes('فض') || s.includes('2')) {
      return 'Secondary Streaming Node (US-Central)';
    }
    const hasArabic = /[\u0600-\u06FF]/.test(server);
    if (hasArabic) {
      return 'Primary Streaming Node (Standard)';
    }
    return this.stripIptv(server) || 'Primary Streaming Node (Standard)';
  }

  getPaymentMethodEnglish(method: string | null | undefined): string {
    if (!method) return 'Credit Card';
    const m = method.toLowerCase();
    if (m.includes('stripe') || m.includes('ائتمان') || m.includes('credit') || m.includes('card')) {
      return 'Credit Card (Stripe)';
    }
    if (m.includes('zelle')) {
      return 'Zelle Transfer';
    }
    if (m.includes('cash') || m.includes('نقد')) {
      return 'Cash Payment';
    }
    if (m.includes('bank') || m.includes('تحويل بنك') || m.includes('wire')) {
      return 'Bank Wire Transfer';
    }
    if (m.includes('paypal')) {
      return 'PayPal';
    }
    return 'Credit Card';
  }
}


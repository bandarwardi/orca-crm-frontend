import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdersStore } from '../../store/orders.store';
import { OrderStatusBadge } from '../order-status-badge/order-status-badge';
import { Order } from '../../models/order.model';

import { PhoneFormatPipe } from '../../../../shared/pipes/phone-format.pipe';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, OrderStatusBadge, PhoneFormatPipe, ErrorState, LoadingState],
  host: { class: 'flex-1 flex flex-col min-h-0 overflow-hidden' },
  template: `
    <div class="flex-1 flex flex-col min-h-0 overflow-y-auto px-3 sm:px-space-lg py-4 pb-space-xl bg-canvas custom-scrollbar">
      <!-- Decorative ambient glow -->
      <div class="relative w-full">
        <div class="absolute -top-24 right-10 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div class="absolute top-48 left-12 w-80 h-80 bg-accent-emerald/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <!-- Top Page Header Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-space-sm pt-2">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-brand-50 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 shrink-0">
              <span class="material-symbols-outlined text-[24px] sm:text-[26px]">receipt_long</span>
            </div>
            <div class="flex items-center gap-space-xs">
              <h1 class="font-headline-lg text-headline-sm sm:text-headline-lg text-on-surface font-bold tracking-tight">الطلبات</h1>
              <span class="px-2 sm:px-2.5 py-0.5 rounded-full bg-surface-container text-brand-600 font-code-sm text-label-sm font-semibold">
                {{ store.totalOrdersCount() }} طلباً
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2">
            <button
              (click)="exportCSV()"
              class="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-lg bg-surface border border-border-subtle text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5 sm:gap-2 font-label-md text-label-sm sm:text-label-md shadow-xs cursor-pointer active:scale-95"
              title="تصدير CSV"
              type="button"
            >
              <span class="material-symbols-outlined text-[18px] text-on-surface-variant">download</span>
              <span class="hidden sm:inline">تصدير CSV</span>
            </button>
            <button
              (click)="openSalesReport()"
              class="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-lg bg-surface border border-border-subtle text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5 sm:gap-2 font-label-md text-label-sm sm:text-label-md shadow-xs cursor-pointer active:scale-95"
              title="تقرير المبيعات"
              type="button"
            >
              <span class="material-symbols-outlined text-[18px] text-on-surface-variant">bar_chart</span>
              <span class="hidden sm:inline">تقرير المبيعات</span>
            </button>
            <a
              routerLink="/orders/new"
              class="h-9 sm:h-10 px-3 sm:px-4 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-all flex items-center gap-1.5 sm:gap-2 font-label-md text-label-sm sm:text-label-md shadow-xs active:scale-95"
            >
              <span class="material-symbols-outlined text-[18px] sm:text-[20px]">add_circle</span>
              <span class="font-semibold">+ طلب جديد</span>
            </a>
          </div>
        </div>

        <!-- Quick Segment Tabs -->
        <div class="flex items-center gap-2 pt-2 pb-space-sm overflow-x-auto no-scrollbar">
          <button
            type="button"
            (click)="store.setActiveTab('all')"
            [class]="store.activeTab() === 'all'
              ? 'px-4 py-2 rounded-xl bg-brand-600 text-white font-label-md text-label-md shadow-xs whitespace-nowrap flex items-center gap-2'
              : 'px-4 py-2 rounded-xl bg-surface border border-border-subtle text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md whitespace-nowrap flex items-center gap-2'"
          >
            <span>كافة الطلبات</span>
            <span [class]="store.activeTab() === 'all' ? 'px-1.5 py-0.2 rounded-full bg-white/20 text-white text-label-sm font-code-sm' : 'text-label-sm font-code-sm opacity-80'">
              {{ store.totalOrdersCount() }}
            </span>
          </button>

          <button
            type="button"
            (click)="store.setActiveTab('active')"
            [class]="store.activeTab() === 'active'
              ? 'px-4 py-2 rounded-xl bg-[#ECFDF5] text-[#059669] dark:bg-emerald-500/20 dark:text-emerald-300 font-label-md text-label-md shadow-xs whitespace-nowrap flex items-center gap-2 font-semibold'
              : 'px-4 py-2 rounded-xl bg-surface border border-border-subtle text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md whitespace-nowrap flex items-center gap-2'"
          >
            <span class="w-2 h-2 rounded-full bg-[#059669]"></span>
            <span>النشطة</span>
            <span class="text-label-sm font-code-sm opacity-80">{{ store.activeOrdersCount() }}</span>
          </button>

          <button
            type="button"
            (click)="store.setActiveTab('expiring')"
            [class]="store.activeTab() === 'expiring'
              ? 'px-4 py-2 rounded-xl bg-[#FFFBEB] text-[#D97706] dark:bg-amber-500/20 dark:text-amber-300 font-label-md text-label-md shadow-xs whitespace-nowrap flex items-center gap-2 font-semibold'
              : 'px-4 py-2 rounded-xl bg-surface border border-border-subtle text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md whitespace-nowrap flex items-center gap-2'"
          >
            <span class="material-symbols-outlined text-[16px] text-[#D97706]">schedule</span>
            <span>ينتهي قريباً</span>
            <span class="px-1.5 py-0.2 rounded-full bg-[#D97706] text-white text-label-sm font-code-sm font-semibold">
              {{ store.expiringOrdersCount() }}
            </span>
          </button>

          <button
            type="button"
            (click)="store.setActiveTab('expired')"
            [class]="store.activeTab() === 'expired'
              ? 'px-4 py-2 rounded-xl bg-[#FFF1F2] text-[#E11D48] dark:bg-rose-500/20 dark:text-rose-300 font-label-md text-label-md shadow-xs whitespace-nowrap flex items-center gap-2 font-semibold'
              : 'px-4 py-2 rounded-xl bg-surface border border-border-subtle text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md whitespace-nowrap flex items-center gap-2'"
          >
            <span class="w-2 h-2 rounded-full bg-[#F43F5E]"></span>
            <span>متأخر / منتهي</span>
            <span class="text-label-sm font-code-sm opacity-80">{{ store.expiredOrdersCount() }}</span>
          </button>
        </div>

        <!-- Filter Search & Controls Bar -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 pb-space-sm">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
            <!-- Search Input -->
            <div class="relative flex-1 min-w-[240px]">
              <span class="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">search</span>
              <input
                [ngModel]="store.searchQuery()"
                (ngModelChange)="store.setSearchQuery($event)"
                class="w-full h-11 pr-10 pl-4 rounded-xl bg-surface border border-border-subtle font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-xs"
                placeholder="ابحث برقم الطلب، اسم المشترك، أو رقم الهاتف..."
                type="text"
              />
            </div>

            <!-- Single Consolidated Filter Dropdown -->
            <div class="flex items-center gap-2">
              <div class="relative flex items-center bg-surface rounded-xl border border-border-subtle px-3 h-11 shadow-xs">
                <span class="material-symbols-outlined text-on-surface-variant text-[18px] ml-1.5">filter_alt</span>
                <select
                  [ngModel]="combinedFilterValue"
                  (ngModelChange)="onFilterChange($event)"
                  class="h-10 pr-2 pl-8 bg-transparent text-on-surface font-body-sm text-body-sm appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="">الحالة والموظف: الكل</option>
                  <optgroup label="الحالة">
                    <option value="status:active">نشط فقط</option>
                    <option value="status:expiring">ينتهي قريباً فقط</option>
                    <option value="status:expired">متأخر / منتهي فقط</option>
                  </optgroup>
                  <optgroup label="الموظف المسؤول">
                    <option value="agent:طارق">طارق المنصور</option>
                    <option value="agent:سارة">سارة مقدسي</option>
                    <option value="agent:عمر">عمر الخطيب</option>
                  </optgroup>
                </select>
                <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">expand_more</span>
              </div>

              <!-- Reset Filter Button -->
              <button
                (click)="onResetFilters()"
                class="w-11 h-11 rounded-xl bg-surface hover:bg-surface-container text-on-surface-variant hover:text-accent-rose flex items-center justify-center transition-colors border border-border-subtle"
                title="إعادة تعيين الفلاتر"
                type="button"
              >
                <span class="material-symbols-outlined text-[20px]">restart_alt</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Operational Summary Metrics Ribbon -->
        <div class="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-xl bg-surface shadow-xs mb-space-md border border-border-subtle">
          <div class="flex flex-wrap items-center gap-3 text-label-sm font-label-sm text-on-surface-variant">
            <span class="font-semibold text-on-surface">إيجاز العمليات:</span>
            <span class="inline-flex items-center gap-1.5 text-on-surface">
              <span class="w-2 h-2 rounded-full bg-[#059669]"></span>
              <span>{{ store.activeOrdersCount() }} نشط</span>
            </span>
            <span class="text-border-subtle">•</span>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFFBEB] font-semibold text-[#D97706] shadow-xs">
              <span class="w-2 h-2 rounded-full bg-[#D97706] animate-pulse"></span>
              <span>{{ store.expiringOrdersCount() }} ينتهي قريباً</span>
            </span>
            <span class="text-border-subtle">•</span>
            <span class="inline-flex items-center gap-1.5 text-on-surface">
              <span class="w-2 h-2 rounded-full bg-[#F43F5E]"></span>
              <span>{{ store.expiredOrdersCount() }} متأخر / منتهي</span>
            </span>
          </div>
          <div class="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
            <span>مجموع الإيراد المحقق:</span>
            <span class="font-code-sm text-headline-sm font-bold text-brand-600" dir="ltr">
              \${{ store.totalRevenue().toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- Orders Cards List -->
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
            }
            @for (order of store.paginatedOrders(); track order.id) {
              <div
                class="group p-3.5 sm:p-5 rounded-2xl bg-surface hover:bg-surface-alt transition-all duration-200 shadow-xs hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border border-border-subtle cursor-pointer"
                [routerLink]="['/orders', order.id]"
              >
                <!-- Customer Info -->
                <div class="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div
                    [class]="getAvatarBgClass(order)"
                    class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl font-headline-sm text-headline-sm font-bold flex items-center justify-center flex-shrink-0 shadow-xs"
                  >
                    {{ order.customerInitials }}
                  </div>
                  <div class="flex flex-col gap-0.5 sm:gap-1 min-w-0">
                    <!-- Line 1: Name + Order ID -->
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-headline-sm text-body-md sm:text-headline-sm font-bold text-on-surface tracking-tight truncate group-hover:text-brand-600 transition-colors">
                        {{ order.customerName }}
                      </span>
                      <span class="text-[11px] sm:text-[12px] font-code-sm px-1.5 sm:px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-medium">
                        {{ order.orderNumber }}
                      </span>
                    </div>
                    <!-- Line 2: City + Phone number -->
                    <div class="flex items-center gap-2 text-label-sm sm:text-body-sm font-body-sm text-on-surface-variant">
                      <span>{{ order.city }}</span>
                      <span class="text-border-subtle">•</span>
                      <span class="font-code-sm text-on-surface font-medium" dir="ltr">{{ order.phone | phoneFormat }}</span>
                    </div>
                  </div>
                </div>

                <!-- Far side: ONE status badge, price, and ONE action button -->
                <div class="flex items-center gap-3 sm:gap-5 justify-between sm:justify-end flex-shrink-0 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-border-subtle">
                  <app-order-status-badge [status]="order.status" [label]="order.statusLabel"></app-order-status-badge>

                  <span class="font-code-sm text-body-lg sm:text-headline-sm font-bold text-on-surface min-w-[65px] sm:min-w-[75px] text-left dir-ltr">
                    \${{ order.price.toFixed(2) }}
                  </span>

                  <button
                    class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface-container group-hover:bg-brand-600 group-hover:text-white text-on-surface transition-all flex items-center justify-center"
                    title="عرض التفاصيل"
                    type="button"
                  >
                    <span class="material-symbols-outlined text-[18px] sm:text-[20px]">chevron_left</span>
                  </button>
                </div>
              </div>
            }
          </div>
        } @else {
          <!-- Empty State -->
          <div class="my-space-md p-space-lg rounded-2xl bg-surface text-center shadow-xs border border-border-subtle">
            <div class="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto text-brand-600 mb-3">
              <span class="material-symbols-outlined text-[32px]">manage_search</span>
            </div>
            <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">لا توجد طلبات مطابقة لهذا البحث</h3>
            <p class="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto mt-1 mb-4">
              لم يتم العثور على أية سجلات بالمعايير الحالية. يرجى التأكد من كتابة الاسم أو رقم الهاتف بالصيغة الصحيحة.
            </p>
            <button
              class="h-9 px-4 rounded-lg bg-surface-container text-on-surface hover:bg-surface-alt transition-colors font-label-md text-label-md inline-flex items-center gap-2 border border-border-subtle"
              (click)="onResetFilters()"
              type="button"
            >
              <span class="material-symbols-outlined text-[18px]">restart_alt</span>
              <span>إعادة تعيين كافة الفلاتر</span>
            </button>
          </div>
        }

        <!-- Pagination & Results Footbar -->
        <div class="mt-space-md p-space-sm rounded-2xl bg-surface shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border-subtle">
          <div class="flex items-center gap-2 text-body-sm font-body-sm text-on-surface-variant">
            <span>عرض</span>
            <span class="font-code-sm font-bold text-on-surface">
              {{ (store.currentPage() - 1) * store.pageSize() + 1 }} - {{ Math.min(store.currentPage() * store.pageSize(), store.filteredOrders().length) }}
            </span>
            <span>من أصل</span>
            <span class="font-code-sm font-bold text-brand-600">{{ store.filteredOrders().length }}</span>
            <span>طلباً مسجلاً</span>
          </div>

          <!-- Pagination Buttons -->
          <div class="flex items-center gap-1.5 self-center sm:self-auto">
            <button
              [disabled]="store.currentPage() <= 1"
              (click)="store.setPage(store.currentPage() - 1)"
              class="w-9 h-9 rounded-lg bg-surface hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors disabled:opacity-40 border border-border-subtle"
              title="الصفحة السابقة"
              type="button"
            >
              <span class="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>

            <button class="w-9 h-9 rounded-lg bg-brand-600 text-white font-code-sm text-label-sm font-bold shadow-xs" type="button">
              {{ store.currentPage() }}
            </button>

            <button
              [disabled]="store.currentPage() * store.pageSize() >= store.filteredOrders().length"
              (click)="store.setPage(store.currentPage() + 1)"
              class="w-9 h-9 rounded-lg bg-surface hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors disabled:opacity-40 border border-border-subtle"
              title="الصفحة التالية"
              type="button"
            >
              <span class="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
          </div>

          <!-- Rows per Page Selector -->
          <div class="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
            <span>لكل صفحة:</span>
            <select
              [ngModel]="store.pageSize()"
              (ngModelChange)="store.setPageSize(+$event)"
              class="h-8 px-2 rounded-lg bg-surface text-on-surface font-code-sm text-body-sm border border-border-subtle focus:ring-1 focus:ring-brand-500 outline-none cursor-pointer"
            >
              <option [value]="10">١٠</option>
              <option [value]="25">٢٥</option>
              <option [value]="50">٥٠</option>
            </select>
          </div>
        </div>
      </div>

      <!-- SALES REPORT MODAL -->
      @if (isSalesReportOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs" (click)="closeSalesReport()">
          <div class="bg-surface rounded-2xl border border-border-subtle shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150" (click)="$event.stopPropagation()" dir="rtl">
            <!-- Modal Header -->
            <div class="p-4 sm:p-5 bg-surface-alt border-b border-border-subtle flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-brand-600/10 text-brand-600 flex items-center justify-center">
                  <span class="material-symbols-outlined text-[24px]">bar_chart</span>
                </div>
                <div>
                  <h3 class="font-bold text-base sm:text-lg text-on-surface">تقرير المبيعات والاشتراكات</h3>
                  <p class="text-xs text-on-surface-variant">ملخص مالي وإحصائي لطلبات النظام</p>
                </div>
              </div>

              <button
                type="button"
                (click)="closeSalesReport()"
                class="w-9 h-9 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
                title="إغلاق"
              >
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
              <!-- Summary KPI Cards -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div class="p-4 rounded-xl bg-surface-alt border border-border-subtle flex flex-col gap-1">
                  <span class="text-xs text-on-surface-variant font-medium">إجمالي المبيعات</span>
                  <span class="text-xl sm:text-2xl font-black text-brand-600 font-mono" dir="ltr">\${{ salesSummary().totalRevenue.toLocaleString() }}</span>
                  <span class="text-[11px] text-accent-emerald font-semibold flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">trending_up</span>
                    من {{ salesSummary().totalCount }} طلباً
                  </span>
                </div>

                <div class="p-4 rounded-xl bg-surface-alt border border-border-subtle flex flex-col gap-1">
                  <span class="text-xs text-on-surface-variant font-medium">الاشتراكات النشطة</span>
                  <span class="text-xl sm:text-2xl font-black text-emerald-600 font-mono">{{ salesSummary().activeCount }}</span>
                  <span class="text-[11px] text-on-surface-variant font-medium">بنسبة {{ salesSummary().activeRate }}% من الإجمالي</span>
                </div>

                <div class="p-4 rounded-xl bg-surface-alt border border-border-subtle flex flex-col gap-1">
                  <span class="text-xs text-on-surface-variant font-medium">متوسط قيمة الطلب</span>
                  <span class="text-xl sm:text-2xl font-black text-on-surface font-mono" dir="ltr">\${{ salesSummary().avgOrderValue.toFixed(1) }}</span>
                  <span class="text-[11px] text-on-surface-variant font-medium">لكل عملية اشتراك</span>
                </div>

                <div class="p-4 rounded-xl bg-surface-alt border border-border-subtle flex flex-col gap-1">
                  <span class="text-xs text-on-surface-variant font-medium">اشتراكات قاربت الانتهاء</span>
                  <span class="text-xl sm:text-2xl font-black text-amber-600 font-mono">{{ salesSummary().expiringCount }}</span>
                  <span class="text-[11px] text-amber-700 font-medium">تحتاج تجديد ومتابعة</span>
                </div>
              </div>

              <!-- Payment Breakdown & Sales Reps -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Payment Methods Breakdown -->
                <div class="p-4 sm:p-5 rounded-xl bg-surface-alt border border-border-subtle space-y-3">
                  <h4 class="font-bold text-sm text-on-surface flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px] text-brand-600">credit_card</span>
                    <span>توزيع طرق الدفع</span>
                  </h4>
                  <div class="space-y-2.5">
                    @for (pm of salesSummary().paymentBreakdown; track pm.method) {
                      <div class="space-y-1">
                        <div class="flex items-center justify-between text-xs">
                          <span class="font-medium text-on-surface">{{ pm.label }}</span>
                          <div class="flex items-center gap-2 font-mono">
                            <span class="text-on-surface font-bold">\${{ pm.total.toLocaleString() }}</span>
                            <span class="text-[11px] text-on-surface-variant">({{ pm.count }} طلب)</span>
                          </div>
                        </div>
                        <div class="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                          <div class="h-full bg-brand-600 rounded-full" [style.width.%]="pm.percentage"></div>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Sales Reps Performance -->
                <div class="p-4 sm:p-5 rounded-xl bg-surface-alt border border-border-subtle space-y-3">
                  <h4 class="font-bold text-sm text-on-surface flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px] text-accent-emerald">groups</span>
                    <span>أداء مسؤولي المبيعات</span>
                  </h4>
                  <div class="space-y-2.5">
                    @for (rep of salesSummary().repsBreakdown; track rep.name) {
                      <div class="p-2.5 rounded-lg bg-surface border border-border-subtle flex items-center justify-between text-xs">
                        <div class="flex items-center gap-2.5">
                          <div class="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 font-bold text-xs flex items-center justify-center">
                            {{ rep.name.charAt(0) }}
                          </div>
                          <div>
                            <span class="font-bold text-on-surface block">{{ rep.name }}</span>
                            <span class="text-[10px] text-on-surface-variant">{{ rep.count }} طلبات مسجلة</span>
                          </div>
                        </div>
                        <span class="font-mono font-bold text-brand-600 text-sm" dir="ltr">\${{ rep.revenue.toLocaleString() }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-4 bg-surface-alt border-t border-border-subtle flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="exportCSV()"
                  class="px-3.5 py-2 rounded-xl bg-surface border border-border-subtle hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span class="material-symbols-outlined text-[16px]">download</span>
                  <span>تصدير كـ CSV</span>
                </button>
                <a
                  routerLink="/performance"
                  (click)="closeSalesReport()"
                  class="px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span class="material-symbols-outlined text-[16px]">insights</span>
                  <span>لوحة تحليلات الأداء الشاملة</span>
                </a>
              </div>

              <button
                type="button"
                (click)="closeSalesReport()"
                class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class OrdersList implements OnInit {
  readonly store = inject(OrdersStore);
  readonly Math = Math;

  isSalesReportOpen = signal(false);

  readonly salesSummary = computed(() => {
    const orders = this.store.orders();
    const totalCount = orders.length;
    const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.totalPaid) || Number(o.price) || 0), 0);
    const activeCount = orders.filter(o => o.status === 'active').length;
    const expiringCount = orders.filter(o => o.status === 'expiring').length;
    const expiredCount = orders.filter(o => o.status === 'expired').length;
    const activeRate = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;
    const avgOrderValue = totalCount > 0 ? totalRevenue / totalCount : 0;

    // Payment methods breakdown
    const pmMap = new Map<string, { count: number; total: number }>();
    orders.forEach(o => {
      const pm = o.paymentMethod || 'أخرى';
      const existing = pmMap.get(pm) || { count: 0, total: 0 };
      existing.count += 1;
      existing.total += (Number(o.totalPaid) || Number(o.price) || 0);
      pmMap.set(pm, existing);
    });

    const paymentBreakdown = Array.from(pmMap.entries()).map(([method, data]) => ({
      method,
      label: method,
      count: data.count,
      total: data.total,
      percentage: totalRevenue > 0 ? Math.round((data.total / totalRevenue) * 100) : 0
    })).sort((a, b) => b.total - a.total);

    // Sales reps breakdown
    const repsMap = new Map<string, { count: number; revenue: number }>();
    orders.forEach(o => {
      const rep = o.agentName && o.agentName !== 'غير محدد' ? o.agentName : 'فريق المبيعات العام';
      const existing = repsMap.get(rep) || { count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += (Number(o.totalPaid) || Number(o.price) || 0);
      repsMap.set(rep, existing);
    });

    const repsBreakdown = Array.from(repsMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue
    })).sort((a, b) => b.revenue - a.revenue);

    return {
      totalCount,
      totalRevenue,
      activeCount,
      expiringCount,
      expiredCount,
      activeRate,
      avgOrderValue,
      paymentBreakdown,
      repsBreakdown
    };
  });

  ngOnInit() {
    this.store.loadOrders();
  }

  combinedFilterValue = '';

  onFilterChange(val: string): void {
    this.combinedFilterValue = val;
    if (!val) {
      this.store.setFilters('', '');
    } else if (val.startsWith('status:')) {
      this.store.setFilters(val.replace('status:', ''), '');
    } else if (val.startsWith('agent:')) {
      this.store.setFilters('', val.replace('agent:', ''));
    }
  }

  onResetFilters(): void {
    this.combinedFilterValue = '';
    this.store.resetFilters();
  }

  getAvatarBgClass(order: Order): string {
    if (order.status === 'expiring') {
      return 'bg-brand-600 text-white';
    } else if (order.status === 'expired') {
      return 'bg-surface-container text-on-surface-variant';
    } else {
      return 'bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300';
    }
  }

  openSalesReport(): void {
    this.isSalesReportOpen.set(true);
  }

  closeSalesReport(): void {
    this.isSalesReportOpen.set(false);
  }

  exportCSV(): void {
    const orders = this.store.filteredOrders().length > 0 ? this.store.filteredOrders() : this.store.orders();
    if (!orders || orders.length === 0) {
      alert('لا توجد طلبات لتصديرها حالياً');
      return;
    }

    const headers = [
      'رقم الطلب',
      'اسم العميل',
      'رقم الهاتف',
      'المدينة',
      'العنوان',
      'الحالة',
      'المبلغ ($)',
      'طريقة الدفع',
      'الخادم',
      'الباقة',
      'المسؤول',
      'تاريخ الإنشاء',
      'تاريخ الانتهاء'
    ];

    const escapeCsv = (val: string | number | null | undefined): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = orders.map(o => [
      escapeCsv(o.orderNumber),
      escapeCsv(o.customerName),
      escapeCsv(o.phone),
      escapeCsv(o.city || ''),
      escapeCsv(o.address || ''),
      escapeCsv(o.statusLabel || o.status),
      escapeCsv(o.price ? Number(o.price).toFixed(2) : '0.00'),
      escapeCsv(o.paymentMethod || ''),
      escapeCsv(o.server || ''),
      escapeCsv(o.packageName || ''),
      escapeCsv(o.agentName || ''),
      escapeCsv(o.createdAt || ''),
      escapeCsv(o.expiresAt || '')
    ].join(','));

    // UTF-8 BOM so Excel opens Arabic correctly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-export-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

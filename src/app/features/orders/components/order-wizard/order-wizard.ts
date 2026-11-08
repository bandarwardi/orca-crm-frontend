import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { OrdersStore } from '../../store/orders.store';
import { OrderWizardStepper } from './order-wizard-stepper';
import { StepCustomer } from './step-customer';
import { StepSubscription } from './step-subscription';
import { StepDevices } from './step-devices';
import { StepReview } from './step-review';
import {
  getPaymentMethodLabel,
  getPlanLabel,
  formatActiveDevicesCount
} from '../../../../shared/utils/label-mappings';

@Component({
  selector: 'app-order-wizard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OrderWizardStepper,
    StepCustomer,
    StepSubscription,
    StepDevices,
    StepReview
  ],
  host: { class: 'flex-1 flex flex-col min-h-0 overflow-hidden' },
  template: `
    <div class="flex-1 flex flex-col min-h-0 overflow-y-auto px-3 sm:px-space-lg py-4 pb-space-xl bg-canvas custom-scrollbar" dir="rtl">
      <div class="order-wizard-content flex flex-col gap-5 sm:gap-6 w-full max-w-7xl mx-auto">
        <!-- Top Breadcrumb Navigation Bar -->
        <nav aria-label="مسار التنقل" class="flex flex-wrap items-center justify-between gap-3 py-1">
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
              <span class="text-on-surface font-semibold">إنشاء طلب جديد</span>
            </div>
          </div>
        </nav>

        <!-- Page Header -->
        <section class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-surface p-4 sm:p-5 rounded-2xl border border-border-subtle shadow-xs">
          <div class="flex items-center gap-3 sm:gap-3.5">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300 flex items-center justify-center border border-brand-100 dark:border-brand-500/30 shrink-0 shadow-xs">
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="text-lg sm:text-xl font-bold text-on-surface">إنشاء طلب جديد</h1>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                  طلب جديد
                </span>
              </div>
              <p class="text-xs text-on-surface-variant mt-0.5 sm:mt-1">
                العميل: <span class="font-semibold text-on-surface">{{ store.wizardCustomer().fullName || store.wizardCustomer().phone || 'عميل جديد' }}</span>
                @if (store.wizardCustomer().leadId) {
                  <span class="text-xs text-brand-600 mr-1.5 font-medium">
                    (تم التحويل من عميل محتمل #{{ store.wizardCustomer().leadId }})
                  </span>
                }
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 sm:gap-2.5 self-end sm:self-center">
            <button
              class="text-xs font-semibold text-on-surface-variant hover:text-on-surface bg-surface hover:bg-surface-container px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-colors border border-border-subtle"
              type="button"
            >
              حفظ كمسودة
            </button>
            <button
              (click)="onCancel()"
              class="text-xs font-semibold text-accent-rose hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-colors border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30"
              type="button"
            >
              إلغاء الطلب
            </button>
          </div>
        </section>

        <!-- Horizontal Stepper -->
        <app-order-wizard-stepper
          [currentStep]="store.wizardStep()"
          (stepClick)="store.setWizardStep($event)"
        ></app-order-wizard-stepper>

        <!-- Content Grid: Main Step Area (8 cols) & Quick Summary Panel (4 cols) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Main Step Area (Right side in RTL, 8 cols) -->
          <div class="lg:col-span-8">
            @switch (store.wizardStep()) {
              @case (1) {
                <app-step-customer></app-step-customer>
              }
              @case (2) {
                <app-step-subscription></app-step-subscription>
              }
              @case (3) {
                <app-step-devices></app-step-devices>
              }
              @case (4) {
                <app-step-review></app-step-review>
              }
            }
          </div>

          <!-- Summary Sidebar / Quick Reference Panel (Left side in RTL, 4 cols) -->
          <aside class="lg:col-span-4 space-y-5">
            <div class="bg-surface rounded-2xl border border-border-subtle p-5 shadow-xs space-y-4">
              <div class="flex items-center justify-between border-b border-border-subtle pb-3">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full bg-brand-600"></div>
                  <h3 class="text-sm font-bold text-on-surface">ملخص الطلب السريع</h3>
                </div>
              </div>

              <!-- Customer Summary Card -->
              <div class="p-3.5 rounded-xl bg-surface-alt border border-border-subtle space-y-2">
                <div class="text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wider">بيانات المشترك</div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-on-surface">{{ store.wizardCustomer().fullName || store.wizardCustomer().phone || 'لم يُحدد بعد' }}</span>
                  @if (store.wizardCustomer().leadId) {
                    <span class="text-[11px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100 font-mono">
                      #{{ store.wizardCustomer().leadId }}
                    </span>
                  }
                </div>
                <div class="text-xs text-on-surface-variant flex items-center gap-1.5" dir="ltr">
                  <svg class="w-3.5 h-3.5 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                  <span class="font-mono text-on-surface">{{ store.wizardCustomer().phone || '—' }}</span>
                </div>
                <div class="text-xs text-on-surface-variant flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                  <span>{{ store.wizardCustomer().address || store.wizardCustomer().city || '—' }}</span>
                </div>
              </div>

              <!-- Subscription Summary Card -->
              <div class="p-3.5 rounded-xl bg-surface-alt border border-border-subtle space-y-2.5">
                <div class="text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wider">تفاصيل الدفع</div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-on-surface">{{ getPlan(store.wizardSubscription().packageName) }}</span>
                  <span class="text-xs font-mono font-bold text-brand-600" dir="ltr">
                    \${{ store.wizardSubscription().price.toFixed(2) }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>مدة الاشتراك:</span>
                  <span class="font-semibold text-on-surface">{{ store.wizardSubscription().durationMonths }} شهر</span>
                </div>
                <div class="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>طريقة الدفع:</span>
                  <span class="font-semibold text-on-surface">{{ getPayment(store.wizardSubscription().paymentMethod) }}</span>
                </div>
              </div>

              <!-- Devices Summary Card -->
              <div class="p-3.5 rounded-xl bg-surface-alt border border-border-subtle space-y-2">
                <div class="text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wider">الأجهزة المرتبطة: {{ formatDevices(store.wizardDevices().length) }}</div>
                @for (d of store.wizardDevices(); track d.id) {
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-medium text-on-surface">{{ d.name }}</span>
                    <span class="text-on-surface-variant font-mono text-[11px]" dir="ltr">{{ d.macAddress || 'غير محدد' }}</span>
                  </div>
                }
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  `
})
export class OrderWizard implements OnInit {
  readonly store = inject(OrdersStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  getPayment = getPaymentMethodLabel;
  getPlan = getPlanLabel;
  formatDevices = formatActiveDevicesCount;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.store.initNewOrderWizard({
        phone: params['phone'] || '',
        name: params['name'] || '',
        email: params['email'] || '',
        city: params['city'] || '',
        address: params['address'] || '',
        leadId: params['leadId'] || ''
      });
    });
  }

  onCancel(): void {
    this.router.navigate(['/orders']);
  }
}

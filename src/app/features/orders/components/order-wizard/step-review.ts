import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrdersStore } from '../../store/orders.store';
import {
  getPaymentMethodLabel,
  getPlanLabel,
  formatActiveDevicesCount
} from '../../../../shared/utils/label-mappings';

@Component({
  selector: 'app-step-review',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Section Header -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div class="flex items-center gap-3.5 mb-2">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <span class="material-symbols-outlined text-[22px]">verified</span>
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-900">المرحلة ٤: المراجعة والتأكيد النهائي</h2>
            <p class="text-xs text-slate-500 mt-0.5">يرجى مراجعة كافة بيانات الطلب والاشتراك قبل الإصدار النهائي وتوليد الفاتورة</p>
          </div>
        </div>

        <!-- 3-Column Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <!-- Customer Review Card -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">بيانات المشترك</span>
              <button (click)="store.setWizardStep(1)" class="text-xs text-blue-600 hover:underline">تعديل</button>
            </div>
            <div class="font-bold text-slate-900 text-sm">{{ store.wizardCustomer().fullName }}</div>
            <div class="text-xs text-slate-600 font-mono" dir="ltr">{{ store.wizardCustomer().phone }}</div>
            <div class="text-xs text-slate-600 font-mono" dir="ltr">{{ store.wizardCustomer().email }}</div>
            <div class="text-xs text-slate-500">{{ store.wizardCustomer().address }}</div>
          </div>

          <!-- Subscription Review Card -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">تفاصيل الدفع</span>
              <button (click)="store.setWizardStep(2)" class="text-xs text-blue-600 hover:underline">تعديل</button>
            </div>
            <div class="font-bold text-slate-900 text-sm">{{ getPlan(store.wizardSubscription().packageName) }}</div>
            <div class="text-xs text-slate-600">المدة: {{ store.wizardSubscription().durationMonths }} شهر</div>
            <div class="text-xs text-slate-600">طريقة الدفع: {{ getPayment(store.wizardSubscription().paymentMethod) }}</div>
            <div class="text-sm font-bold text-blue-700 font-mono" dir="ltr">\${{ store.wizardSubscription().price.toFixed(2) }}</div>
          </div>

          <!-- Devices Review Card -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">الأجهزة المرتبطة: {{ formatDevices(store.wizardDevices().length) }}</span>
              <button (click)="store.setWizardStep(3)" class="text-xs text-blue-600 hover:underline">تعديل</button>
            </div>
            @for (dev of store.wizardDevices(); track dev.id) {
              <div class="text-xs border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                <div class="font-semibold text-slate-800">{{ dev.name }}</div>
                <div class="text-slate-500 font-mono" dir="ltr">{{ dev.macAddress || 'لم يحدد MAC' }}</div>
              </div>
            }
          </div>
        </div>

        <!-- Total Breakdown Bar -->
        <div class="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-[24px] text-blue-600">receipt</span>
            <div>
              <span class="text-xs font-semibold text-slate-700">المبلغ الإجمالي المستحق للدفع:</span>
              <div class="text-xs text-slate-500">الاشتراك لمدة {{ store.wizardSubscription().durationMonths }} شهر عبر {{ getPayment(store.wizardSubscription().paymentMethod) }}</div>
            </div>
          </div>
          <div class="text-2xl font-bold font-mono text-blue-700" dir="ltr">
            \${{ store.wizardSubscription().price.toFixed(2) }}
          </div>
        </div>
      </div>

      <!-- Navigation Actions -->
      <div class="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          (click)="onConfirm()"
          class="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
        >
          <span class="material-symbols-outlined text-[20px]">check_circle</span>
          <span>تأكيد وإصدار الطلب رسمياً</span>
        </button>

        <button
          type="button"
          (click)="store.setWizardStep(3)"
          class="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          <span>السابق: الأجهزة المشغلة</span>
        </button>
      </div>
    </div>
  `
})
export class StepReview {
  readonly store = inject(OrdersStore);
  private router = inject(Router);

  getPayment = getPaymentMethodLabel;
  getPlan = getPlanLabel;
  formatDevices = formatActiveDevicesCount;

  onConfirm(): void {
    this.store.submitNewOrder();
  }
}

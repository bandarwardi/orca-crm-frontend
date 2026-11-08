import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersStore } from '../../store/orders.store';

@Component({
  selector: 'app-step-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Subscription & Payment Card -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
        <!-- Header -->
        <div class="flex items-center gap-3.5 pb-4 border-b border-slate-100">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <span class="material-symbols-outlined text-[22px]">payments</span>
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-900">المرحلة ٢: معلومات الدفع</h2>
            <p class="text-xs text-slate-500 mt-0.5">أدخل المدة بالأشهر، المبلغ المالي المتفق عليه، وطريقة الدفع</p>
          </div>
        </div>

        <!-- Manual Inputs Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <!-- 1. Duration (Months) - Manual Input with Quick Pills -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-700">
              <span>المدة (بالأشهر)</span>
              <span class="text-rose-500 mr-1">*</span>
            </label>
            <div class="relative flex items-center">
              <input 
                type="number"
                min="1"
                max="120"
                [ngModel]="store.wizardSubscription().durationMonths"
                (ngModelChange)="onDurationChange($event)"
                class="w-full text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pe-16"
                placeholder="مثال: 12"
              />
              <span class="absolute end-3 text-xs font-semibold text-slate-500 pointer-events-none">
                أشهر
              </span>
            </div>

            <!-- Quick Duration Selector Pills -->
            <div class="flex items-center gap-1.5 flex-wrap pt-1">
              @for (d of commonDurations; track d.months) {
                <button
                  type="button"
                  (click)="onDurationChange(d.months)"
                  class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer"
                  [class.bg-blue-600]="store.wizardSubscription().durationMonths === d.months"
                  [class.text-white]="store.wizardSubscription().durationMonths === d.months"
                  [class.border-blue-600]="store.wizardSubscription().durationMonths === d.months"
                  [class.shadow-xs]="store.wizardSubscription().durationMonths === d.months"
                  [class.bg-slate-50]="store.wizardSubscription().durationMonths !== d.months"
                  [class.text-slate-600]="store.wizardSubscription().durationMonths !== d.months"
                  [class.border-slate-200]="store.wizardSubscription().durationMonths !== d.months"
                  [class.hover:bg-slate-100]="store.wizardSubscription().durationMonths !== d.months"
                >
                  {{ d.label }}
                </button>
              }
            </div>
          </div>

          <!-- 2. Subscription Amount ($ USD) - Manual Input -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-700">
              <span>المبلغ المتفق عليه ($ USD)</span>
              <span class="text-rose-500 mr-1">*</span>
            </label>
            <div class="relative flex items-center">
              <span class="absolute start-3.5 text-slate-400 font-bold font-mono text-base">$</span>
              <input 
                type="number"
                min="0"
                step="0.01"
                [ngModel]="store.wizardSubscription().price"
                (ngModelChange)="onPriceChange($event)"
                class="w-full text-sm font-bold font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 ps-8 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="0.00"
              />
            </div>
            <p class="text-[11px] text-slate-400">أدخل المبلغ الإجمالي الذي سيدفعه العميل</p>
          </div>

          <!-- 3. Expected Payment Method (Full Width in responsive 2-column grid) -->
          <div class="space-y-2 sm:col-span-2">
            <label class="block text-xs font-bold text-slate-700">
              <span>طريقة الدفع المتوقعة</span>
              <span class="text-rose-500 mr-1">*</span>
            </label>
            <select
              [ngModel]="store.wizardSubscription().paymentMethod || 'بطاقة ائتمانية عبر Stripe'"
              (ngModelChange)="onPaymentMethodChange($event)"
              class="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer transition-all"
            >
              <option value="بطاقة ائتمانية عبر Stripe">بطاقة ائتمانية عبر Stripe</option>
              <option value="تحويل عبر Zelle">تحويل عبر Zelle</option>
              <option value="نقداً">نقداً</option>
              <option value="تحويل بنكي">تحويل بنكي</option>
            </select>
            <p class="text-[11px] text-slate-400">وسيلة تحصيل رسوم الاشتراك من العميل</p>
          </div>
        </div>
      </div>

      <!-- Navigation Actions -->
      <div class="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <button
          type="button"
          (click)="store.setWizardStep(3)"
          class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all flex items-center gap-2"
        >
          <span>التالي: الأجهزة المشغلة</span>
          <span class="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_forward</span>
        </button>

        <button
          type="button"
          (click)="store.setWizardStep(1)"
          class="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
        >
          <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          <span>السابق: بيانات العميل</span>
        </button>
      </div>
    </div>
  `
})
export class StepSubscription {
  readonly store = inject(OrdersStore);

  commonDurations = [
    { months: 1, label: '1 شهر' },
    { months: 3, label: '3 أشهر' },
    { months: 6, label: '6 أشهر' },
    { months: 12, label: '12 شهر (سنة)' },
    { months: 24, label: '24 شهر (سنتان)' }
  ];

  onDurationChange(months: any): void {
    const val = parseInt(String(months), 10) || 1;
    this.store.updateWizardSubscription({
      durationMonths: val,
      packageName: `اشتراك ${val} شهر`
    });
  }

  onPriceChange(price: any): void {
    const val = parseFloat(String(price)) || 0;
    this.store.updateWizardSubscription({
      price: val
    });
  }

  onPaymentMethodChange(method: string): void {
    this.store.updateWizardSubscription({
      paymentMethod: method
    });
  }
}

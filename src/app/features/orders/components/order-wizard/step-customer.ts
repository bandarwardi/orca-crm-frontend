import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersStore } from '../../store/orders.store';
import { AppTextInput } from '../../../../shared/components/form-controls/text-input';

@Component({
  selector: 'app-step-customer',
  standalone: true,
  imports: [CommonModule, FormsModule, AppTextInput],
  template: `
    <div class="space-y-6">
      <!-- Section Header -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center gap-3.5 mb-4">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <span class="material-symbols-outlined text-[22px]">person</span>
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-900">المرحلة ١: بيانات العميل والمشترك</h2>
            <p class="text-xs text-slate-500 mt-0.5">أدخل معلومات التواصل والعنوان المعتمد لإنشاء سجل الاشتراك</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <app-text-input
            label="الاسم الكامل"
            placeholder="مثال: يوسف حداد"
            prefixIcon="person"
            [required]="true"
            [ngModel]="store.wizardCustomer().fullName"
            (ngModelChange)="store.updateWizardCustomer({ fullName: $event })"
          ></app-text-input>

          <app-text-input
            label="رقم الهاتف"
            placeholder="مثال: +1 (718) 555-0192"
            prefixIcon="call"
            inputDir="ltr"
            [required]="true"
            [ngModel]="store.wizardCustomer().phone"
            (ngModelChange)="store.updateWizardCustomer({ phone: $event })"
          ></app-text-input>

          <app-text-input
            label="البريد الإلكتروني"
            placeholder="مثال: youssef@example.com"
            prefixIcon="mail"
            inputDir="ltr"
            [ngModel]="store.wizardCustomer().email"
            (ngModelChange)="store.updateWizardCustomer({ email: $event })"
          ></app-text-input>

          <app-text-input
            label="المدينة والولاية"
            placeholder="مثال: Brooklyn, NY"
            prefixIcon="location_city"
            [ngModel]="store.wizardCustomer().city"
            (ngModelChange)="store.updateWizardCustomer({ city: $event })"
          ></app-text-input>

          <div class="sm:col-span-2">
            <app-text-input
              label="العنوان السكني / الشارع"
              placeholder="مثال: 8612 5th Ave, Brooklyn, NY 11209"
              prefixIcon="home"
              [ngModel]="store.wizardCustomer().address"
              (ngModelChange)="store.updateWizardCustomer({ address: $event })"
            ></app-text-input>
          </div>
        </div>
      </div>

      <!-- Navigation Actions -->
      <div class="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <button
          type="button"
          (click)="store.setWizardStep(2)"
          class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all flex items-center gap-2"
        >
          <span>التالي: بيانات الدفع</span>
          <span class="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_forward</span>
        </button>

        <span class="text-xs text-slate-400">الخطوة ١ من ٤</span>
      </div>
    </div>
  `
})
export class StepCustomer {
  readonly store = inject(OrdersStore);
}

import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-wizard-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav aria-label="مراحل معالج الطلب" class="bg-surface rounded-2xl border border-border-subtle p-2.5 sm:p-4 shadow-sm">
      <ol class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs font-medium">
        <!-- Step 1: Customer Info -->
        <li
          (click)="stepClick.emit(1)"
          [class]="getStepClass(1)"
          class="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl cursor-pointer transition-all"
        >
          <span [class]="getBadgeClass(1)" class="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] sm:text-xs">
            @if (currentStep() > 1) {
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path>
              </svg>
            } @else {
              ١
            }
          </span>
          <div class="min-w-0">
            <div [class]="getSubtitleClass(1)" class="hidden sm:block text-[11px] font-semibold">
              {{ currentStep() > 1 ? 'المرحلة ١ (مكتملة)' : currentStep() === 1 ? 'المرحلة الحالية' : 'المرحلة ١' }}
            </div>
            <div [class]="getTitleClass(1)" class="font-bold text-[11px] sm:text-xs truncate">بيانات العميل</div>
          </div>
        </li>

        <!-- Step 2: Subscription Details -->
        <li
          (click)="stepClick.emit(2)"
          [class]="getStepClass(2)"
          class="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl cursor-pointer transition-all"
        >
          <span [class]="getBadgeClass(2)" class="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] sm:text-xs">
            @if (currentStep() > 2) {
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path>
              </svg>
            } @else {
              ٢
            }
          </span>
          <div class="min-w-0">
            <div [class]="getSubtitleClass(2)" class="hidden sm:block text-[11px] font-semibold">
              {{ currentStep() > 2 ? 'المرحلة ٢ (مكتملة)' : currentStep() === 2 ? 'المرحلة الحالية' : 'المرحلة ٢' }}
            </div>
            <div [class]="getTitleClass(2)" class="font-bold text-[11px] sm:text-xs truncate">بيانات الدفع</div>
          </div>
        </li>

        <!-- Step 3: Devices -->
        <li
          (click)="stepClick.emit(3)"
          [class]="getStepClass(3)"
          class="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl cursor-pointer transition-all"
        >
          <span [class]="getBadgeClass(3)" class="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] sm:text-xs">
            @if (currentStep() > 3) {
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path>
              </svg>
            } @else {
              ٣
            }
          </span>
          <div class="min-w-0">
            <div [class]="getSubtitleClass(3)" class="hidden sm:block text-[11px] font-semibold">
              {{ currentStep() > 3 ? 'المرحلة ٣ (مكتملة)' : currentStep() === 3 ? 'المرحلة الحالية' : 'المرحلة ٣' }}
            </div>
            <div [class]="getTitleClass(3)" class="font-bold text-[11px] sm:text-xs truncate">الأجهزة المشغلة</div>
          </div>
        </li>

        <!-- Step 4: Review & Confirm -->
        <li
          (click)="stepClick.emit(4)"
          [class]="getStepClass(4)"
          class="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl cursor-pointer transition-all"
        >
          <span [class]="getBadgeClass(4)" class="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] sm:text-xs">
            ٤
          </span>
          <div class="min-w-0">
            <div [class]="getSubtitleClass(4)" class="hidden sm:block text-[11px] font-semibold">
              {{ currentStep() === 4 ? 'المرحلة الحالية' : 'المرحلة القادمة' }}
            </div>
            <div [class]="getTitleClass(4)" class="font-semibold text-[11px] sm:text-xs truncate">المراجعة والتأكيد</div>
          </div>
        </li>
      </ol>
    </nav>
  `
})
export class OrderWizardStepper {
  currentStep = input<1 | 2 | 3 | 4>(3);
  stepClick = output<1 | 2 | 3 | 4>();

  getStepClass(step: number): string {
    const cur = this.currentStep();
    if (cur === step) {
      return 'bg-brand-50 border border-brand-500/30 shadow-xs ring-1 ring-brand-500/30 dark:bg-brand-500/20';
    } else if (cur > step) {
      return 'bg-[#ECFDF5] border border-emerald-200/60 hover:bg-emerald-50 dark:bg-emerald-950/20';
    } else {
      return 'bg-surface border border-border-subtle hover:bg-surface-container';
    }
  }

  getBadgeClass(step: number): string {
    const cur = this.currentStep();
    if (cur === step) {
      return 'bg-brand-600 text-white shadow-xs';
    } else if (cur > step) {
      return 'bg-emerald-100 text-[#059669] dark:bg-emerald-900/40 dark:text-emerald-300';
    } else {
      return 'bg-surface-container text-on-surface-variant';
    }
  }

  getSubtitleClass(step: number): string {
    const cur = this.currentStep();
    if (cur === step) {
      return 'text-brand-600 dark:text-brand-500';
    } else if (cur > step) {
      return 'text-[#059669]';
    } else {
      return 'text-on-surface-variant/70';
    }
  }

  getTitleClass(step: number): string {
    const cur = this.currentStep();
    if (cur === step) {
      return 'text-brand-900 dark:text-white';
    } else if (cur > step) {
      return 'text-on-surface';
    } else {
      return 'text-on-surface-variant';
    }
  }
}

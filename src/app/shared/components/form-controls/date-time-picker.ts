import { Component, forwardRef, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { formatArabicDateTime } from '../../utils/date-format';

/**
 * AppDateTimePicker Component
 * A modern date & time picker with quick-select pills and CDK overlay.
 * 
 * Usage:
 * <app-date-time-picker 
 *   label="موعد المتابعة القادمة" 
 *   formControlName="nextFollowUp">
 * </app-date-time-picker>
 */
@Component({
  selector: 'app-date-time-picker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OverlayModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppDateTimePicker),
      multi: true
    }
  ],
  template: `
    <div class="flex flex-col gap-1.5 w-full">
      @if (label()) {
        <label class="font-label-sm text-[13px] text-on-surface font-semibold flex items-center justify-between">
          <span>{{ label() }}</span>
          @if (required()) {
            <span class="text-error text-[12px]">*</span>
          }
        </label>
      }

      <!-- Trigger Button with CDK Overlay Origin -->
      <button 
        type="button"
        cdkOverlayOrigin
        #trigger="cdkOverlayOrigin"
        class="w-full h-10 px-3 rounded-lg bg-surface-container-lowest border transition-all duration-200 flex items-center justify-between text-right"
        [class.border-outline-variant\/60]="!isOpen()"
        [class.border-primary]="isOpen()"
        [class.ring-2]="isOpen()"
        [class.ring-primary\/20]="isOpen()"
        [class.opacity-60]="disabled()"
        [class.cursor-not-allowed]="disabled()"
        [disabled]="disabled()"
        (click)="toggleOpen()"
      >
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <span class="material-symbols-outlined text-on-surface-variant text-[18px] flex-shrink-0"
                [class.text-primary]="isOpen()">
            event
          </span>
          <span class="font-body-md text-[13px] text-on-surface truncate">
            {{ displayLabel() }}
          </span>
        </div>

        <span class="material-symbols-outlined text-on-surface-variant text-[18px] flex-shrink-0 ms-2">
          schedule
        </span>
      </button>

      <!-- Quick Preset Pills Below Trigger -->
      <div class="flex items-center gap-1.5 flex-wrap pt-0.5">
        <button 
          type="button" 
          class="px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-semibold transition-all border"
          [class.bg-primary]="isPresetActive('today')"
          [class.text-white]="isPresetActive('today')"
          [class.border-primary]="isPresetActive('today')"
          [class.shadow-sm]="isPresetActive('today')"
          [class.bg-surface-container-low]="!isPresetActive('today')"
          [class.text-on-surface-variant]="!isPresetActive('today')"
          [class.border-outline-variant\/30]="!isPresetActive('today')"
          [class.hover:bg-surface-container-high]="!isPresetActive('today')"
          (click)="setPreset('today')">
          اليوم
        </button>
        <button 
          type="button" 
          class="px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-semibold transition-all border"
          [class.bg-primary]="isPresetActive('tomorrow')"
          [class.text-white]="isPresetActive('tomorrow')"
          [class.border-primary]="isPresetActive('tomorrow')"
          [class.shadow-sm]="isPresetActive('tomorrow')"
          [class.bg-surface-container-low]="!isPresetActive('tomorrow')"
          [class.text-on-surface-variant]="!isPresetActive('tomorrow')"
          [class.border-outline-variant\/30]="!isPresetActive('tomorrow')"
          [class.hover:bg-surface-container-high]="!isPresetActive('tomorrow')"
          (click)="setPreset('tomorrow')">
          غداً
        </button>
        <button 
          type="button" 
          class="px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-semibold transition-all border"
          [class.bg-primary]="isPresetActive('2days')"
          [class.text-white]="isPresetActive('2days')"
          [class.border-primary]="isPresetActive('2days')"
          [class.shadow-sm]="isPresetActive('2days')"
          [class.bg-surface-container-low]="!isPresetActive('2days')"
          [class.text-on-surface-variant]="!isPresetActive('2days')"
          [class.border-outline-variant\/30]="!isPresetActive('2days')"
          [class.hover:bg-surface-container-high]="!isPresetActive('2days')"
          (click)="setPreset('2days')">
          بعد يومين
        </button>
        <button 
          type="button" 
          class="px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-semibold transition-all border"
          [class.bg-primary]="isPresetActive('week')"
          [class.text-white]="isPresetActive('week')"
          [class.border-primary]="isPresetActive('week')"
          [class.shadow-sm]="isPresetActive('week')"
          [class.bg-surface-container-low]="!isPresetActive('week')"
          [class.text-on-surface-variant]="!isPresetActive('week')"
          [class.border-outline-variant\/30]="!isPresetActive('week')"
          [class.hover:bg-surface-container-high]="!isPresetActive('week')"
          (click)="setPreset('week')">
          الأسبوع القادم
        </button>
      </div>

      <!-- CDK Connected Overlay for Custom Date & Time Picker -->
      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="trigger"
        [cdkConnectedOverlayOpen]="isOpen()"
        [cdkConnectedOverlayHasBackdrop]="true"
        cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
        (backdropClick)="close()"
      >
        <div class="bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 p-3 my-1 w-72 z-50 animate-in fade-in zoom-in-95 duration-100"
             dir="rtl">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-surface-container">
            <span class="font-label-sm text-[12px] font-semibold text-on-surface">تحديد التاريخ والوقت بدقة</span>
            <button type="button" class="text-on-surface-variant hover:text-on-surface" (click)="close()">
              <span class="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="font-label-sm text-[11px] text-on-surface-variant block mb-1">التاريخ والوقت</label>
              <input 
                type="datetime-local"
                [value]="value()"
                class="w-full h-9 px-2.5 rounded-lg bg-surface-container-low border border-outline-variant/50 font-code-sm text-[12px] text-on-surface focus:outline-none focus:border-primary transition-all"
                (change)="onDateTimeChange($event)"
              />
            </div>

            <div class="flex items-center justify-end gap-2 pt-1 border-t border-surface-container">
              <button 
                type="button" 
                class="px-2.5 py-1 rounded-md text-on-surface-variant hover:bg-surface-container font-label-sm text-[11px]"
                (click)="close()">
                إغلاق
              </button>
              <button 
                type="button" 
                class="px-3 py-1 rounded-md bg-primary text-on-primary font-label-sm text-[11px] font-semibold"
                (click)="close()">
                تأكيد
              </button>
            </div>
          </div>
        </div>
      </ng-template>
    </div>
  `
})
export class AppDateTimePicker implements ControlValueAccessor {
  label = input<string>();
  required = input<boolean>(false);
  disabled = input<boolean>(false);

  value = signal<string>('');
  isOpen = signal<boolean>(false);

  activePreset = computed(() => {
    const val = this.value();
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return '';
      const today = new Date();
      
      const isSameDay = (d1: Date, d2: Date) => 
        d1.getFullYear() === d2.getFullYear() && 
        d1.getMonth() === d2.getMonth() && 
        d1.getDate() === d2.getDate();

      if (isSameDay(d, today)) return 'today';

      const tom = new Date(today);
      tom.setDate(tom.getDate() + 1);
      if (isSameDay(d, tom)) return 'tomorrow';

      const in2d = new Date(today);
      in2d.setDate(in2d.getDate() + 2);
      if (isSameDay(d, in2d)) return '2days';

      const in7d = new Date(today);
      in7d.setDate(in7d.getDate() + 7);
      if (isSameDay(d, in7d)) return 'week';

      return '';
    } catch {
      return '';
    }
  });

  displayLabel = computed(() => {
    const val = this.value();
    if (!val) return 'اختر موعد المتابعة...';
    return formatArabicDateTime(val);
  });

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: any): void {
    this.value.set(val != null ? String(val) : '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handled
  }

  toggleOpen(): void {
    if (this.disabled()) return;
    this.isOpen.update(v => !v);
  }

  close(): void {
    this.isOpen.set(false);
    this.onTouched();
  }

  onDateTimeChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  setPreset(preset: 'today' | 'tomorrow' | '2days' | 'week'): void {
    const d = new Date();
    d.setHours(16, 0, 0, 0); // Default follow-up time 4:00 PM

    if (preset === 'tomorrow') d.setDate(d.getDate() + 1);
    else if (preset === '2days') d.setDate(d.getDate() + 2);
    else if (preset === 'week') d.setDate(d.getDate() + 7);

    // Format YYYY-MM-DDTHH:mm
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const isoString = `${year}-${month}-${day}T${hours}:${minutes}`;

    this.value.set(isoString);
    this.onChange(isoString);
  }

  isPresetActive(preset: string): boolean {
    return this.activePreset() === preset;
  }
}

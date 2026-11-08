import { Component, forwardRef, input, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { formatArabicDateTime, parseToIsoDateTime } from '../../utils/date-format';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const ARABIC_WEEKDAYS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

@Component({
  selector: 'app-custom-date-picker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OverlayModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDatePicker),
      multi: true
    }
  ],
  template: `
    <div class="flex flex-col gap-1.5 w-full">
      @if (label()) {
        <label class="font-label-sm text-[13px] text-on-surface font-semibold flex items-center gap-1.5 text-right justify-start">
          <span>{{ label() }}</span>
          @if (required()) {
            <span class="text-error text-[12px] leading-none">*</span>
          }
        </label>
      }

      <!-- Single clean trigger button with ONE calendar icon -->
      <button 
        type="button"
        cdkOverlayOrigin
        #trigger="cdkOverlayOrigin"
        class="w-full h-10 px-3 rounded-lg bg-surface border transition-all duration-200 flex items-center gap-2.5 text-right select-none"
        [class.border-error]="error()"
        [class.border-border-subtle]="!error() && !isOpen()"
        [class.border-brand-500]="!error() && isOpen()"
        [class.ring-2]="isOpen()"
        [class.ring-brand-500\/20]="!error() && isOpen()"
        [class.ring-rose-500\/20]="error() && isOpen()"
        [class.opacity-60]="disabled()"
        [class.cursor-not-allowed]="disabled()"
        [disabled]="disabled()"
        (click)="toggleOpen()"
      >
        <!-- Single Calendar Icon Only -->
        <span class="material-symbols-outlined text-on-surface-variant text-[18px] flex-shrink-0 transition-colors"
              [class.text-brand-600]="isOpen()">
          calendar_today
        </span>

        <!-- Display Value -->
        <span class="font-body-md text-[13px] truncate flex-1 text-start"
              [class.text-on-surface]="!!value()"
              [class.text-on-surface-variant\/60]="!value()">
          {{ displayFormattedDate() || placeholder() }}
        </span>
      </button>

      <!-- Custom Date & Time Picker Overlay (Directly Opened, No Native Browser Controls) -->
      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="trigger"
        [cdkConnectedOverlayOpen]="isOpen()"
        [cdkConnectedOverlayHasBackdrop]="true"
        cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
        (backdropClick)="close()"
      >
        <div class="bg-surface rounded-2xl shadow-2xl border border-border-subtle p-4 my-1.5 w-[310px] sm:w-[330px] z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-3.5 select-none"
             dir="rtl"
             (click)="$event.stopPropagation()">
          
          <!-- Month & Year Navigation Header -->
          <div class="flex items-center justify-between px-1">
            <!-- Next Month (Left in RTL) -->
            <button 
              type="button" 
              (click)="navigateMonth(1)"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-alt transition-colors"
              title="الشهر القادم"
              aria-label="الشهر القادم">
              <span class="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>

            <!-- Current Month & Year Display -->
            <div class="flex items-center gap-1.5 font-headline-sm text-[14px] font-bold text-on-surface">
              <span>{{ currentMonthName() }}</span>
              <span>{{ currentYear() }}</span>
            </div>

            <!-- Previous Month (Right in RTL) -->
            <button 
              type="button" 
              (click)="navigateMonth(-1)"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-alt transition-colors"
              title="الشهر السابق"
              aria-label="الشهر السابق">
              <span class="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>

          <!-- Weekdays Header Row -->
          <div class="grid grid-cols-7 gap-1 text-center font-label-sm text-[11px] font-semibold text-on-surface-variant/70 border-b border-border-subtle pb-2">
            @for (dayName of weekdays; track dayName) {
              <div>{{ dayName }}</div>
            }
          </div>

          <!-- Days Grid (7 columns) -->
          <div class="grid grid-cols-7 gap-1 text-center font-body-md text-[12px]">
            @for (day of calendarDays(); track day.date.toISOString()) {
              <button 
                type="button"
                [disabled]="!day.isCurrentMonth"
                (click)="selectDay(day.date)"
                class="h-8 w-8 mx-auto rounded-lg flex items-center justify-center transition-all duration-150 relative cursor-pointer"
                [class.text-on-surface-variant\/40]="!day.isCurrentMonth"
                [class.cursor-not-allowed]="!day.isCurrentMonth"
                [class.hover:bg-brand-50]="day.isCurrentMonth && !day.isSelected"
                [class.hover:text-brand-600]="day.isCurrentMonth && !day.isSelected"
                [class.text-on-surface]="day.isCurrentMonth && !day.isSelected"
                [class.bg-brand-600]="day.isSelected"
                [class.text-white]="day.isSelected"
                [class.font-bold]="day.isSelected"
                [class.shadow-sm]="day.isSelected"
                [class.ring-1]="day.isToday && !day.isSelected"
                [class.ring-brand-500]="day.isToday && !day.isSelected"
              >
                {{ day.dayNumber }}
              </button>
            }
          </div>

          <!-- Custom Time Picker Section (Clean Dial/Pills, Not Native Browser Input) -->
          <div class="pt-3 border-t border-border-subtle flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="font-label-sm text-[12px] font-semibold text-on-surface flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-brand-600">schedule</span>
                <span>تحديد الوقت</span>
              </span>
              
              <!-- Quick "الآن" (Now) helper -->
              <button 
                type="button" 
                (click)="setToNow()"
                class="font-label-sm text-[11px] text-brand-600 hover:text-brand-700 hover:underline font-medium">
                الآن
              </button>
            </div>

            <!-- Time Controls Row: Hours : Minutes | AM/PM Toggle -->
            <div class="flex items-center justify-between gap-2 bg-surface-alt p-2 rounded-xl border border-border-subtle" dir="ltr">
              <!-- Period Toggle (AM / PM in Arabic) -->
              <div class="flex items-center bg-surface rounded-lg p-0.5 border border-border-subtle flex-shrink-0">
                <button 
                  type="button" 
                  (click)="setPeriod('ص')"
                  class="px-2.5 py-1 rounded-md text-[11px] font-bold transition-all"
                  [class.bg-brand-600]="selectedPeriod() === 'ص'"
                  [class.text-white]="selectedPeriod() === 'ص'"
                  [class.text-on-surface-variant]="selectedPeriod() !== 'ص'">
                  ص
                </button>
                <button 
                  type="button" 
                  (click)="setPeriod('م')"
                  class="px-2.5 py-1 rounded-md text-[11px] font-bold transition-all"
                  [class.bg-brand-600]="selectedPeriod() === 'م'"
                  [class.text-white]="selectedPeriod() === 'م'"
                  [class.text-on-surface-variant]="selectedPeriod() !== 'م'">
                  م
                </button>
              </div>

              <!-- Time Steppers / Selectors -->
              <div class="flex items-center gap-1.5 flex-1 justify-center">
                <!-- Hours Stepper (1 - 12) -->
                <div class="flex items-center gap-1">
                  <button 
                    type="button" 
                    (click)="adjustHour(-1)" 
                    class="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface transition-colors"
                    title="ساعة للخلف">
                    <span class="material-symbols-outlined text-[15px]">remove</span>
                  </button>
                  <span class="w-8 text-center font-headline-sm text-[13px] font-bold text-on-surface font-code-sm">
                    {{ selectedHourFormatted() }}
                  </span>
                  <button 
                    type="button" 
                    (click)="adjustHour(1)" 
                    class="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface transition-colors"
                    title="ساعة للأمام">
                    <span class="material-symbols-outlined text-[15px]">add</span>
                  </button>
                </div>

                <span class="font-bold text-on-surface-variant">:</span>

                <!-- Minutes Stepper (00, 15, 30, 45 or +/- 5 mins) -->
                <div class="flex items-center gap-1">
                  <button 
                    type="button" 
                    (click)="adjustMinute(-15)" 
                    class="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface transition-colors"
                    title="15 دقيقة للخلف">
                    <span class="material-symbols-outlined text-[15px]">remove</span>
                  </button>
                  <span class="w-8 text-center font-headline-sm text-[13px] font-bold text-on-surface font-code-sm">
                    {{ selectedMinuteFormatted() }}
                  </span>
                  <button 
                    type="button" 
                    (click)="adjustMinute(15)" 
                    class="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface transition-colors"
                    title="15 دقيقة للأمام">
                    <span class="material-symbols-outlined text-[15px]">add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="pt-2 border-t border-border-subtle flex items-center justify-between gap-2">
            <button 
              type="button" 
              (click)="clear()"
              class="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-alt font-label-sm text-[12px] transition-colors">
              مسح
            </button>

            <button 
              type="button" 
              (click)="confirm()"
              class="px-4 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 font-label-sm text-[12px] font-semibold transition-colors shadow-sm">
              تأكيد الموعد
            </button>
          </div>

        </div>
      </ng-template>

      <!-- Helper / Error Message -->
      @if (error()) {
        <span class="font-body-sm text-[12px] text-accent-rose flex items-center gap-1 mt-0.5">
          <span class="material-symbols-outlined text-[14px]">error</span>
          <span>{{ error() }}</span>
        </span>
      }
    </div>
  `
})
export class CustomDatePicker implements ControlValueAccessor {
  weekdays = ARABIC_WEEKDAYS;

  label = input<string>();
  placeholder = input<string>('حدد موعد المتابعة...');
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  error = input<string>();

  value = signal<string>('');
  isOpen = signal<boolean>(false);

  // Active view date in calendar
  viewDate = signal<Date>(new Date());

  // Intermediate picker state
  selectedYear = signal<number>(new Date().getFullYear());
  selectedMonth = signal<number>(new Date().getMonth());
  selectedDay = signal<number>(new Date().getDate());
  selectedHour = signal<number>(17); // 5 PM default
  selectedMinute = signal<number>(0);
  selectedPeriod = signal<'ص' | 'م'>('م');

  currentYear = computed(() => this.viewDate().getFullYear());
  currentMonthName = computed(() => ARABIC_MONTHS[this.viewDate().getMonth()]);

  selectedHourFormatted = computed(() => {
    return String(this.selectedHour()).padStart(2, '0');
  });

  selectedMinuteFormatted = computed(() => {
    return String(this.selectedMinute()).padStart(2, '0');
  });

  displayFormattedDate = computed(() => {
    const val = this.value();
    if (!val) return '';
    return formatArabicDateTime(val);
  });

  calendarDays = computed<CalendarDay[]>(() => {
    const view = this.viewDate();
    const year = view.getFullYear();
    const month = view.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const today = new Date();
    const days: CalendarDay[] = [];

    // Trailing days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({
        date: d,
        dayNumber: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    // Days in current month
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      const isToday = 
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();

      const isSelected = 
        d.getFullYear() === this.selectedYear() &&
        d.getMonth() === this.selectedMonth() &&
        d.getDate() === this.selectedDay();

      days.push({
        date: d,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday,
        isSelected
      });
    }

    // Leading days from next month to fill grid to full weeks (up to 35 or 42 cells)
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remainingSlots = totalSlots - days.length;
    for (let dayNum = 1; dayNum <= remainingSlots; dayNum++) {
      const d = new Date(year, month + 1, dayNum);
      days.push({
        date: d,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    return days;
  });

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const val = this.value();
      if (val) {
        this.parseValueToState(val);
      }
    });
  }

  writeValue(val: any): void {
    const str = val != null ? String(val) : '';
    this.value.set(str);
    if (str) {
      this.parseValueToState(str);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Handled
  }

  toggleOpen(): void {
    if (this.disabled()) return;
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.onTouched();
      const val = this.value();
      if (val) {
        this.parseValueToState(val);
      } else {
        this.setToNow();
      }
    }
  }

  close(): void {
    this.isOpen.set(false);
  }

  navigateMonth(delta: number): void {
    const current = this.viewDate();
    const next = new Date(current.getFullYear(), current.getMonth() + delta, 1);
    this.viewDate.set(next);
  }

  selectDay(d: Date): void {
    this.selectedYear.set(d.getFullYear());
    this.selectedMonth.set(d.getMonth());
    this.selectedDay.set(d.getDate());
    this.viewDate.set(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  setPeriod(p: 'ص' | 'م'): void {
    this.selectedPeriod.set(p);
  }

  adjustHour(delta: number): void {
    let h = this.selectedHour() + delta;
    if (h > 12) h = 1;
    if (h < 1) h = 12;
    this.selectedHour.set(h);
  }

  adjustMinute(delta: number): void {
    let m = this.selectedMinute() + delta;
    if (m >= 60) {
      m = 0;
      this.adjustHour(1);
    } else if (m < 0) {
      m = 45;
      this.adjustHour(-1);
    }
    this.selectedMinute.set(m);
  }

  setToNow(): void {
    const now = new Date();
    this.selectedYear.set(now.getFullYear());
    this.selectedMonth.set(now.getMonth());
    this.selectedDay.set(now.getDate());
    this.viewDate.set(new Date(now.getFullYear(), now.getMonth(), 1));

    const rawH = now.getHours();
    this.selectedPeriod.set(rawH >= 12 ? 'م' : 'ص');
    this.selectedHour.set(rawH % 12 || 12);
    this.selectedMinute.set(Math.floor(now.getMinutes() / 5) * 5);
  }

  confirm(): void {
    let h24 = this.selectedHour();
    if (this.selectedPeriod() === 'م' && h24 < 12) {
      h24 += 12;
    } else if (this.selectedPeriod() === 'ص' && h24 === 12) {
      h24 = 0;
    }

    const y = this.selectedYear();
    const m = String(this.selectedMonth() + 1).padStart(2, '0');
    const d = String(this.selectedDay()).padStart(2, '0');
    const hh = String(h24).padStart(2, '0');
    const mm = String(this.selectedMinute()).padStart(2, '0');

    const isoStr = `${y}-${m}-${d}T${hh}:${mm}`;
    this.value.set(isoStr);
    this.onChange(isoStr);
    this.close();
  }

  clear(): void {
    this.value.set('');
    this.onChange('');
    this.close();
  }

  private parseValueToState(val: string): void {
    try {
      const iso = parseToIsoDateTime(val);
      if (!iso) return;
      const d = new Date(iso);
      if (isNaN(d.getTime())) return;

      this.selectedYear.set(d.getFullYear());
      this.selectedMonth.set(d.getMonth());
      this.selectedDay.set(d.getDate());
      this.viewDate.set(new Date(d.getFullYear(), d.getMonth(), 1));

      const rawH = d.getHours();
      this.selectedPeriod.set(rawH >= 12 ? 'م' : 'ص');
      this.selectedHour.set(rawH % 12 || 12);
      this.selectedMinute.set(d.getMinutes());
    } catch {
      // Fallback
    }
  }
}

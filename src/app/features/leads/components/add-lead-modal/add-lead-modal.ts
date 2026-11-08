import { Component, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Lead, LeadsStore, LeadStage } from '../../state/leads.store';
import { AppTextInput, AppSelect, CustomDatePicker, AppTextarea, SelectOption } from '../../../../shared/components/form-controls';
import { LEAD_STATUS_CONFIG } from '../../../../shared/config/status-config';
import { NORTH_AMERICA_REGIONS } from '../../../../shared/constants/regions.constant';

@Component({
  selector: 'app-add-lead-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppTextInput, AppSelect, CustomDatePicker, AppTextarea],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
        <!-- Full-screen Backdrop (Clickable) -->
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
             (click)="close.emit()"></div>
        
        <!-- Modal Card Box -->
        <div class="relative z-10 w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-outline-variant/40 my-auto"
             (click)="$event.stopPropagation()">
          
          <!-- Top Modal Header -->
          <div class="px-space-lg py-space-md bg-surface-container-low flex items-start justify-between gap-space-sm border-b border-outline-variant/40 flex-shrink-0">
            <div class="flex items-start gap-space-sm">
              <div class="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                <span class="material-symbols-outlined text-[22px]">person_add</span>
              </div>
              <div class="flex flex-col">
                <h2 class="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">إضافة عميل محتمل جديد</h2>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">أدخل البيانات الأساسية للعميل المحتمل وموعد المتابعة والملاحظات الأولية</p>
              </div>
            </div>
            <button 
              aria-label="إغلاق النافذة" 
              class="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" 
              (click)="close.emit()" 
              type="button">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Form Body Scrollable Area -->
          <form [formGroup]="form" class="flex-1 overflow-y-auto p-space-lg space-y-4 custom-scrollbar" (ngSubmit)="onSubmit()">
            
            <!-- Grid Row 1: Name & Phone Number -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <!-- 1. Full Customer Name -->
              <div class="flex flex-col gap-1.5 w-full">
                <label class="font-label-sm text-[13px] text-on-surface font-semibold flex items-center justify-between">
                  <span>اسم العميل الثلاثي / الكامل</span>
                  <span class="text-error text-[12px]">*</span>
                </label>
                <div 
                  class="relative flex items-center rounded-lg bg-surface border transition-all duration-200"
                  [class.border-error]="form.get('fullname')?.invalid && form.get('fullname')?.touched"
                  [class.border-border-subtle]="!(form.get('fullname')?.invalid && form.get('fullname')?.touched)">
                  <input 
                    type="text"
                    formControlName="fullname"
                    placeholder="مثال: مروان القاضي"
                    class="w-full h-10 px-3.5 rounded-lg bg-transparent font-body-md text-[13px] text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none transition-all" />
                </div>
                @if (form.get('fullname')?.invalid && form.get('fullname')?.touched) {
                  <span class="font-label-sm text-[11px] text-error flex items-center gap-1 mt-0.5">
                    <span class="material-symbols-outlined text-[13px]">error</span>
                    <span>يرجى إدخال اسم العميل</span>
                  </span>
                }
              </div>

              <!-- 2. Phone Number with Country Code -->
              <app-text-input 
                label="رقم الهاتف مع رمز الدولة" 
                placeholder="+1 (313) 555-0199" 
                prefixIcon="call" 
                inputDir="ltr"
                formControlName="phone"
                [required]="true"
                hint="واتساب مدعوم"
                [error]="form.get('phone')?.invalid && form.get('phone')?.touched ? 'يرجى إدخال رقم الهاتف' : undefined">
              </app-text-input>
            </div>

            <!-- Grid Row 2: Region/State & Stage -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <!-- 3. State / City (Searchable with US & Canada abbreviations like SD, MI) -->
              <app-select 
                label="الولاية / المدينة" 
                placeholder="اختر أو ابحث عن الولاية..." 
                prefixIcon="location_on" 
                [searchable]="true"
                searchPlaceholder="ابحث بالرمز أو الاسم (مثال: SD, CA, ميشيغان)..."
                [options]="regionOptions"
                formControlName="region"
                [required]="true"
                [error]="form.get('region')?.invalid && form.get('region')?.touched ? 'يرجى اختيار الولاية' : undefined">
              </app-select>

              <!-- 4. Lead Stage (Single Icon, No Redundant Badge) -->
              <app-select 
                label="مرحلة العميل" 
                placeholder="اختر المرحلة..." 
                prefixIcon="flag" 
                [options]="stageOptions"
                formControlName="stage"
                [required]="true">
              </app-select>
            </div>

            <!-- Grid Row 3: Assigned Representative & Next Follow-up -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-space-md pb-3">
              <!-- 5. Assigned Representative (Single Icon) -->
              <app-select 
                label="الموظف المسؤول" 
                placeholder="اختر الموظف المسؤول..." 
                prefixIcon="person" 
                [options]="assigneeOptions"
                formControlName="assignee"
                [required]="true">
              </app-select>

              <!-- 6. Next Follow-up Schedule (Opens Custom DatePicker Directly) -->
              <app-custom-date-picker 
                label="موعد المتابعة القادمة"
                placeholder="حدد موعد المتابعة..."
                formControlName="followup_datetime">
              </app-custom-date-picker>
            </div>

            <!-- Row 4: Initial Notes -->
            <app-textarea 
              label="الملاحظات الأولية" 
              placeholder="أدخل ملخص التواصل الأول، نوع الجهاز المستفسر عنه (مثل MAG، Android TV، أو Smart TV)، وسرعة الإنترنت..." 
              formControlName="notes" 
              [rows]="3">
            </app-textarea>
          </form>

          <!-- Modal Footer (Action Buttons Only - Micro-Footer Removed) -->
          <div class="px-space-lg py-space-sm bg-surface-container-low flex items-center justify-between gap-space-sm border-t border-outline-variant/40">
            <button 
              class="h-10 px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center font-medium" 
              type="button"
              (click)="close.emit()">
              إلغاء
            </button>
            
            <button 
              class="h-10 px-space-lg rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all shadow-sm flex items-center gap-2 font-semibold active:scale-95 disabled:opacity-70" 
              type="button"
              [disabled]="isSubmitting()"
              (click)="onSubmit()">
              @if (isSubmitting()) {
                <span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                <span>جاري الحفظ...</span>
              } @else if (isSuccess()) {
                <span class="material-symbols-outlined text-[18px]">done_all</span>
                <span>تمت الإضافة بنجاح</span>
              } @else {
                <span class="material-symbols-outlined text-[18px]">check_circle</span>
                <span>حفظ العميل المحتمل</span>
              }
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class AddLeadModal {
  isOpen = input<boolean>(false);
  close = output<void>();

  private fb = inject(FormBuilder);
  private store = inject(LeadsStore);

  isSubmitting = signal<boolean>(false);
  isSuccess = signal<boolean>(false);

  regionOptions: SelectOption[] = NORTH_AMERICA_REGIONS;

  stageOptions: SelectOption[] = [
    { value: 'interested', label: LEAD_STATUS_CONFIG.interested.label },
    { value: 'negotiation', label: LEAD_STATUS_CONFIG.negotiation.label }
  ];

  assigneeOptions: SelectOption[] = [
    { value: 'طارق المنصور', label: 'طارق المنصور' },
    { value: 'سارة مراد', label: 'سارة مراد' },
    { value: 'رامي منصور', label: 'رامي منصور' },
    { value: 'ليلى كريم', label: 'ليلى كريم' },
    { value: 'أحمد خليل', label: 'أحمد خليل' }
  ];

  form = this.fb.group({
    fullname: ['', Validators.required],
    phone: ['', Validators.required],
    region: ['', Validators.required],
    stage: ['interested', Validators.required],
    assignee: ['طارق المنصور', Validators.required],
    followup_datetime: [this.getDefaultDateTimeString('tomorrow')],
    notes: ['']
  });

  private getDefaultDateTimeString(type: 'today' | 'tomorrow' | 'next_week'): string {
    const now = new Date();
    if (type === 'tomorrow') {
      now.setDate(now.getDate() + 1);
    } else if (type === 'next_week') {
      now.setDate(now.getDate() + 7);
    }
    now.setHours(17, 30, 0, 0);

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const val = this.form.value;
    const cleanDigits = (val.phone || '').replace(/\D/g, '');

    const dto = {
      customer: {
        name: val.fullname || '',
        phone: cleanDigits,
        city: (val.region || '').split(' - ')[0] || 'Unknown',
        state: (val.region || '').split(' - ')[1] || 'Unknown'
      },
      stage: val.stage || 'interested',
      notes: val.notes ? [{ content: val.notes }] : [],
      follow_up_at: val.followup_datetime || new Date().toISOString()
    };

    this.store.createLead(dto, () => {
      this.isSubmitting.set(false);
      this.isSuccess.set(true);

      setTimeout(() => {
        this.isSuccess.set(false);
        this.form.reset({
          assignee: 'طارق المنصور',
          stage: 'interested',
          region: '',
          followup_datetime: this.getDefaultDateTimeString('tomorrow')
        });
        this.close.emit();
      }, 400);
    });
  }
}

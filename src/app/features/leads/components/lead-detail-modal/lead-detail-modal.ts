import { Component, input, output, inject, signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Lead, LeadsStore, LeadStage, LeadNote } from '../../state/leads.store';
import { AppSelect, CustomDatePicker, SelectOption } from '../../../../shared/components/form-controls';
import { NotesTimeline } from './components/notes-timeline';
import { formatPhoneNumber } from '../../../../shared/pipes/phone-format.pipe';
import { LEAD_STATUS_CONFIG } from '../../../../shared/config/status-config';
import { formatArabicDateTime, parseToIsoDateTime } from '../../../../shared/utils/date-format';
import { NORTH_AMERICA_REGIONS } from '../../../../shared/constants/regions.constant';
import { UsersApiService, UserResponse } from '../../../../core/services/api/users-api.service';
import { RingCentralWidgetService } from '../../../../core/services/ringcentral-widget.service';

function phoneValidator(control: AbstractControl) {
  if (!control.value) return null;
  const digits = control.value.replace(/\D/g, '');
  return digits.length >= 10 ? null : { invalidPhone: true };
}

@Component({
  selector: 'app-lead-detail-modal',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    AppSelect, 
    CustomDatePicker,
    NotesTimeline
  ],
  template: `
    @if (isOpen() && lead(); as leadData) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 overflow-hidden" role="dialog" aria-modal="true" [attr.aria-labelledby]="'lead-title-' + leadData.id">
        <!-- Backdrop (clickable to close) -->
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" (click)="close.emit()"></div>

        <!-- Modal Container -->
        <div class="relative bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl border border-outline-variant/40 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
             (click)="$event.stopPropagation()">
          
          <!-- Header (Customer Name & Close Button) -->
          <div class="px-6 py-4 border-b border-outline-variant/40 bg-surface-container-low flex items-center justify-between gap-4">
            <h2 [id]="'lead-title-' + leadData.id" class="font-headline-sm text-[20px] font-bold text-on-surface leading-tight truncate">
              {{ leadData.name }}
            </h2>

            <!-- Close button -->
            <button 
              type="button"
              class="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors flex-shrink-0" 
              (click)="close.emit()" 
              aria-label="إغلاق النافذة"
              title="إغلاق النافذة">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Form Body -->
          <form [formGroup]="form" class="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-130px)] custom-scrollbar" (ngSubmit)="saveLead()">
            
            <!-- Form Inputs (2-column grid utilizing available horizontal space) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- 1. Full Customer Name (Clean, standard input without displaced floating icon or empty space) -->
              <div class="flex flex-col gap-1.5 w-full">
                <label class="font-label-sm text-[13px] text-on-surface font-semibold flex items-center justify-between">
                  <span>اسم العميل</span>
                  <span class="text-error text-[12px]">*</span>
                </label>
                <div 
                  class="relative flex items-center rounded-lg bg-surface-container-lowest border transition-all duration-200"
                  [class.border-error]="form.get('name')?.invalid && (form.get('name')?.touched || submitted())"
                  [class.border-outline-variant\/60]="!(form.get('name')?.invalid && (form.get('name')?.touched || submitted()))"
                  [class.ring-2]="nameFocused()"
                  [class.ring-primary\/20]="nameFocused() && !(form.get('name')?.invalid && (form.get('name')?.touched || submitted()))"
                  [class.ring-error\/20]="nameFocused() && (form.get('name')?.invalid && (form.get('name')?.touched || submitted()))">
                  <input 
                    type="text"
                    formControlName="name"
                    (focus)="nameFocused.set(true)"
                    (blur)="nameFocused.set(false)"
                    placeholder="أدخل اسم العميل الكامل..."
                    class="w-full h-10 px-3.5 rounded-lg bg-transparent font-body-md text-[13px] text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none transition-all" />
                </div>
                @if (form.get('name')?.invalid && (form.get('name')?.touched || submitted())) {
                  <span class="font-label-sm text-[11px] text-error flex items-center gap-1 mt-0.5">
                    <span class="material-symbols-outlined text-[13px]">error</span>
                    <span>يرجى إدخال اسم العميل الكامل</span>
                  </span>
                }
              </div>

              <!-- 2. Phone Field with Trailing Actions Inside -->
              <div class="flex flex-col gap-1.5 w-full">
                <label class="font-label-sm text-[13px] text-on-surface font-semibold flex items-center justify-between">
                  <span>رقم الهاتف</span>
                  <span class="text-error text-[12px]">*</span>
                </label>
                <div 
                  class="relative flex items-center rounded-lg bg-surface-container-lowest border transition-all duration-200"
                  [class.border-error]="form.get('phone')?.invalid && (form.get('phone')?.touched || submitted())"
                  [class.border-outline-variant\/60]="!(form.get('phone')?.invalid && (form.get('phone')?.touched || submitted()))"
                  [class.ring-2]="phoneFocused()"
                  [class.ring-primary\/20]="phoneFocused() && !(form.get('phone')?.invalid && (form.get('phone')?.touched || submitted()))"
                  [class.ring-error\/20]="phoneFocused() && (form.get('phone')?.invalid && (form.get('phone')?.touched || submitted()))">
                  
                  <!-- Call prefix icon -->
                  <span class="material-symbols-outlined absolute start-3 text-on-surface-variant text-[18px] pointer-events-none transition-colors"
                        [class.text-primary]="phoneFocused()">
                    call
                  </span>

                  <!-- Scoped LTR Phone Input -->
                  <input 
                    type="tel"
                    dir="ltr"
                    formControlName="phone"
                    (focus)="phoneFocused.set(true)"
                    (blur)="onPhoneBlur()"
                    placeholder="+1 (313) 555-0192"
                    class="w-full h-10 rounded-lg bg-transparent font-body-md text-[13px] text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none ps-9 pe-24 transition-all text-start" />

                  <!-- Trailing Icon Buttons Inside Phone Field -->
                  <div class="absolute end-1.5 flex items-center gap-1 z-10" dir="ltr">
                    <!-- WhatsApp Action (Opens Internal Inbox Chat) -->
                    <button 
                      type="button"
                      (click)="openWhatsAppChat()" 
                      class="w-7 h-7 rounded-md flex items-center justify-center text-emerald-600 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                      aria-label="مراسلة العميل عبر واتساب داخل النظام"
                      title="فتح محادثة واتساب في النظام">
                      <span class="material-symbols-outlined text-[17px]">chat</span>
                    </button>

                    <!-- Phone Call Action (Dials via RingCentral) -->
                    <button 
                      type="button"
                      (click)="callViaRingCentral()"
                      class="w-7 h-7 rounded-md flex items-center justify-center text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      aria-label="الاتصال بالعميل هاتفياً عبر RingCentral"
                      title="اتصال هاتفي عبر RingCentral">
                      <span class="material-symbols-outlined text-[17px]">call</span>
                    </button>

                    <!-- Copy Action with Feedback -->
                    <button 
                      type="button" 
                      (click)="copyPhone(form.get('phone')?.value)"
                      class="w-7 h-7 rounded-md flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                      aria-label="نسخ رقم الهاتف"
                      title="نسخ الرقم">
                      <span class="material-symbols-outlined text-[16px]">
                        {{ copiedPhone() ? 'done' : 'content_copy' }}
                      </span>
                    </button>
                  </div>
                </div>
                @if (form.get('phone')?.invalid && (form.get('phone')?.touched || submitted())) {
                  <span class="font-label-sm text-[11px] text-error flex items-center gap-1 mt-0.5">
                    <span class="material-symbols-outlined text-[13px]">error</span>
                    <span>يرجى إدخال رقم هاتف صالح (10 أرقام على الأقل)</span>
                  </span>
                }
              </div>

              <!-- 3. Current Stage (Clean single flag icon, no redundant badge) -->
              <app-select 
                label="المرحلة الحالية"
                placeholder="اختر المرحلة..."
                prefixIcon="flag"
                [options]="stageOptions"
                formControlName="stage"
                [required]="true">
              </app-select>

              <!-- 4. Next Follow-up (Opens Custom DatePicker Directly, Single Calendar Icon) -->
              <app-custom-date-picker
                label="موعد المتابعة"
                placeholder="حدد موعد المتابعة..."
                formControlName="followup_datetime">
              </app-custom-date-picker>

              <!-- 5. Assigned Representative (Single Person Icon, No Duplicate Icons) -->
              <app-select 
                label="الموظف المسؤول"
                placeholder="اختر الموظف المسؤول..."
                prefixIcon="person"
                [options]="assigneeOptions()"
                formControlName="repName">
              </app-select>

              <!-- 6. Region / State Dropdown (Searchable with US & Canada abbreviations like SD, MI, ON) -->
              <app-select 
                label="الولاية / المنطقة"
                placeholder="اختر أو ابحث عن الولاية..."
                prefixIcon="location_on"
                [searchable]="true"
                searchPlaceholder="ابحث بالرمز أو الاسم (مثال: SD, CA, ميشيغان)..."
                [options]="regionOptions()"
                formControlName="location">
              </app-select>
            </div>

            <!-- Notes & Activity Timeline -->
            <div class="space-y-4 pt-2 border-t border-outline-variant/30">
              <div class="flex items-center justify-between pb-1.5">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px] text-primary">history</span>
                  <h3 class="font-headline-sm text-[13px] font-bold text-on-surface">الملاحظات وسجل النشاط</h3>
                </div>
                <span class="font-code-sm text-[11px] text-on-surface-variant font-medium">
                  {{ currentTimelineNotes().length }} سجلات
                </span>
              </div>

              <!-- Interactive Timeline with Pinned Composer -->
              <app-notes-timeline 
                [notes]="currentTimelineNotes()"
                (addNote)="onAddTimelineNote($event)">
              </app-notes-timeline>
            </div>
          </form>

          <!-- Footer (Clean Action Bar Only - Micro-Footer Removed) -->
          <div class="px-6 py-4 bg-surface-container-low border-t border-outline-variant/40 flex items-center justify-between gap-3">
            <!-- Logical Start in RTL: Far Right (Primary & Secondary Actions) -->
            <div class="flex items-center gap-3">
              <!-- Primary Action: Save Changes -->
              <button 
                type="button" 
                class="h-10 px-6 rounded-lg bg-primary text-white hover:bg-primary-container font-label-md text-[13px] font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                [disabled]="isSaving()"
                (click)="saveLead()">
                @if (isSaving()) {
                  <span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  <span>جاري الحفظ...</span>
                } @else if (isSaved()) {
                  <span class="material-symbols-outlined text-[18px] text-emerald-300">done_all</span>
                  <span>تم الحفظ بنجاح</span>
                } @else {
                  <span class="material-symbols-outlined text-[18px]">save</span>
                  <span>حفظ التعديلات</span>
                }
              </button>

              <!-- Secondary Action: Convert to Order -->
              @if (leadData.stage !== 'converted') {
                <button 
                  type="button" 
                  class="h-10 px-4 rounded-lg border border-outline-variant/60 hover:bg-surface-container text-on-surface font-label-md text-[13px] font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  (click)="convertToOrder()"
                  aria-label="تحويل العميل إلى طلب جديد"
                  title="إنشاء طلب جديد لهذا العميل">
                  <span class="material-symbols-outlined text-[18px] text-secondary">shopping_cart_checkout</span>
                  <span>تحويل إلى طلب</span>
                </button>
              }
            </div>

            <!-- Logical End in RTL: Far Left (Neutral Cancel Action) -->
            <div>
              <button 
                type="button" 
                class="h-10 px-4 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-[13px] font-medium transition-colors"
                (click)="close.emit()"
                aria-label="إلغاء التعديلات وإغلاق النافذة">
                إلغاء
              </button>
            </div>
          </div>

        </div>
      </div>
    }
  `
})
export class LeadDetailModal implements OnDestroy {
  isOpen = input<boolean>(false);
  lead = input<Lead | null>(null);
  close = output<void>();

  private fb = inject(FormBuilder);
  private store = inject(LeadsStore);
  private router = inject(Router);
  private usersApi = inject(UsersApiService);
  private rcWidget = inject(RingCentralWidgetService);

  isSaving = signal<boolean>(false);
  isSaved = signal<boolean>(false);
  submitted = signal<boolean>(false);
  copiedPhone = signal<boolean>(false);
  nameFocused = signal<boolean>(false);
  phoneFocused = signal<boolean>(false);

  usersList = signal<UserResponse[]>([]);

  // Comprehensive US & Canada regions with abbreviations recognition (e.g. SD, MI, ON)
  regionOptions = computed<SelectOption[]>(() => {
    const list: SelectOption[] = [...NORTH_AMERICA_REGIONS];
    const l = this.lead();
    if (l?.location && !list.some(r => r.value === l.location)) {
      list.unshift({
        value: l.location,
        label: l.location,
        icon: 'location_on'
      });
    }
    return list;
  });

  /**
   * Stage options derived strictly from the canonical LEAD_STATUS_CONFIG.
   * Redundant badge removed per user request so that only the clean status label is displayed.
   */
  stageOptions: SelectOption[] = [
    { value: 'interested', label: LEAD_STATUS_CONFIG.interested.label },
    { value: 'negotiation', label: LEAD_STATUS_CONFIG.negotiation.label },
    { value: 'converted', label: LEAD_STATUS_CONFIG.won.label },
    { value: 'closed', label: LEAD_STATUS_CONFIG.closed.label }
  ];

  assigneeOptions = computed<SelectOption[]>(() => {
    const users = this.usersList();
    if (users.length > 0) {
      return users
        .filter(u => u.is_active !== false)
        .map(u => {
          let roleLabel = 'موظف مبيعات';
          if (u.role === 'admin') roleLabel = 'مدير';
          else if (u.role === 'sales_supervisor') roleLabel = 'مشرف مبيعات';
          else if (u.role === 'tech_support') roleLabel = 'دعم فني';
          return {
            value: u.name,
            label: u.name,
            badge: roleLabel,
            icon: 'person'
          };
        });
    }
    const currentRep = this.lead()?.repName;
    if (currentRep && currentRep !== 'غير محدد') {
      return [{ value: currentRep, label: currentRep, icon: 'person' }];
    }
    return [];
  });

  form = this.fb.group({
    name: ['', Validators.required],
    phone: ['', [Validators.required, phoneValidator]],
    location: ['ميشيغان - MI'],
    stage: ['interested' as LeadStage, Validators.required],
    repName: [''],
    followup_datetime: ['']
  });

  formattedArabicFollowup = computed(() => {
    const val = this.form.get('followup_datetime')?.value;
    if (!val) return '';
    return formatArabicDateTime(val);
  });

  currentTimelineNotes = computed<LeadNote[]>(() => {
    const l = this.lead();
    if (!l) return [];
    if (l.timelineNotes && l.timelineNotes.length > 0) {
      return l.timelineNotes;
    }
    if (l.notes) {
      return [{
        id: 'initial',
        author: l.repName || 'الموظف المسؤول',
        timestamp: l.createdAt || '20/9/2026',
        text: l.notes,
        type: 'general'
      }];
    }
    return [];
  });

  constructor() {
    this.usersApi.getAll().subscribe({
      next: (users) => {
        this.usersList.set(users || []);
        if (this.isOpen() && !this.form.get('repName')?.value && users && users.length > 0) {
          const l = this.lead();
          const match = users.find(u => u.name === l?.repName);
          this.form.patchValue({ repName: match ? match.name : users[0].name });
        }
      },
      error: () => {}
    });

    effect(() => {
      const l = this.lead();
      const open = this.isOpen();
      if (open && l) {
        this.initForm(l);
        document.body.classList.add('overflow-hidden');
      } else {
        document.body.classList.remove('overflow-hidden');
      }
    });
  }

  ngOnDestroy(): void {
    document.body.classList.remove('overflow-hidden');
  }

  private resolveRegion(rawLoc: string | undefined | null): string {
    if (!rawLoc || !rawLoc.trim()) return 'ميشيغان - MI';
    const clean = rawLoc.trim();
    const exact = NORTH_AMERICA_REGIONS.find(r => r.value === clean || r.code === clean || r.nameAr === clean);
    if (exact) return exact.value;
    const partial = NORTH_AMERICA_REGIONS.find(r => 
      clean.toLowerCase().includes(r.code.toLowerCase()) || 
      clean.includes(r.nameAr) ||
      r.searchKeywords?.some(k => clean.toLowerCase().includes(k.toLowerCase()))
    );
    if (partial) return partial.value;
    return clean;
  }

  private initForm(l: Lead) {
    const formattedPhone = formatPhoneNumber(l.phone);
    const resolvedLocation = this.resolveRegion(l.location);
    const users = this.usersList();
    let resolvedRep = l.repName && l.repName !== 'غير محدد' ? l.repName : '';
    if (!resolvedRep && users.length > 0) {
      resolvedRep = users[0].name;
    }

    const initialVal = {
      name: l.name || '',
      phone: formattedPhone,
      location: resolvedLocation,
      stage: l.stage || 'interested',
      repName: resolvedRep,
      followup_datetime: parseToIsoDateTime(l.followupDate || l.badgeText)
    };

    this.form.reset(initialVal);
    this.isSaved.set(false);
    this.submitted.set(false);
  }

  formatLeadId(id: string | number): string {
    const num = parseInt(String(id), 10);
    if (isNaN(num)) return `#LEAD-${id}`;
    return `#LEAD-${String(num).padStart(4, '0')}`;
  }

  onPhoneBlur() {
    this.phoneFocused.set(false);
    const val = this.form.get('phone')?.value;
    if (val) {
      this.form.patchValue({ phone: formatPhoneNumber(val) }, { emitEvent: false });
    }
  }

  private formatBadgeDate(dateTimeStr: string | null | undefined): string {
    if (!dateTimeStr) return 'اليوم';
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return dateTimeStr;

    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    const formattedHours = hours % 12 || 12;
    const timeStr = `${String(formattedHours).padStart(2, '0')}:${minutes} ${ampm}`;

    if (isToday) return `اليوم ${timeStr}`;
    if (isTomorrow) return `غداً ${timeStr}`;
    return formatArabicDateTime(date);
  }

  openWhatsAppChat() {
    const phone = this.form.get('phone')?.value || this.lead()?.phone;
    const name = this.form.get('name')?.value || this.lead()?.name || '';
    if (phone) {
      this.close.emit();
      this.router.navigate(['/inbox'], { queryParams: { phone, name, channel: 'whatsapp' } });
    }
  }

  callViaRingCentral() {
    const phone = this.form.get('phone')?.value || this.lead()?.phone;
    if (phone) {
      this.rcWidget.dialNumber(phone);
    }
  }

  getWhatsAppUrl(phone: string | null | undefined): string {
    if (!phone) return '#';
    const clean = phone.replace(/\D/g, '');
    return `https://wa.me/${clean}`;
  }

  copyPhone(phone: string | null | undefined) {
    if (!phone) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phone);
      this.copiedPhone.set(true);
      setTimeout(() => this.copiedPhone.set(false), 2000);
    }
  }

  onAddTimelineNote(event: { text: string }) {
    const currentLead = this.lead();
    if (!currentLead) return;
    this.store.addLeadNote(currentLead.id, {
      author: this.form.get('repName')?.value || currentLead.repName || 'الموظف المسؤول',
      text: event.text
    });
  }

  saveLead() {
    this.submitted.set(true);
    const currentLead = this.lead();
    if (!currentLead) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const val = this.form.value;
    const rawPhone = val.phone || '';
    const cleanDigits = rawPhone.replace(/\D/g, '') || currentLead.phone;
    const stage = (val.stage as LeadStage) || currentLead.stage;
    const badgeText = this.formatBadgeDate(val.followup_datetime);

    const updated: Partial<Lead> & { id: string } = {
      id: currentLead.id,
      name: val.name?.trim() || currentLead.name,
      phone: cleanDigits,
      location: val.location || currentLead.location,
      stage: stage,
      repName: val.repName || currentLead.repName,
      badgeText: badgeText,
      followupDate: val.followup_datetime || currentLead.followupDate,
      updatedAt: 'الآن'
    };

    this.store.updateLead(
      updated,
      () => {
        this.isSaving.set(false);
        this.isSaved.set(true);

        setTimeout(() => {
          this.isSaved.set(false);
          this.close.emit();
        }, 500);
      },
      () => {
        this.isSaving.set(false);
      }
    );
  }

  convertToOrder() {
    const currentLead = this.lead();
    if (!currentLead) return;

    this.store.updateLeadStage(currentLead.id, 'converted');
    this.close.emit();
    this.router.navigate(['/orders/new'], {
      queryParams: {
        name: currentLead.name || '',
        phone: currentLead.phone || '',
        email: currentLead.email || '',
        city: currentLead.location || '',
        leadId: currentLead.id || ''
      }
    });
  }
}

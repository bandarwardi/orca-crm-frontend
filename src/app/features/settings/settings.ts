import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SettingsStore } from './store/settings.store';
import { SettingsTab, UserRole, TeamMember, WhatsAppAccount } from './models/settings.models';
import { RingcentralPhoneNumberModel } from '../../core/services/api/ringcentral-api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  host: {
    class: 'flex-1 min-h-0 overflow-y-auto w-full p-space-sm sm:p-space-md lg:p-space-lg'
  }
})
export class Settings implements OnInit {
  store = inject(SettingsStore);
  private fb = inject(FormBuilder);

  // Active dropdown action menu tracking
  activeMenuMemberId = signal<string | null>(null);

  // Floating feedback toast notification
  toastMessage = signal<string | null>(null);
  private toastTimer: any = null;

  // WhatsApp form & token visibility state
  showAccessToken = signal<boolean>(false);
  showAppSecret = signal<boolean>(false);

  // Form for adding a new team member
  addMemberForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['sales_rep' as UserRole, [Validators.required]],
    phone: ['']
  });

  // Form for editing an existing team member
  editMemberForm = this.fb.group({
    id: ['', [Validators.required]],
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['sales_rep' as UserRole, [Validators.required]],
    phone: ['']
  });

  // Form for editing company details
  companyForm = this.fb.group({
    companyName: ['orca IPTV Streaming Services LLC', [Validators.required]],
    adminEmail: ['admin@orcacrm.io', [Validators.required, Validators.email]],
    currency: ['USD ($) - الدولار الأمريكي', [Validators.required]],
    timeZone: ['(UTC-05:00) Eastern Time (US & Canada)', [Validators.required]]
  });

  // Form for adding/editing WhatsApp Cloud API Account
  whatsappForm = this.fb.group({
    id: [''],
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone_number: ['', [Validators.required]],
    phone_number_id: ['', [Validators.required]],
    waba_id: [''],
    access_token: ['', [Validators.required]],
    app_secret: [''],
    is_default: [false],
    status: ['active' as 'active' | 'inactive']
  });

  // RingCentral form & token visibility state
  showRcClientSecret = signal<boolean>(false);
  showRcJwtToken = signal<boolean>(false);

  // Form for RingCentral Telephony & SMS configuration
  ringcentralForm = this.fb.group({
    server_url: ['https://platform.ringcentral.com', [Validators.required]],
    client_id: ['', [Validators.required]],
    client_secret: [''],
    jwt_token: [''],
    main_phone_number: [''],
    webhook_verify_token: ['orca_rc_verify_token_123'],
    is_enabled: [false]
  });

  // Modal and form state for RingCentral phone lines
  isAddRcPhoneModalOpen = signal<boolean>(false);
  isEditRcPhoneModalOpen = signal<boolean>(false);
  editingRcPhoneId = signal<string | null>(null);

  rcPhoneForm = this.fb.group({
    phone_number: ['', [Validators.required]],
    label: ['', [Validators.required, Validators.minLength(2)]],
    department: ['sales'],
    extension_number: [''],
    is_default: [false]
  });

  constructor() {
    effect(() => {
      const cfg = this.store.ringcentralConfig();
      if (cfg) {
        this.ringcentralForm.patchValue({
          server_url: cfg.server_url || 'https://platform.ringcentral.com',
          client_id: cfg.client_id || '',
          main_phone_number: cfg.main_phone_number || '',
          webhook_verify_token: cfg.webhook_verify_token || 'orca_rc_verify_token_123',
          is_enabled: !!cfg.is_enabled
        }, { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    this.store.loadTeamMembers();
    this.store.loadCompanySettings();
    this.store.loadAuditLogs();
    this.store.loadWhatsAppAccounts();
    this.store.loadRingcentralConfig();
    this.store.loadRingcentralPhoneNumbers();
  }

  // Role badges helper mapping
  getRoleBadgeInfo(role: UserRole) {
    switch (role) {
      case 'admin':
        return {
          titleAr: 'مدير',
          icon: 'shield_person',
          badgeClass: 'bg-primary/10 text-primary-container font-semibold'
        };
      case 'sales_supervisor':
        return {
          titleAr: 'مشرف مبيعات',
          icon: 'supervisor_account',
          badgeClass: 'bg-primary-fixed text-on-primary-fixed-variant font-medium'
        };
      case 'sales_rep':
        return {
          titleAr: 'موظف مبيعات',
          icon: 'support_agent',
          badgeClass: 'bg-surface-container-high text-on-surface font-medium'
        };
      case 'tech_support':
        return {
          titleAr: 'دعم فني',
          icon: 'build',
          badgeClass: 'bg-tertiary-fixed-dim/30 text-tertiary-container font-semibold'
        };
    }
  }

  // Handlers
  onTabChange(tab: SettingsTab): void {
    this.store.setActiveTab(tab);
  }

  onSearchChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.store.setSearchQuery(val);
  }

  onRoleFilterChange(role: UserRole | 'all'): void {
    this.store.setRoleFilter(role);
  }

  resetFilters(): void {
    this.store.setSearchQuery('');
    this.store.setRoleFilter('all');
  }

  toggleMemberStatus(id: string): void {
    this.store.toggleMemberActive(id);
  }

  toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    if (this.activeMenuMemberId() === id) {
      this.activeMenuMemberId.set(null);
    } else {
      this.activeMenuMemberId.set(id);
    }
  }

  closeMenu(): void {
    this.activeMenuMemberId.set(null);
  }

  showToast(message: string): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastMessage.set(message);
    this.toastTimer = setTimeout(() => {
      this.toastMessage.set(null);
    }, 3500);
  }

  openAddModal(): void {
    this.addMemberForm.reset({
      name: '',
      email: '',
      password: '',
      role: 'sales_rep',
      phone: ''
    });
    this.store.openAddMemberModal();
  }

  closeAddModal(): void {
    this.store.closeAddMemberModal();
  }

  submitAddMember(): void {
    if (this.addMemberForm.invalid) {
      this.addMemberForm.markAllAsTouched();
      return;
    }

    const val = this.addMemberForm.value;
    this.store.addMember({
      name: val.name!,
      email: val.email!,
      password: val.password!,
      role: val.role as UserRole,
      phone: val.phone || ''
    });
    this.showToast(`جاري إضافة الموظف "${val.name}"...`);
  }

  openEditModal(member: TeamMember): void {
    this.closeMenu();
    this.editMemberForm.setValue({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      phone: member.phone || ''
    });
    this.store.openEditMemberModal(member);
  }

  closeEditModal(): void {
    this.store.closeEditMemberModal();
  }

  submitEditMember(): void {
    if (this.editMemberForm.invalid) {
      this.editMemberForm.markAllAsTouched();
      return;
    }

    const val = this.editMemberForm.value;
    this.store.updateMember({
      id: val.id!,
      dto: {
        name: val.name!,
        email: val.email!,
        role: val.role as UserRole,
        phone: val.phone || ''
      }
    });
    this.showToast(`جاري تحديث بيانات "${val.name}"...`);
  }

  resetPassword(member: TeamMember): void {
    this.closeMenu();
    this.showToast(`تم إرسال رابط إعادة ضبط كلمة السر إلى بريد ${member.name} (${member.email})`);
  }

  deleteMember(member: TeamMember): void {
    this.closeMenu();
    if (confirm(`هل أنت متأكد من رغبتك في حذف الموظف "${member.name}" من منظومة orca CRM؟`)) {
      this.store.deleteMember(member.id);
      this.showToast(`جاري حذف الموظف "${member.name}"...`);
    }
  }

  openPermissionsModal(): void {
    this.store.openPermissionsModal();
  }

  closePermissionsModal(): void {
    this.store.closePermissionsModal();
  }

  togglePermission(
    featureKey: string,
    roleKey: 'adminAllowed' | 'supervisorAllowed' | 'salesAllowed' | 'supportAllowed'
  ): void {
    if (roleKey === 'adminAllowed') {
      this.showToast('صلاحيات مدير النظام مثبتة لحماية وصول لوحة الإدارة');
      return;
    }
    this.store.togglePermission(featureKey, roleKey);
    this.showToast('تم تحديث الصلاحية بنجاح وتسجيل التعديل في سجل الأنشطة');
  }

  saveCompanySettings(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }
    const val = this.companyForm.value;
    this.store.updateCompanySettings({
      companyName: val.companyName!,
      adminEmail: val.adminEmail!,
      currency: val.currency!,
      timeZone: val.timeZone!
    });
    this.showToast('تم حفظ بيانات الشركة وإعدادات المستأجر بنجاح');
  }

  // WhatsApp Multi-Account Handlers
  toggleShowAccessToken(): void {
    this.showAccessToken.update((v) => !v);
  }

  toggleShowAppSecret(): void {
    this.showAppSecret.update((v) => !v);
  }

  openAddWhatsAppModal(): void {
    const isFirstAccount = this.store.whatsappAccounts().length === 0;
    this.whatsappForm.reset({
      id: '',
      name: '',
      phone_number: '',
      phone_number_id: '',
      waba_id: '',
      access_token: '',
      app_secret: '',
      is_default: isFirstAccount,
      status: 'active'
    });
    this.showAccessToken.set(false);
    this.showAppSecret.set(false);
    this.store.openAddWhatsAppModal();
  }

  closeAddWhatsAppModal(): void {
    this.store.closeAddWhatsAppModal();
  }

  openEditWhatsAppModal(acc: WhatsAppAccount): void {
    this.whatsappForm.setValue({
      id: acc.id,
      name: acc.name,
      phone_number: acc.phone_number,
      phone_number_id: acc.phone_number_id,
      waba_id: acc.waba_id || '',
      access_token: acc.access_token,
      app_secret: acc.app_secret || '',
      is_default: acc.is_default,
      status: acc.status === 'unverified' ? 'active' : acc.status
    });
    this.showAccessToken.set(false);
    this.showAppSecret.set(false);
    this.store.openEditWhatsAppModal(acc);
  }

  closeEditWhatsAppModal(): void {
    this.store.closeEditWhatsAppModal();
  }

  testWhatsAppConnection(): void {
    const phoneId = this.whatsappForm.get('phone_number_id')?.value?.trim();
    const token = this.whatsappForm.get('access_token')?.value?.trim();

    if (!phoneId || !token) {
      this.showToast('يرجى كتابة معرف الرقم (Phone Number ID) ورمز الوصول (Access Token) أولاً لإجراء الفحص');
      return;
    }

    this.store.testWhatsAppConnection({
      phone_number_id: phoneId,
      access_token: token
    });
  }

  submitWhatsAppAccount(): void {
    if (this.whatsappForm.invalid) {
      this.whatsappForm.markAllAsTouched();
      this.showToast('يرجى تعبئة الحقول الإلزامية المطلوبة بشكل صحيح');
      return;
    }

    const val = this.whatsappForm.value;
    const isEditing = !!val.id;

    if (isEditing) {
      this.store.updateWhatsAppAccount({
        id: val.id!,
        dto: {
          name: val.name!,
          phone_number: val.phone_number!,
          phone_number_id: val.phone_number_id!,
          waba_id: val.waba_id || undefined,
          access_token: val.access_token!,
          app_secret: val.app_secret || undefined,
          is_default: !!val.is_default,
          status: (val.status as any) || 'active'
        }
      });
      this.showToast(`جاري تحديث بيانات الحساب "${val.name}"...`);
    } else {
      this.store.addWhatsAppAccount({
        name: val.name!,
        phone_number: val.phone_number!,
        phone_number_id: val.phone_number_id!,
        waba_id: val.waba_id || undefined,
        access_token: val.access_token!,
        app_secret: val.app_secret || undefined,
        is_default: !!val.is_default,
        status: (val.status as any) || 'active'
      });
      this.showToast(`جاري ربط وحفظ الحساب "${val.name}"...`);
    }
  }

  deleteWhatsAppAccount(acc: WhatsAppAccount): void {
    if (confirm(`هل أنت متأكد من رغبتك في إزالة رقم "${acc.name}" (${acc.phone_number}) من النظام؟`)) {
      this.store.deleteWhatsAppAccount(acc.id);
      this.showToast(`تم حذف الحساب "${acc.name}"`);
    }
  }

  setDefaultWhatsAppAccount(acc: WhatsAppAccount): void {
    if (acc.is_default) return;
    this.store.setDefaultWhatsAppAccount(acc.id);
    this.showToast(`تم تعيين "${acc.name}" كرقم افتراضي للإرسال`);
  }

  testAccountDirect(acc: WhatsAppAccount): void {
    this.showToast(`جاري التحقق من اتصال الرقم "${acc.name}" مع خوادم Meta...`);
    this.store.testWhatsAppConnection({
      phone_number_id: acc.phone_number_id,
      access_token: acc.access_token
    });
  }

  // RingCentral Handlers
  toggleShowRcClientSecret(): void {
    this.showRcClientSecret.update((v) => !v);
  }

  toggleShowRcJwtToken(): void {
    this.showRcJwtToken.update((v) => !v);
  }

  saveRingcentralConfig(): void {
    if (this.ringcentralForm.invalid) {
      this.ringcentralForm.markAllAsTouched();
      this.showToast('يرجى التأكد من إدخال رابط الخادم ومعرف التطبيق (Client ID)');
      return;
    }

    const val = this.ringcentralForm.value;
    const dto: any = {
      server_url: val.server_url?.trim(),
      client_id: val.client_id?.trim(),
      main_phone_number: val.main_phone_number?.trim(),
      webhook_verify_token: val.webhook_verify_token?.trim(),
      is_enabled: !!val.is_enabled,
    };

    if (val.client_secret && val.client_secret.trim()) {
      dto.client_secret = val.client_secret.trim();
    }
    if (val.jwt_token && val.jwt_token.trim()) {
      dto.jwt_token = val.jwt_token.trim();
    }

    this.store.saveRingcentralConfig(dto);
    this.showToast('جاري حفظ وتحديث إعدادات ربط RingCentral...');
  }

  testRingcentralConnection(): void {
    const val = this.ringcentralForm.value;
    const cfg = this.store.ringcentralConfig();

    const clientId = val.client_id?.trim() || cfg?.client_id;
    const hasSecret = (val.client_secret && val.client_secret.trim()) || cfg?.has_client_secret;
    const hasJwt = (val.jwt_token && val.jwt_token.trim()) || cfg?.has_jwt_token;

    if (!clientId) {
      this.showToast('يرجى إدخال معرف التطبيق (Client ID) أولاً');
      return;
    }

    if (!hasSecret || !hasJwt) {
      this.showToast('يرجى إدخال Client Secret و JWT Token لإجراء الفحص');
      return;
    }

    const dto: any = {
      server_url: val.server_url?.trim(),
      client_id: clientId,
    };
    if (val.client_secret?.trim()) dto.client_secret = val.client_secret.trim();
    if (val.jwt_token?.trim()) dto.jwt_token = val.jwt_token.trim();

    this.showToast('جاري فحص الاتصال مع خوادم RingCentral...');
    this.store.testRingcentralConnection(dto);
  }

  registerRingcentralWebhook(): void {
    const webhookUrl = this.store.ringcentralConfig()?.webhook_url || `${window.location.origin}/api/ringcentral/webhook`;
    this.showToast('جاري تسجيل اشتراك الويب هوك لدى RingCentral...');
    this.store.registerRingcentralWebhook(webhookUrl);
  }

  copyWebhookUrl(url: string): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.showToast('تم نسخ رابط الويب هوك إلى الحافظة بنجاح');
      });
    } else {
      this.showToast('رابط الويب هوك: ' + url);
    }
  }

  // Multi-Line Phone Numbers Handlers
  openAddRcPhoneModal(): void {
    const isFirst = this.store.ringcentralPhoneNumbers().length === 0;
    this.rcPhoneForm.reset({
      phone_number: '',
      label: '',
      department: 'sales',
      extension_number: '',
      is_default: isFirst
    });
    this.isAddRcPhoneModalOpen.set(true);
  }

  closeAddRcPhoneModal(): void {
    this.isAddRcPhoneModalOpen.set(false);
  }

  openEditRcPhoneModal(line: RingcentralPhoneNumberModel): void {
    this.editingRcPhoneId.set(line.id);
    this.rcPhoneForm.setValue({
      phone_number: line.phone_number,
      label: line.label,
      department: line.department || 'sales',
      extension_number: line.extension_number || '',
      is_default: line.is_default
    });
    this.isEditRcPhoneModalOpen.set(true);
  }

  closeEditRcPhoneModal(): void {
    this.isEditRcPhoneModalOpen.set(false);
    this.editingRcPhoneId.set(null);
  }

  submitRcPhone(): void {
    if (this.rcPhoneForm.invalid) {
      this.rcPhoneForm.markAllAsTouched();
      this.showToast('يرجى كتابة رقم الهاتف وتسمية الخط بشكل صحيح');
      return;
    }

    const val = this.rcPhoneForm.value;
    const isEdit = this.isEditRcPhoneModalOpen();

    if (isEdit && this.editingRcPhoneId()) {
      this.store.updateRingcentralPhoneNumber({
        id: this.editingRcPhoneId()!,
        dto: {
          phone_number: val.phone_number!,
          label: val.label!,
          department: val.department || 'sales',
          extension_number: val.extension_number || '',
          is_default: !!val.is_default
        }
      });
      this.closeEditRcPhoneModal();
      this.showToast(`تم تحديث بيانات خط "${val.label}"`);
    } else {
      this.store.createRingcentralPhoneNumber({
        phone_number: val.phone_number!,
        label: val.label!,
        department: val.department || 'sales',
        extension_number: val.extension_number || '',
        is_default: !!val.is_default
      });
      this.closeAddRcPhoneModal();
      this.showToast(`تمت إضافة الخط الهاتفي "${val.label}"`);
    }
  }

  deleteRcPhone(line: RingcentralPhoneNumberModel): void {
    if (confirm(`هل أنت متأكد من رغبتك في حذف خط الهاتف "${line.label}" (${line.phone_number})؟`)) {
      this.store.deleteRingcentralPhoneNumber(line.id);
      this.showToast(`تم حذف الخط "${line.label}"`);
    }
  }

  setDefaultRcPhone(line: RingcentralPhoneNumberModel): void {
    if (line.is_default) return;
    this.store.setDefaultRingcentralPhoneNumber(line.id);
    this.showToast(`تم تعيين خط "${line.label}" كخط افتراضي`);
  }

  syncRcPhones(): void {
    this.showToast('جاري استعلام ومزامنة خطوط الهاتف من حساب RingCentral...');
    this.store.syncRingcentralPhoneNumbers();
  }
}


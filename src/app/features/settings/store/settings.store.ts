import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, finalize } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import {
  SettingsTab,
  TeamMember,
  UserRole,
  NewMemberDto,
  PermissionFeature,
  CompanySettings,
  AuditLogEntry,
  mapUserResponseToTeamMember,
  mapTenantResponseToCompanySettings,
  WhatsAppAccount,
  CreateWhatsAppAccountDto,
  UpdateWhatsAppAccountDto,
  TestConnectionDto,
  TestConnectionResponse
} from '../models/settings.models';
import { UsersApiService } from '../../../core/services/api/users-api.service';
import { TenantsApiService } from '../../../core/services/api/tenants-api.service';
import { AuditLogApiService } from '../../../core/services/api/audit-log-api.service';
import { WhatsAppApiService } from '../../../core/services/api/whatsapp-api.service';
import { RingcentralApiService, RingcentralConfigModel, RingcentralTestResult, RingcentralPhoneNumberModel } from '../../../core/services/api/ringcentral-api.service';
import { formatDateTimeEn } from '../../../core/utils/date-format.util';

export interface SettingsState {
  activeTab: SettingsTab;
  searchQuery: string;
  roleFilter: UserRole | 'all';
  teamMembers: TeamMember[];
  isLoading: boolean;
  error: string | null;
  isAddMemberModalOpen: boolean;
  isEditMemberModalOpen: boolean;
  editingMember: TeamMember | null;
  isPermissionsModalOpen: boolean;
  selectedMemberId: string | null;
  permissionFeatures: PermissionFeature[];
  auditLogs: AuditLogEntry[];
  companySettings: CompanySettings;

  // WhatsApp Multi-Account State
  whatsappAccounts: WhatsAppAccount[];
  isWhatsAppLoading: boolean;
  isAddWhatsAppModalOpen: boolean;
  isEditWhatsAppModalOpen: boolean;
  editingWhatsAppAccount: WhatsAppAccount | null;
  isTestingWhatsAppConnection: boolean;
  whatsAppTestResult: TestConnectionResponse | null;
  whatsAppError: string | null;

  // RingCentral Telephony & SMS State
  ringcentralConfig: RingcentralConfigModel | null;
  isRingcentralLoading: boolean;
  isSavingRingcentralConfig: boolean;
  isTestingRingcentralConnection: boolean;
  ringcentralTestResult: RingcentralTestResult | null;
  ringcentralError: string | null;
  isRegisteringWebhook: boolean;
  webhookRegisterResult: { success: boolean; message: string } | null;

  // RingCentral Multi-Line Phone Numbers
  ringcentralPhoneNumbers: RingcentralPhoneNumberModel[];
  isRingcentralPhoneNumbersLoading: boolean;
  isSyncingRingcentralPhoneNumbers: boolean;
}

const initialPermissionFeatures: PermissionFeature[] = [
  {
    key: 'dashboard_view',
    nameAr: 'عرض لوحة التحكم والإحصائيات الرئيسية',
    categoryAr: 'لوحة التحكم والتقارير',
    adminAllowed: true,
    supervisorAllowed: true,
    salesAllowed: true,
    supportAllowed: true
  },
  {
    key: 'leads_manage',
    nameAr: 'إدارة وتوزيع العملاء المحتملين (Leads)',
    categoryAr: 'العملاء والطلبات',
    adminAllowed: true,
    supervisorAllowed: true,
    salesAllowed: true,
    supportAllowed: false
  },
  {
    key: 'orders_create',
    nameAr: 'إنشاء وتجديد طلبات الاشتراكات (Orders)',
    categoryAr: 'العملاء والطلبات',
    adminAllowed: true,
    supervisorAllowed: true,
    salesAllowed: true,
    supportAllowed: true
  },
  {
    key: 'mac_device_view',
    nameAr: 'فحص واستعلام أجهزة المشتركين (MAC & Device Keys)',
    categoryAr: 'الدعم الفني والأجهزة',
    adminAllowed: true,
    supervisorAllowed: true,
    salesAllowed: false,
    supportAllowed: true
  },
  {
    key: 'team_manage',
    nameAr: 'إدارة أعضاء الفريق والصلاحيات والترقيات',
    categoryAr: 'الإدارة والأمان',
    adminAllowed: true,
    supervisorAllowed: false,
    salesAllowed: false,
    supportAllowed: false
  },
  {
    key: 'integrations_manage',
    nameAr: 'إدارة وتفعيل تكاملات السيرفرات والواتساب',
    categoryAr: 'إعدادات النظام والربط',
    adminAllowed: true,
    supervisorAllowed: false,
    salesAllowed: false,
    supportAllowed: false
  },
  {
    key: 'audit_log_view',
    nameAr: 'استعراض سجلات الأنشطة والأمان الحساسة',
    categoryAr: 'الإدارة والأمان',
    adminAllowed: true,
    supervisorAllowed: true,
    salesAllowed: false,
    supportAllowed: false
  }
];

const initialAuditLogs: AuditLogEntry[] = [];

const initialCompanySettings: CompanySettings = {
  companyName: 'orca IPTV Streaming Services LLC',
  adminEmail: 'admin@orcacrm.io',
  currency: 'USD ($) - الدولار الأمريكي',
  timeZone: '(UTC-05:00) Eastern Time (US & Canada)'
};

function getCurrentTimeArabic(): string {
  const d = new Date();
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'م' : 'ص';
  const displayHours = hours % 12 || 12;
  return `اليوم ${displayHours}:${minutes} ${period}`;
}

const initialState: SettingsState = {
  activeTab: 'team',
  searchQuery: '',
  roleFilter: 'all',
  teamMembers: [],
  isLoading: false,
  error: null,
  isAddMemberModalOpen: false,
  isEditMemberModalOpen: false,
  editingMember: null,
  isPermissionsModalOpen: false,
  selectedMemberId: null,
  permissionFeatures: initialPermissionFeatures,
  auditLogs: initialAuditLogs,
  companySettings: initialCompanySettings,

  whatsappAccounts: [],
  isWhatsAppLoading: false,
  isAddWhatsAppModalOpen: false,
  isEditWhatsAppModalOpen: false,
  editingWhatsAppAccount: null,
  isTestingWhatsAppConnection: false,
  whatsAppTestResult: null,
  whatsAppError: null,

  ringcentralConfig: null,
  isRingcentralLoading: false,
  isSavingRingcentralConfig: false,
  isTestingRingcentralConnection: false,
  ringcentralTestResult: null,
  ringcentralError: null,
  isRegisteringWebhook: false,
  webhookRegisterResult: null,

  ringcentralPhoneNumbers: [],
  isRingcentralPhoneNumbersLoading: false,
  isSyncingRingcentralPhoneNumbers: false
};

export const SettingsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ teamMembers, searchQuery, roleFilter, whatsappAccounts }) => ({
    filteredMembers: computed(() => {
      const q = searchQuery().trim().toLowerCase();
      const r = roleFilter();

      return teamMembers().filter((member) => {
        const matchesRole = r === 'all' || member.role === r;
        const matchesSearch =
          !q ||
          member.name.toLowerCase().includes(q) ||
          member.email.toLowerCase().includes(q) ||
          (member.phone && member.phone.toLowerCase().includes(q));

        return matchesRole && matchesSearch;
      });
    }),

    totalCount: computed(() => teamMembers().length),
    activeCount: computed(() => teamMembers().filter((m) => m.isActive).length),
    onlineCount: computed(() => teamMembers().filter((m) => m.isOnline).length),

    adminsCount: computed(() => teamMembers().filter((m) => m.role === 'admin').length),
    supervisorsCount: computed(() => teamMembers().filter((m) => m.role === 'sales_supervisor').length),
    salesCount: computed(() => teamMembers().filter((m) => m.role === 'sales_rep').length),
    supportCount: computed(() => teamMembers().filter((m) => m.role === 'tech_support').length),

    defaultWhatsAppAccount: computed(() => whatsappAccounts().find((a) => a.is_default) || whatsappAccounts()[0] || null),
    activeWhatsAppAccountsCount: computed(() => whatsappAccounts().filter((a) => a.status === 'active').length),
  })),
  withMethods((
    store,
    usersApi = inject(UsersApiService),
    tenantsApi = inject(TenantsApiService),
    auditApi = inject(AuditLogApiService),
    whatsappApi = inject(WhatsAppApiService),
    ringcentralApi = inject(RingcentralApiService)
  ) => ({
    setActiveTab(tab: SettingsTab): void {
      patchState(store, { activeTab: tab });
    },

    setSearchQuery(query: string): void {
      patchState(store, { searchQuery: query });
    },

    setRoleFilter(role: UserRole | 'all'): void {
      patchState(store, { roleFilter: role });
    },

    openAddMemberModal(): void {
      patchState(store, { isAddMemberModalOpen: true });
    },

    closeAddMemberModal(): void {
      patchState(store, { isAddMemberModalOpen: false });
    },

    openEditMemberModal(member: TeamMember): void {
      patchState(store, { isEditMemberModalOpen: true, editingMember: member });
    },

    closeEditMemberModal(): void {
      patchState(store, { isEditMemberModalOpen: false, editingMember: null });
    },

    openPermissionsModal(): void {
      patchState(store, { isPermissionsModalOpen: true });
    },

    closePermissionsModal(): void {
      patchState(store, { isPermissionsModalOpen: false });
    },

    loadAuditLogs: rxMethod<void>(
      pipe(
        switchMap(() =>
          auditApi.search().pipe(
            tapResponse({
              next: (logs: any) => {
                const mappedLogs = logs.map((l: any) => ({
                  id: l.id,
                  userName: l.user?.name || 'مستخدم غير معروف',
                  actionText: l.action,
                  timeText: formatDateTimeEn(l.created_at),
                  icon: 'security',
                  iconColor: 'text-primary'
                }));
                patchState(store, { auditLogs: mappedLogs });
              },
              error: (err: any) => console.error(err)
            })
          )
        )
      )
    ),

    loadTeamMembers: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          usersApi.getAll().pipe(
            tapResponse({
              next: (users: any) => patchState(store, { teamMembers: users.map(mapUserResponseToTeamMember), isLoading: false }),
              error: (err: any) => patchState(store, { error: err.message || 'فشل في تحميل الموظفين', isLoading: false }),
            })
          )
        )
      )
    ),

    addMember: rxMethod<any>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((dto) =>
          usersApi.create(dto).pipe(
            tapResponse({
              next: (user: any) => {
                const newMember = mapUserResponseToTeamMember(user);
                patchState(store, (state) => ({
                  teamMembers: [newMember, ...state.teamMembers],
                  isAddMemberModalOpen: false,
                  isLoading: false,
                  auditLogs: [
                    {
                      id: `log-${Date.now()}`,
                      userName: 'أنت',
                      actionText: `قام بإضافة عضو جديد للفريق: "${user.name}"`,
                      timeText: getCurrentTimeArabic(),
                      icon: 'person_add',
                      iconColor: 'text-secondary'
                    },
                    ...state.auditLogs
                  ]
                }));
              },
              error: (err: any) => patchState(store, { error: err.message || 'فشل في إضافة الموظف', isLoading: false }),
            })
          )
        )
      )
    ),

    updateMember: rxMethod<{ id: string; dto: any }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, dto }) =>
          usersApi.update(id, dto).pipe(
            tapResponse({
              next: (user: any) => {
                const updatedMember = mapUserResponseToTeamMember(user);
                patchState(store, (state) => ({
                  teamMembers: state.teamMembers.map((m) => (m.id === id ? updatedMember : m)),
                  isEditMemberModalOpen: false,
                  editingMember: null,
                  isLoading: false,
                  auditLogs: [
                    {
                      id: `log-${Date.now()}`,
                      userName: 'أنت',
                      actionText: `قام بتحديث بيانات الموظف: "${user.name}"`,
                      timeText: getCurrentTimeArabic(),
                      icon: 'edit',
                      iconColor: 'text-primary'
                    },
                    ...state.auditLogs
                  ]
                }));
              },
              error: (err: any) => patchState(store, { error: err.message || 'فشل في تحديث الموظف', isLoading: false }),
            })
          )
        )
      )
    ),

    toggleMemberActive: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) => {
          const target = store.teamMembers().find((m) => m.id === id);
          const newStatus = target ? !target.isActive : false;
          return usersApi.setStatus(id, newStatus).pipe(
            tapResponse({
              next: (user: any) => {
                const statusAr = newStatus ? 'تفعيل' : 'تجميد';
                const updatedMember = mapUserResponseToTeamMember(user);
                patchState(store, (state) => ({
                  teamMembers: state.teamMembers.map((m) => (m.id === id ? updatedMember : m)),
                  isLoading: false,
                  auditLogs: [
                    {
                      id: `log-${Date.now()}`,
                      userName: 'أنت',
                      actionText: `قام بـ ${statusAr} حساب "${user.name}"`,
                      timeText: getCurrentTimeArabic(),
                      icon: newStatus ? 'check_circle' : 'block',
                      iconColor: newStatus ? 'text-secondary' : 'text-error'
                    },
                    ...state.auditLogs
                  ]
                }));
              },
              error: (err: any) => patchState(store, { error: err.message || 'فشل في تغيير حالة الموظف', isLoading: false }),
            })
          );
        })
      )
    ),

    deleteMember: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) => {
          const target = store.teamMembers().find((m) => m.id === id);
          const name = target ? target.name : 'عضو';
          return usersApi.delete(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, (state) => ({
                  teamMembers: state.teamMembers.filter((m) => m.id !== id),
                  isLoading: false,
                  auditLogs: [
                    {
                      id: `log-${Date.now()}`,
                      userName: 'أنت',
                      actionText: `قام بحذف الموظف: "${name}"`,
                      timeText: getCurrentTimeArabic(),
                      icon: 'person_remove',
                      iconColor: 'text-error'
                    },
                    ...state.auditLogs
                  ]
                }));
              },
              error: (err: any) => patchState(store, { error: err.message || 'فشل في حذف الموظف', isLoading: false }),
            })
          );
        })
      )
    ),

    togglePermission(
      featureKey: string,
      roleKey: 'adminAllowed' | 'supervisorAllowed' | 'salesAllowed' | 'supportAllowed'
    ): void {
      const feat = store.permissionFeatures().find((f) => f.key === featureKey);
      const featName = feat ? feat.nameAr : featureKey;

      patchState(store, (state) => ({
        permissionFeatures: state.permissionFeatures.map((f) =>
          f.key === featureKey ? { ...f, [roleKey]: !f[roleKey] } : f
        ),
        auditLogs: [
          {
            id: `log-${Date.now()}`,
            userName: 'أنت',
            actionText: `قام بتعديل صلاحية "${featName}"`,
            timeText: getCurrentTimeArabic(),
            icon: 'security_update_good',
            iconColor: 'text-primary-container'
          },
          ...state.auditLogs
        ]
      }));
    },

    loadCompanySettings: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          tenantsApi.getSettings().pipe(
            tapResponse({
              next: (tenant: any) => patchState(store, { companySettings: mapTenantResponseToCompanySettings(tenant), isLoading: false }),
              error: (err: any) => patchState(store, { error: err.message || 'فشل في تحميل إعدادات الشركة', isLoading: false }),
            })
          )
        )
      )
    ),

    updateCompanySettings: rxMethod<CompanySettings>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((settings) =>
          tenantsApi.updateSettings({
            name: settings.companyName,
            email: settings.adminEmail,
            currency: settings.currency,
            timezone: settings.timeZone
          }).pipe(
            tapResponse({
              next: (tenant: any) => {
                patchState(store, (state) => ({
                  companySettings: mapTenantResponseToCompanySettings(tenant),
                  isLoading: false,
                  auditLogs: [
                    {
                      id: `log-${Date.now()}`,
                      userName: 'أنت',
                      actionText: 'قام بتحديث الإعدادات العامة للشركة',
                      timeText: getCurrentTimeArabic(),
                      icon: 'settings_suggest',
                      iconColor: 'text-primary'
                    },
                    ...state.auditLogs
                  ]
                }));
              },
              error: (err: any) => patchState(store, { error: err.message || 'فشل في تحديث إعدادات الشركة', isLoading: false }),
            })
          )
        )
      )
    ),

    openAddWhatsAppModal(): void {
      patchState(store, {
        isAddWhatsAppModalOpen: true,
        whatsAppTestResult: null,
        whatsAppError: null,
      });
    },

    closeAddWhatsAppModal(): void {
      patchState(store, {
        isAddWhatsAppModalOpen: false,
        whatsAppTestResult: null,
        whatsAppError: null,
      });
    },

    openEditWhatsAppModal(acc: WhatsAppAccount): void {
      patchState(store, {
        isEditWhatsAppModalOpen: true,
        editingWhatsAppAccount: acc,
        whatsAppTestResult: null,
        whatsAppError: null,
      });
    },

    closeEditWhatsAppModal(): void {
      patchState(store, {
        isEditWhatsAppModalOpen: false,
        editingWhatsAppAccount: null,
        whatsAppTestResult: null,
        whatsAppError: null,
      });
    },

    clearWhatsAppTestResult(): void {
      patchState(store, { whatsAppTestResult: null, whatsAppError: null });
    },

    loadWhatsAppAccounts: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isWhatsAppLoading: true, whatsAppError: null })),
        switchMap(() =>
          whatsappApi.getAccounts().pipe(
            tapResponse({
              next: (res) => {
                patchState(store, {
                  whatsappAccounts: res.data || [],
                  isWhatsAppLoading: false,
                });
              },
              error: (err: any) => {
                patchState(store, {
                  whatsAppError: err?.error?.message || err.message || 'فشل في تحميل حسابات الواتساب',
                  isWhatsAppLoading: false,
                });
              },
            })
          )
        )
      )
    ),

    testWhatsAppConnection: rxMethod<TestConnectionDto>(
      pipe(
        tap(() => patchState(store, { isTestingWhatsAppConnection: true, whatsAppError: null })),
        switchMap((dto) =>
          whatsappApi.testConnection(dto).pipe(
            tapResponse({
              next: (result: any) => {
                const message =
                  result.message ||
                  result.error ||
                  (result.success
                    ? 'تم الاتصال بخوادم Meta بنجاح والرقم متصل وجاهز للاستخدام'
                    : 'فشل فحص الاتصال مع خوادم Meta');
                patchState(store, {
                  whatsAppTestResult: {
                    ...result,
                    message,
                  },
                  isTestingWhatsAppConnection: false,
                });
              },
              error: (err: any) => {
                patchState(store, {
                  whatsAppTestResult: {
                    success: false,
                    message:
                      err?.error?.message ||
                      err?.error?.error ||
                      err?.message ||
                      'فشل فحص الاتصال مع خوادم Meta',
                  },
                  isTestingWhatsAppConnection: false,
                });
              },
            })
          )
        )
      )
    ),

    addWhatsAppAccount: rxMethod<CreateWhatsAppAccountDto>(
      pipe(
        tap(() => patchState(store, { isWhatsAppLoading: true, whatsAppError: null })),
        switchMap((dto) =>
          whatsappApi.createAccount(dto).pipe(
            tapResponse({
              next: (acc) => {
                patchState(store, (state) => ({
                  whatsappAccounts: [acc, ...state.whatsappAccounts],
                  isAddWhatsAppModalOpen: false,
                  isWhatsAppLoading: false,
                  auditLogs: [
                    {
                      id: `log-${Date.now()}`,
                      userName: 'أنت',
                      actionText: `قام بإضافة رقم واتساب سحابي جديد: "${acc.name}" (${acc.phone_number})`,
                      timeText: getCurrentTimeArabic(),
                      icon: 'chat',
                      iconColor: 'text-secondary',
                    },
                    ...state.auditLogs,
                  ],
                }));
              },
              error: (err: any) => {
                patchState(store, {
                  whatsAppError: err?.error?.message || err.message || 'فشل في إضافة حساب الواتساب',
                  isWhatsAppLoading: false,
                });
              },
            })
          )
        )
      )
    ),

    updateWhatsAppAccount: rxMethod<{ id: string; dto: UpdateWhatsAppAccountDto }>(
      pipe(
        tap(() => patchState(store, { isWhatsAppLoading: true, whatsAppError: null })),
        switchMap(({ id, dto }) =>
          whatsappApi.updateAccount(id, dto).pipe(
            tapResponse({
              next: (updated) => {
                patchState(store, (state) => ({
                  whatsappAccounts: state.whatsappAccounts.map((a) => (a.id === id ? updated : (dto.is_default ? { ...a, is_default: false } : a))),
                  isEditWhatsAppModalOpen: false,
                  editingWhatsAppAccount: null,
                  isWhatsAppLoading: false,
                  auditLogs: [
                    {
                      id: `log-${Date.now()}`,
                      userName: 'أنت',
                      actionText: `قام بتحديث بيانات رقم واتساب: "${updated.name}" (${updated.phone_number})`,
                      timeText: getCurrentTimeArabic(),
                      icon: 'edit',
                      iconColor: 'text-primary',
                    },
                    ...state.auditLogs,
                  ],
                }));
              },
              error: (err: any) => {
                patchState(store, {
                  whatsAppError: err?.error?.message || err.message || 'فشل في تحديث حساب الواتساب',
                  isWhatsAppLoading: false,
                });
              },
            })
          )
        )
      )
    ),

    deleteWhatsAppAccount: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isWhatsAppLoading: true, whatsAppError: null })),
        switchMap((id) => {
          const target = store.whatsappAccounts().find((a) => a.id === id);
          const name = target ? target.name : 'رقم واتساب';
          return whatsappApi.deleteAccount(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, (state) => ({
                  whatsappAccounts: state.whatsappAccounts.filter((a) => a.id !== id),
                  isWhatsAppLoading: false,
                  auditLogs: [
                    {
                      id: `log-${Date.now()}`,
                      userName: 'أنت',
                      actionText: `قام بحذف رقم واتساب: "${name}"`,
                      timeText: getCurrentTimeArabic(),
                      icon: 'delete',
                      iconColor: 'text-error',
                    },
                    ...state.auditLogs,
                  ],
                }));
              },
              error: (err: any) => {
                patchState(store, {
                  whatsAppError: err?.error?.message || err.message || 'فشل في حذف حساب الواتساب',
                  isWhatsAppLoading: false,
                });
              },
            })
          );
        })
      )
    ),

    setDefaultWhatsAppAccount: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isWhatsAppLoading: true, whatsAppError: null })),
        switchMap((id) =>
          whatsappApi.updateAccount(id, { is_default: true }).pipe(
            tapResponse({
              next: (updated) => {
                patchState(store, (state) => ({
                  whatsappAccounts: state.whatsappAccounts.map((a) => ({
                    ...a,
                    is_default: a.id === id,
                  })),
                  isWhatsAppLoading: false,
                  auditLogs: [
                    {
                      id: `log-${Date.now()}`,
                      userName: 'أنت',
                      actionText: `تم تعيين رقم "${updated.name}" كرقم واتساب افتراضي للإرسال`,
                      timeText: getCurrentTimeArabic(),
                      icon: 'star',
                      iconColor: 'text-amber-500',
                    },
                    ...state.auditLogs,
                  ],
                }));
              },
              error: (err: any) => {
                patchState(store, {
                  whatsAppError: err?.error?.message || err.message || 'فشل في تعيين الحساب الافتراضي',
                  isWhatsAppLoading: false,
                });
              },
            })
          )
        )
      )
    ),

    // RingCentral Methods
    clearRingcentralTestResult(): void {
      patchState(store, { ringcentralTestResult: null, ringcentralError: null, webhookRegisterResult: null });
    },

    loadRingcentralConfig: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isRingcentralLoading: true, ringcentralError: null })),
        switchMap(() =>
          ringcentralApi.getConfig().pipe(
            tapResponse({
              next: (cfg) => {
                patchState(store, { ringcentralConfig: cfg, isRingcentralLoading: false });
              },
              error: (err: any) => {
                patchState(store, {
                  ringcentralError: err?.error?.message || err.message || 'فشل في تحميل إعدادات RingCentral',
                  isRingcentralLoading: false,
                });
              },
            })
          )
        )
      )
    ),

    saveRingcentralConfig: rxMethod<any>(
      pipe(
        tap(() => patchState(store, { isSavingRingcentralConfig: true, ringcentralError: null })),
        switchMap((dto) =>
          ringcentralApi.updateConfig(dto).pipe(
            tapResponse({
              next: (saved) => {
                patchState(store, (state) => ({
                  ringcentralConfig: saved,
                  isSavingRingcentralConfig: false,
                  auditLogs: [
                    {
                      id: `log-${Date.now()}`,
                      userName: 'أنت',
                      actionText: 'قام بتحديث إعدادات ربط بوابة المكالمات والرسائل RingCentral',
                      timeText: getCurrentTimeArabic(),
                      icon: 'phone_in_talk',
                      iconColor: 'text-primary',
                    },
                    ...state.auditLogs,
                  ],
                }));
              },
              error: (err: any) => {
                patchState(store, {
                  ringcentralError: err?.error?.message || err.message || 'فشل في حفظ إعدادات RingCentral',
                  isSavingRingcentralConfig: false,
                });
              },
            })
          )
        )
      )
    ),

    testRingcentralConnection: rxMethod<any>(
      pipe(
        tap(() => patchState(store, { isTestingRingcentralConnection: true, ringcentralError: null, ringcentralTestResult: null })),
        switchMap((dto) =>
          ringcentralApi.testConnection(dto).pipe(
            tapResponse({
              next: (result) => {
                const message =
                  result.message ||
                  (result.success
                    ? 'تم فحص الاتصال مع خوادم RingCentral بنجاح والتطبيق جاهز للمكالمات والرسائل'
                    : 'فشل التحقق من الاتصال بخوادم RingCentral');
                patchState(store, {
                  ringcentralTestResult: {
                    ...result,
                    message,
                  },
                  isTestingRingcentralConnection: false,
                });
              },
              error: (err: any) => {
                patchState(store, {
                  ringcentralTestResult: {
                    success: false,
                    message:
                      err?.error?.message ||
                      err?.error?.error ||
                      err?.message ||
                      'فشل فحص الاتصال مع خوادم RingCentral. يرجى التحقق من صحة المعرفات والتوكن.',
                  },
                  isTestingRingcentralConnection: false,
                });
              },
            })
          )
        )
      )
    ),

    registerRingcentralWebhook: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isRegisteringWebhook: true, webhookRegisterResult: null })),
        switchMap((url) =>
          ringcentralApi.subscribeWebhook(url).pipe(
            tapResponse({
              next: (res: any) => {
                patchState(store, {
                  isRegisteringWebhook: false,
                  webhookRegisterResult: {
                    success: true,
                    message: res?.message || 'تم تسجيل اشتراك الويب هوك مع RingCentral بنجاح',
                  },
                });
              },
              error: (err: any) => {
                patchState(store, {
                  isRegisteringWebhook: false,
                  webhookRegisterResult: {
                    success: false,
                    message: err?.error?.message || err.message || 'فشل في تسجيل الويب هوك لدى RingCentral',
                  },
                });
              },
            })
          )
        )
      )
    ),

    // Multi-Line RingCentral Phone Numbers Methods
    loadRingcentralPhoneNumbers: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isRingcentralPhoneNumbersLoading: true })),
        switchMap(() =>
          ringcentralApi.getPhoneNumbers().pipe(
            tapResponse({
              next: (numbers) => {
                patchState(store, {
                  ringcentralPhoneNumbers: numbers || [],
                  isRingcentralPhoneNumbersLoading: false,
                });
              },
              error: () => {
                patchState(store, { isRingcentralPhoneNumbersLoading: false });
              },
            })
          )
        )
      )
    ),

    createRingcentralPhoneNumber: rxMethod<Partial<RingcentralPhoneNumberModel>>(
      pipe(
        tap(() => patchState(store, { isRingcentralPhoneNumbersLoading: true })),
        switchMap((dto) =>
          ringcentralApi.createPhoneNumber(dto).pipe(
            tapResponse({
              next: (newLine) => {
                patchState(store, (state) => ({
                  ringcentralPhoneNumbers: [
                    newLine,
                    ...state.ringcentralPhoneNumbers.map((l) => (newLine.is_default ? { ...l, is_default: false } : l)),
                  ],
                  isRingcentralPhoneNumbersLoading: false,
                  auditLogs: [
                    {
                      id: `log-${Date.now()}`,
                      userName: 'أنت',
                      actionText: `قام بإضافة خط RingCentral جديد: "${newLine.label}" (${newLine.phone_number})`,
                      timeText: getCurrentTimeArabic(),
                      icon: 'add_call',
                      iconColor: 'text-indigo-600',
                    },
                    ...state.auditLogs,
                  ],
                }));
              },
              error: (err: any) => {
                patchState(store, {
                  isRingcentralPhoneNumbersLoading: false,
                  ringcentralError: err?.error?.message || err.message || 'فشل في إضافة خط الهاتف',
                });
              },
            })
          )
        )
      )
    ),

    updateRingcentralPhoneNumber: rxMethod<{ id: string; dto: Partial<RingcentralPhoneNumberModel> }>(
      pipe(
        tap(() => patchState(store, { isRingcentralPhoneNumbersLoading: true })),
        switchMap(({ id, dto }) =>
          ringcentralApi.updatePhoneNumber(id, dto).pipe(
            tapResponse({
              next: (updated) => {
                patchState(store, (state) => ({
                  ringcentralPhoneNumbers: state.ringcentralPhoneNumbers.map((l) =>
                    l.id === id ? updated : (updated.is_default ? { ...l, is_default: false } : l)
                  ),
                  isRingcentralPhoneNumbersLoading: false,
                }));
              },
              error: () => {
                patchState(store, { isRingcentralPhoneNumbersLoading: false });
              },
            })
          )
        )
      )
    ),

    deleteRingcentralPhoneNumber: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isRingcentralPhoneNumbersLoading: true })),
        switchMap((id) => {
          const line = store.ringcentralPhoneNumbers().find((l) => l.id === id);
          const name = line ? line.label : 'خط هاتفي';
          return ringcentralApi.deletePhoneNumber(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, (state) => ({
                  ringcentralPhoneNumbers: state.ringcentralPhoneNumbers.filter((l) => l.id !== id),
                  isRingcentralPhoneNumbersLoading: false,
                  auditLogs: [
                    {
                      id: `log-${Date.now()}`,
                      userName: 'أنت',
                      actionText: `قام بإزالة خط RingCentral: "${name}"`,
                      timeText: getCurrentTimeArabic(),
                      icon: 'phone_disabled',
                      iconColor: 'text-rose-600',
                    },
                    ...state.auditLogs,
                  ],
                }));
              },
              error: () => {
                patchState(store, { isRingcentralPhoneNumbersLoading: false });
              },
            })
          );
        })
      )
    ),

    setDefaultRingcentralPhoneNumber: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isRingcentralPhoneNumbersLoading: true })),
        switchMap((id) =>
          ringcentralApi.setDefaultPhoneNumber(id).pipe(
            tapResponse({
              next: (updated) => {
                patchState(store, (state) => ({
                  ringcentralPhoneNumbers: state.ringcentralPhoneNumbers.map((l) => ({
                    ...l,
                    is_default: l.id === id,
                  })),
                  isRingcentralPhoneNumbersLoading: false,
                  auditLogs: [
                    {
                      id: `log-${Date.now()}`,
                      userName: 'أنت',
                      actionText: `تم تعيين خط "${updated.label}" (${updated.phone_number}) كخط افتراضي للمنشأة`,
                      timeText: getCurrentTimeArabic(),
                      icon: 'star',
                      iconColor: 'text-amber-500',
                    },
                    ...state.auditLogs,
                  ],
                }));
              },
              error: () => {
                patchState(store, { isRingcentralPhoneNumbersLoading: false });
              },
            })
          )
        )
      )
    ),

    syncRingcentralPhoneNumbers: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isSyncingRingcentralPhoneNumbers: true })),
        switchMap(() =>
          ringcentralApi.syncPhoneNumbers().pipe(
            tapResponse({
              next: (res) => {
                patchState(store, {
                  ringcentralPhoneNumbers: res.numbers || [],
                  isSyncingRingcentralPhoneNumbers: false,
                });
              },
              error: (err: any) => {
                patchState(store, {
                  isSyncingRingcentralPhoneNumbers: false,
                  ringcentralError: err?.error?.message || err.message || 'فشل مزامنة الأرقام من RingCentral',
                });
              },
            })
          )
        )
      )
    )

  }))
);

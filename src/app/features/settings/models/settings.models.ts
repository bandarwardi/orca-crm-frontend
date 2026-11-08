import { formatDateEn } from '../../../core/utils/date-format.util';

export type UserRole = 'admin' | 'sales_supervisor' | 'sales_rep' | 'tech_support';

export type SettingsTab = 'team' | 'company' | 'integrations' | 'audit_log';

export interface RoleInfo {
  id: UserRole;
  titleAr: string;
  descriptionAr: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
}

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: UserRole;
  isOnline: boolean;
  isRecentlyActive?: boolean;
  statusIcon?: string;
  statusColor?: string;
  lastSeenText: string;
  isActive: boolean;
  avatarGradient?: string;
  avatarBg?: string;
  avatarText?: string;
  phone?: string;
}

export interface NewMemberDto {
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export interface PermissionFeature {
  key: string;
  nameAr: string;
  categoryAr: string;
  adminAllowed: boolean;
  supervisorAllowed: boolean;
  salesAllowed: boolean;
  supportAllowed: boolean;
}

export interface AuditLogEntry {
  id: string;
  userName: string;
  actionText: string;
  timeText: string;
  icon: string;
  iconColor: string;
}

export interface CompanySettings {
  companyName: string;
  adminEmail: string;
  currency: string;
  timeZone: string;
}

import { UserResponse } from '../../../core/services/api/users-api.service';

export function mapUserResponseToTeamMember(user: UserResponse): TeamMember {
  const parts = user.name.trim().split(' ');
  const initials = parts.length > 1 ? `${parts[0][0]}.${parts[parts.length - 1][0]}` : user.name.slice(0, 2);

  let avatarBg = 'bg-surface-container-high text-on-surface-variant';
  let avatarGradient: string | undefined = undefined;

  if (user.role === 'admin') {
    avatarGradient = 'bg-gradient-to-br from-primary to-primary-container text-on-primary';
  } else if (user.role === 'sales_supervisor') {
    avatarBg = 'bg-surface-container-highest text-primary-container';
  } else if (user.role === 'tech_support') {
    avatarBg = 'bg-tertiary-fixed text-on-tertiary-fixed-variant';
  }

  return {
    id: user.id,
    name: user.name,
    initials: initials,
    email: user.email,
    role: user.role,
    isOnline: user.is_online,
    isActive: user.is_active,
    lastSeenText: user.is_online ? 'متصل الآن' : user.last_seen_at ? `آخر ظهور: ${formatDateEn(user.last_seen_at)}` : 'غير متصل',
    avatarBg: avatarBg,
    avatarGradient: avatarGradient,
    phone: user.phone || undefined,
    statusIcon: user.is_active ? (user.is_online ? 'check_circle' : 'schedule') : 'block',
    statusColor: user.is_active ? (user.is_online ? 'text-secondary' : '') : 'text-error',
  };
}
import { TenantResponse } from '../../../core/services/api/tenants-api.service';

export function mapTenantResponseToCompanySettings(tenant: TenantResponse): CompanySettings {
  return {
    companyName: tenant.name,
    adminEmail: tenant.email || '',
    currency: tenant.currency,
    timeZone: tenant.timezone
  };
}

export type {
  WhatsAppAccount,
  CreateWhatsAppAccountDto,
  UpdateWhatsAppAccountDto,
  TestConnectionDto,
  TestConnectionResponse
} from '../../../core/services/api/whatsapp-api.service';

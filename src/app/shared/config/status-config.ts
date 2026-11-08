export type LeadStatusKey = 'new' | 'interested' | 'follow_up' | 'negotiation' | 'won' | 'closed';

export interface LeadStatusStyle {
  readonly label: string;
  readonly bg: string;
  readonly text: string;
  readonly darkBg?: string;
  readonly darkText?: string;
}

/**
 * Single source of truth for Lead statuses/stages across the entire CRM.
 * Used in Modal badges, Kanban columns, Table views, Filter chips, and Cards.
 */
export const LEAD_STATUS_CONFIG = {
  new:          { label: 'جديد',        bg: '#EEF2FF', text: '#4F46E5', darkBg: 'rgba(99, 102, 241, 0.2)', darkText: '#E0E7FF' },
  interested:   { label: 'مهتم',        bg: '#ECFDF5', text: '#059669', darkBg: 'rgba(16, 185, 129, 0.2)', darkText: '#A7F3D0' },
  follow_up:    { label: 'متابعة',      bg: '#F1F5F9', text: '#475569', darkBg: 'rgba(71, 85, 105, 0.25)', darkText: '#CBD5E1' },
  negotiation:  { label: 'مفاوضات',     bg: '#FFFBEB', text: '#D97706', darkBg: 'rgba(245, 158, 11, 0.2)', darkText: '#FDE68A' },
  won:          { label: 'فوز/نهائي',   bg: '#FDF2F8', text: '#DB2777', darkBg: 'rgba(219, 39, 119, 0.2)', darkText: '#FBCFE8' },
  closed:       { label: 'مغلق',        bg: '#F1F5F9', text: '#64748B', darkBg: 'rgba(100, 116, 139, 0.2)', darkText: '#94A3B8' },
} as const;

export type LeadStatusConfigMap = typeof LEAD_STATUS_CONFIG;

/**
 * Normalizes stage/status strings (e.g. 'converted' -> 'won', 'followup' -> 'follow_up')
 * and returns the canonical status configuration.
 */
export function getLeadStatusConfig(keyOrLabel: string | null | undefined): LeadStatusStyle {
  if (!keyOrLabel) return LEAD_STATUS_CONFIG.new;

  const normalized = keyOrLabel.trim().toLowerCase();

  // Direct key lookup
  if (normalized in LEAD_STATUS_CONFIG) {
    return LEAD_STATUS_CONFIG[normalized as LeadStatusKey];
  }

  // Alias lookups for backend/legacy compatibility
  if (normalized === 'converted' || normalized === 'win') return LEAD_STATUS_CONFIG.won;
  if (normalized === 'followup' || normalized === 'follow-up') return LEAD_STATUS_CONFIG.follow_up;

  // Label matches
  if (keyOrLabel === 'جديد') return LEAD_STATUS_CONFIG.new;
  if (keyOrLabel === 'مهتم') return LEAD_STATUS_CONFIG.interested;
  if (keyOrLabel === 'متابعة') return LEAD_STATUS_CONFIG.follow_up;
  if (keyOrLabel === 'مفاوضات' || keyOrLabel === 'تفاوض') return LEAD_STATUS_CONFIG.negotiation;
  if (keyOrLabel.includes('فوز') || keyOrLabel.includes('نهائي') || keyOrLabel.includes('محول')) return LEAD_STATUS_CONFIG.won;
  if (keyOrLabel === 'مغلق' || keyOrLabel.includes('غير مهتم')) return LEAD_STATUS_CONFIG.closed;

  return LEAD_STATUS_CONFIG.new;
}

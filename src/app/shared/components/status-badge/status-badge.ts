import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LEAD_STATUS_CONFIG, getLeadStatusConfig, LeadStatusKey } from '../../config/status-config';

export type BadgeStatusType = 
  | LeadStatusKey
  | 'followup'
  | 'active' 
  | 'pending' 
  | 'expired' 
  | 'trial' 
  | 'vip' 
  | 'default';

/**
 * StatusBadge Component
 * Displays a pill-shaped status indicator with a colored dot and tinted background (no border).
 * Driven by the single source of truth LEAD_STATUS_CONFIG.
 * 
 * Usage: 
 * <app-status-badge status="new" label="جديد"></app-status-badge>
 * <app-status-badge [status]="lead.stage"></app-status-badge>
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full font-label-sm font-semibold tracking-tight transition-colors"
      [ngClass]="resolvedClasses().badge"
    >
      <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" [ngClass]="resolvedClasses().dot"></span>
      <span>{{ displayLabel() }}</span>
    </span>
  `
})
export class StatusBadge {
  status = input<BadgeStatusType | string>('default');
  label = input<string>('');

  private statusStyle = computed(() => {
    const rawLabel = (this.label() || '').trim();
    const rawStatus = (this.status() || '').toLowerCase();

    // Check for domain specific status: expired / overdue (rose)
    if (rawLabel.includes('منتهي') || rawLabel.includes('مفصول') || rawStatus === 'expired') {
      return null;
    }

    return getLeadStatusConfig(rawStatus || rawLabel);
  });

  displayLabel = computed(() => {
    if (this.label()) return this.label();
    const style = this.statusStyle();
    if (style) return style.label;

    switch (this.status()) {
      case 'active': return 'نشط';
      case 'pending': return 'معلق';
      case 'expired': return 'منتهي';
      default: return 'عام';
    }
  });

  resolvedClasses = computed(() => {
    const rawLabel = (this.label() || '').trim();
    const rawStatus = (this.status() || '').toLowerCase();

    // Overdue / Expired / مفصول (Semantic Rose - for Orders/Subscriptions)
    if (rawLabel.includes('منتهي') || rawLabel.includes('مفصول') || rawStatus === 'expired') {
      return {
        badge: 'bg-[#FFF1F2] text-[#E11D48] dark:bg-rose-500/20 dark:text-rose-300',
        dot: 'bg-[#F43F5E] dark:bg-rose-400'
      };
    }

    // 1. جديد (New): #EEF2FF / #4F46E5
    if (rawLabel === 'جديد' || rawStatus === 'new') {
      return {
        badge: 'bg-[#EEF2FF] text-[#4F46E5] dark:bg-brand-500/20 dark:text-brand-100',
        dot: 'bg-[#4F46E5] dark:bg-brand-500'
      };
    }

    // 2. مهتم (Interested) / نشط (Active) / متصل: #ECFDF5 / #059669
    if (rawLabel === 'مهتم' || rawLabel === 'نشط' || rawLabel === 'متصل' || rawStatus === 'interested' || rawStatus === 'active') {
      return {
        badge: 'bg-[#ECFDF5] text-[#059669] dark:bg-emerald-500/20 dark:text-emerald-300',
        dot: 'bg-[#059669] dark:bg-emerald-400'
      };
    }

    // 3. متابعة (Followup): #F1F5F9 / #475569
    if (rawLabel === 'متابعة' || rawStatus === 'follow_up' || rawStatus === 'followup' || rawStatus === 'trial') {
      return {
        badge: 'bg-[#F1F5F9] text-[#475569] dark:bg-slate-700/40 dark:text-slate-200',
        dot: 'bg-[#475569] dark:bg-slate-300'
      };
    }

    // 4. مفاوضات (Negotiations): #FFFBEB / #D97706
    if (rawLabel.includes('مفاوض') || rawLabel === 'تفاوض' || rawLabel.includes('ينتهي') || rawLabel === 'معلق' || rawStatus === 'negotiation' || rawStatus === 'pending') {
      return {
        badge: 'bg-[#FFFBEB] text-[#D97706] dark:bg-amber-500/20 dark:text-amber-300',
        dot: 'bg-[#D97706] dark:bg-amber-400'
      };
    }

    // 5. فوز/نهائي (Won/Final): #FDF2F8 / #DB2777
    if (rawLabel.includes('فوز') || rawLabel.includes('نهائي') || rawLabel.includes('محول') || rawStatus === 'won' || rawStatus === 'converted') {
      return {
        badge: 'bg-[#FDF2F8] text-[#DB2777] dark:bg-pink-500/20 dark:text-pink-300',
        dot: 'bg-[#DB2777] dark:bg-pink-400'
      };
    }

    // 6. مغلق (Closed): #F1F5F9 / #64748B
    if (rawLabel === 'مغلق' || rawLabel.includes('غير مهتم') || rawStatus === 'closed') {
      return {
        badge: 'bg-[#F1F5F9] text-[#64748B] dark:bg-slate-800/80 dark:text-slate-400',
        dot: 'bg-[#64748B] dark:bg-slate-400'
      };
    }

    // Fallback / Default
    return {
      badge: 'bg-[#F1F5F9] text-[#475569] dark:bg-slate-800 dark:text-slate-300',
      dot: 'bg-[#475569] dark:bg-slate-400'
    };
  });
}

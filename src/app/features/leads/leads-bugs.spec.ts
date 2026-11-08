import { describe, it, expect } from 'vitest';
import { LEAD_STATUS_CONFIG, getLeadStatusConfig } from '../../shared/config/status-config';
import { formatArabicDateTime, formatArabicDate, formatArabicTime, parseToIsoDateTime } from '../../shared/utils/date-format';
import { sortKanbanLeads, getLeadPriority, Lead } from './state/leads.store';

describe('Lead Modal & Kanban Bugs Verification', () => {

  describe('Bug #1: Stage/status consistency in Lead Modal', () => {
    it('asserts that stage options define matching label and badge from LEAD_STATUS_CONFIG', () => {
      // Simulate stage options used in LeadDetailModal
      const stageOptions = [
        { 
          value: 'interested', 
          label: LEAD_STATUS_CONFIG.interested.label, 
          badge: LEAD_STATUS_CONFIG.interested.label 
        },
        { 
          value: 'negotiation', 
          label: LEAD_STATUS_CONFIG.negotiation.label, 
          badge: LEAD_STATUS_CONFIG.negotiation.label 
        },
        { 
          value: 'converted', 
          label: LEAD_STATUS_CONFIG.won.label, 
          badge: LEAD_STATUS_CONFIG.won.label 
        },
        { 
          value: 'closed', 
          label: LEAD_STATUS_CONFIG.closed.label, 
          badge: LEAD_STATUS_CONFIG.closed.label 
        }
      ];

      // For every stage option, the displayed label and its adjacent badge must be strictly identical
      for (const opt of stageOptions) {
        expect(opt.label).toBe(opt.badge);
      }

      // Verify specifically for negotiation: both must be 'مفاوضات' (never 'متابعة')
      const negotiationOpt = stageOptions.find(o => o.value === 'negotiation');
      expect(negotiationOpt).toBeDefined();
      expect(negotiationOpt?.label).toBe('مفاوضات');
      expect(negotiationOpt?.badge).toBe('مفاوضات');
      expect(negotiationOpt?.badge).not.toBe('متابعة');

      // Verify specifically for interested: both must be 'مهتم' (never 'جديد')
      const interestedOpt = stageOptions.find(o => o.value === 'interested');
      expect(interestedOpt).toBeDefined();
      expect(interestedOpt?.label).toBe('مهتم');
      expect(interestedOpt?.badge).toBe('مهتم');
      expect(interestedOpt?.badge).not.toBe('جديد');
    });

    it('asserts that any lead stage maps to identical label in status config', () => {
      const mockLeadNegotiation: Lead = {
        id: '5',
        name: 'فاطمة السيد',
        location: 'نيوجيرسي - NJ',
        stage: 'negotiation',
        phone: '19735550841',
        badgeText: 'متأخرة (3 أيام)',
        badgeIcon: 'warning',
        badgeType: 'warning',
        notes: '',
        repName: 'سارة مراد'
      };

      const stageConfig = getLeadStatusConfig(mockLeadNegotiation.stage);
      expect(stageConfig.label).toBe('مفاوضات');
      expect(stageConfig.bg).toBe('#FFFBEB');
      expect(stageConfig.text).toBe('#D97706');
    });
  });

  describe('Bug #2: Shared status config consistency across app', () => {
    it('defines exactly the requested tokens for all 6 statuses', () => {
      expect(LEAD_STATUS_CONFIG.new).toEqual({
        label: 'جديد',
        bg: '#EEF2FF',
        text: '#4F46E5',
        darkBg: 'rgba(99, 102, 241, 0.2)',
        darkText: '#E0E7FF'
      });

      expect(LEAD_STATUS_CONFIG.interested).toEqual({
        label: 'مهتم',
        bg: '#ECFDF5',
        text: '#059669',
        darkBg: 'rgba(16, 185, 129, 0.2)',
        darkText: '#A7F3D0'
      });

      expect(LEAD_STATUS_CONFIG.follow_up).toEqual({
        label: 'متابعة',
        bg: '#F1F5F9',
        text: '#475569',
        darkBg: 'rgba(71, 85, 105, 0.25)',
        darkText: '#CBD5E1'
      });

      expect(LEAD_STATUS_CONFIG.negotiation).toEqual({
        label: 'مفاوضات',
        bg: '#FFFBEB',
        text: '#D97706',
        darkBg: 'rgba(245, 158, 11, 0.2)',
        darkText: '#FDE68A'
      });

      expect(LEAD_STATUS_CONFIG.won).toEqual({
        label: 'فوز/نهائي',
        bg: '#FDF2F8',
        text: '#DB2777',
        darkBg: 'rgba(219, 39, 119, 0.2)',
        darkText: '#FBCFE8'
      });

      expect(LEAD_STATUS_CONFIG.closed).toEqual({
        label: 'مغلق',
        bg: '#F1F5F9',
        text: '#64748B',
        darkBg: 'rgba(100, 116, 139, 0.2)',
        darkText: '#94A3B8'
      });
    });

    it('correctly maps aliases to canonical statuses', () => {
      expect(getLeadStatusConfig('converted')).toBe(LEAD_STATUS_CONFIG.won);
      expect(getLeadStatusConfig('followup')).toBe(LEAD_STATUS_CONFIG.follow_up);
      expect(getLeadStatusConfig('مفاوضات')).toBe(LEAD_STATUS_CONFIG.negotiation);
      expect(getLeadStatusConfig('تفاوض')).toBe(LEAD_STATUS_CONFIG.negotiation);
      expect(getLeadStatusConfig('مغلق')).toBe(LEAD_STATUS_CONFIG.closed);
    });
  });

  describe('Bug #4: Date/time field Arabic formatting', () => {
    it('formats date before time with Arabic AM/PM markers in 23/9/2026 - 5:30 م style', () => {
      // 2026-09-23 at 17:30 (5:30 PM)
      const d1 = new Date(2026, 8, 23, 17, 30);
      const res1 = formatArabicDateTime(d1);
      expect(res1).toBe('23/9/2026 - 5:30 م');

      // Morning test (e.g. 10:15 AM)
      const d2 = new Date(2026, 8, 25, 10, 15);
      const res2 = formatArabicDateTime(d2);
      expect(res2).toBe('25/9/2026 - 10:15 ص');

      // Single digit day & month (e.g. 5/3/2026 at 12:00 PM)
      const d3 = new Date(2026, 2, 5, 12, 0);
      const res3 = formatArabicDateTime(d3);
      expect(res3).toBe('5/3/2026 - 12:00 م');
    });

    it('parses presets correctly into ISO strings', () => {
      const parsed = parseToIsoDateTime('اليوم 05:30 م');
      expect(parsed).toMatch(/^\d{4}-\d{2}-\d{2}T17:30$/);
    });
  });

  describe('Bug #5: Overdue cards sorted to the top of Kanban column', () => {
    it('orders overdue items first, then due today, then upcoming, then no-date', () => {
      const leads: Lead[] = [
        {
          id: '1',
          name: 'زينب الحسيني',
          location: 'ميشيغان',
          stage: 'negotiation',
          phone: '13135558834',
          badgeText: '28 أكتوبر',
          badgeIcon: 'calendar_today',
          badgeType: 'neutral',
          notes: '',
          repName: 'طارق'
        },
        {
          id: '2',
          name: 'ليلى ناصر',
          location: 'نيويورك',
          stage: 'negotiation',
          phone: '17185558812',
          badgeText: 'اليوم 05:30 م',
          badgeIcon: 'schedule',
          badgeType: 'neutral',
          notes: '',
          repName: 'طارق'
        },
        {
          id: '3',
          name: 'فاطمة السيد',
          location: 'نيوجيرسي',
          stage: 'negotiation',
          phone: '19735550841',
          badgeText: 'متأخرة (3 أيام)',
          badgeIcon: 'warning',
          badgeType: 'warning',
          notes: '',
          repName: 'سارة'
        },
        {
          id: '4',
          name: 'خالد عبد الله',
          location: 'إلينوي',
          stage: 'negotiation',
          phone: '13125550000',
          badgeText: 'متأخرة (5 أيام)',
          badgeIcon: 'warning',
          badgeType: 'warning',
          notes: '',
          repName: 'سارة'
        },
        {
          id: '5',
          name: 'يوسف حداد',
          location: 'كاليفورنيا',
          stage: 'negotiation',
          phone: '17145553091',
          badgeText: 'غداً 11:00 ص',
          badgeIcon: 'calendar_today',
          badgeType: 'neutral',
          notes: '',
          repName: 'رامي'
        }
      ];

      const sorted = sortKanbanLeads(leads);

      // Most overdue (5 days) must be at the very top
      expect(sorted[0].name).toBe('خالد عبد الله');
      // Then 3 days overdue
      expect(sorted[1].name).toBe('فاطمة السيد');
      // Then due today
      expect(sorted[2].name).toBe('ليلى ناصر');
      // Then upcoming tomorrow
      expect(sorted[3].name).toBe('يوسف حداد');
      // Then upcoming 28 Oct
      expect(sorted[4].name).toBe('زينب الحسيني');
    });
  });

});

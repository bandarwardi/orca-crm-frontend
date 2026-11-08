import { computed, inject } from '@angular/core';
import { LeadsApiService } from '../../../core/services/api/leads-api.service';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { matchesPhone, normalizeArabicSearch } from '../../../shared/pipes/phone-format.pipe';
import { formatDateEn, formatDateTimeEn } from '../../../core/utils/date-format.util';

export type LeadStage = 'interested' | 'negotiation' | 'converted' | 'closed';

export interface LeadNote {
  id: string;
  author: string;
  timestamp: string;
  text: string;
  type?: 'call' | 'whatsapp' | 'status_change' | 'general';
}

export interface Lead {
  id: string;
  name: string;
  location: string;
  stage: LeadStage;
  phone: string;
  badgeText: string;
  badgeIcon: string;
  badgeType: 'primary' | 'warning' | 'success' | 'neutral' | 'muted';
  notes: string;
  timelineNotes?: LeadNote[];
  repName: string;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
  email?: string;
  price?: string;
  followupDate?: string;
}

export interface LeadsState {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  viewMode: 'kanban' | 'table';
  searchQuery: string;
}

const initialState: LeadsState = {
  leads: [],
  isLoading: false, error: null as string | null,
  viewMode: 'kanban',
  searchQuery: ''
};

export function getLeadPriority(lead: Lead): { category: number; priorityKey: number } {
  const text = lead.badgeText || '';

  // 1. Overdue first (most overdue at the very top)
  if (text.includes('متأخرة') || text.includes('متأخر') || (lead.badgeType === 'warning' && text.includes('أيام'))) {
    const match = text.match(/(\d+)/);
    const days = match ? parseInt(match[1], 10) : 1;
    // Higher days overdue appears higher (-5 comes before -3)
    return { category: 1, priorityKey: -days };
  }

  // 2. Due today (sorted by time of day, earliest first)
  if (text.includes('اليوم')) {
    const timeMatch = text.match(/(\d{1,2}):(\d{2})\s*(م|ص)/);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3];
      if (ampm === 'م' && h < 12) h += 12;
      if (ampm === 'ص' && h === 12) h = 0;
      return { category: 2, priorityKey: h * 60 + m };
    }
    return { category: 2, priorityKey: 720 };
  }

  // 3. Upcoming (by soonest date)
  if (text.includes('غداً')) {
    const timeMatch = text.match(/(\d{1,2}):(\d{2})\s*(م|ص)/);
    let extra = 0;
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3];
      if (ampm === 'م' && h < 12) h += 12;
      if (ampm === 'ص' && h === 12) h = 0;
      extra = h * 60 + m;
    }
    return { category: 3, priorityKey: 10000 + extra };
  }

  if (text.includes('بعد يومين')) {
    return { category: 3, priorityKey: 20000 };
  }

  if (text.includes('الأسبوع القادم') || text.includes('أكتوبر') || text.includes('نوفمبر') || text.includes('ديسمبر')) {
    return { category: 3, priorityKey: 30000 };
  }

  if (lead.followupDate) {
    const d = new Date(lead.followupDate);
    if (!isNaN(d.getTime())) {
      const now = new Date();
      if (d.toDateString() === now.toDateString()) {
        return { category: 2, priorityKey: d.getHours() * 60 + d.getMinutes() };
      }
      if (d.getTime() < now.getTime()) {
        const diffDays = Math.ceil((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        return { category: 1, priorityKey: -diffDays };
      }
      return { category: 3, priorityKey: d.getTime() };
    }
  }

  // 4. No date / completed / closed items last
  return { category: 4, priorityKey: 0 };
}

export function sortKanbanLeads(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => {
    const pA = getLeadPriority(a);
    const pB = getLeadPriority(b);
    if (pA.category !== pB.category) {
      return pA.category - pB.category;
    }
    return pA.priorityKey - pB.priorityKey;
  });
}

export const LeadsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    filteredLeads: computed(() => {
      const q = store.searchQuery().trim();
      if (!q) return store.leads();
      const normQ = normalizeArabicSearch(q);
      return store.leads().filter(l => 
        matchesPhone(l.phone, q) ||
        normalizeArabicSearch(l.name).includes(normQ) || 
        normalizeArabicSearch(l.location).includes(normQ)
      );
    }),
    interestedLeads: computed(() => sortKanbanLeads(store.leads().filter(l => l.stage === 'interested'))),
    negotiationLeads: computed(() => sortKanbanLeads(store.leads().filter(l => l.stage === 'negotiation'))),
    convertedLeads: computed(() => sortKanbanLeads(store.leads().filter(l => l.stage === 'converted'))),
    closedLeads: computed(() => sortKanbanLeads(store.leads().filter(l => l.stage === 'closed'))),
    totalLeadsCount: computed(() => store.leads().length)
  })),
  withMethods((store, api = inject(LeadsApiService)) => ({
    loadLeads() {
      patchState(store, { isLoading: true });
      api.getAll().subscribe({
        next: (res: any) => {
          const list: any[] = Array.isArray(res) ? res : (res?.data || []);
          const leads: Lead[] = list.map(item => {
            const badgeType = item.stage === 'converted' ? 'success' :
                              item.stage === 'closed' ? 'muted' :
                              item.stage === 'negotiation' ? 'warning' : 'primary';
            const badgeIcon = item.stage === 'converted' ? 'verified' :
                              item.stage === 'closed' ? 'event_busy' :
                              item.stage === 'negotiation' ? 'warning' : 'event_upcoming';
            return {
              id: item.id,
              name: item.customer?.name || 'عميل غير معروف',
              location: item.customer?.city ? `${item.customer.city}${item.customer.state ? ' - ' + item.customer.state : ''}` : '',
              stage: item.stage as LeadStage,
              phone: item.customer?.phone || '',
              badgeText: item.follow_up_at ? formatDateEn(item.follow_up_at) : (item.stage === 'converted' ? 'مكتمل بنجاح' : 'غير محدد'),
              badgeIcon,
              badgeType,
              notes: item.notes?.[0]?.content || '',
              repName: item.assignedTo?.name || 'غير محدد',
              source: item.source,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
              followupDate: item.follow_up_at,
              timelineNotes: item.notes ? item.notes.map((n: any) => ({
                id: n.id,
                author: n.createdBy?.name || 'النظام',
                timestamp: formatDateTimeEn(n.created_at),
                text: n.content,
                type: 'general'
              })) : []
            };
          });
          patchState(store, { leads, isLoading: false });
        },
        error: (err) => {
          patchState(store, { isLoading: false });
          console.error(err);
        }
      });
    },
    setViewMode(mode: 'kanban' | 'table') {
      patchState(store, { viewMode: mode });
    },
    setSearchQuery(query: string) {
      patchState(store, { searchQuery: query });
    },
    updateLeadStage(leadId: string, newStage: LeadStage) {
      patchState(store, (state) => ({
        leads: state.leads.map(lead => 
          lead.id === leadId ? { ...lead, stage: newStage } : lead
        )
      }));
      api.updateStage(leadId, newStage).subscribe({
        error: (err) => console.error('Failed to update stage', err)
      });
    },
    updateLead(updatedData: Partial<Lead> & { id: string }, onSuccess?: () => void, onError?: (err: any) => void) {
      const payload: any = {};
      if (updatedData.name) payload.name = updatedData.name;
      if (updatedData.phone) payload.phone = updatedData.phone;
      if (updatedData.location) payload.location = updatedData.location;
      if (updatedData.stage) payload.stage = updatedData.stage;
      if (updatedData.repName) payload.rep_name = updatedData.repName;
      if (updatedData.followupDate) payload.follow_up_at = updatedData.followupDate;

      api.update(updatedData.id, payload).subscribe({
        next: () => {
          patchState(store, (state) => ({
            leads: state.leads.map(lead => {
              if (lead.id !== updatedData.id) return lead;
              const merged = { ...lead, ...updatedData };
              if (updatedData.stage && !updatedData.badgeIcon) {
                if (updatedData.stage === 'converted') {
                  merged.badgeIcon = 'verified';
                  merged.badgeType = 'success';
                  merged.badgeText = updatedData.badgeText || 'مكتمل بنجاح';
                } else if (updatedData.stage === 'closed') {
                  merged.badgeIcon = 'event_busy';
                  merged.badgeType = 'muted';
                  merged.badgeText = updatedData.badgeText || 'مغلق';
                } else if (updatedData.stage === 'negotiation') {
                  merged.badgeIcon = 'warning';
                  merged.badgeType = 'warning';
                } else {
                  merged.badgeIcon = 'event_upcoming';
                  merged.badgeType = 'primary';
                }
              }
              return merged;
            })
          }));
          if (onSuccess) onSuccess();
        },
        error: (err) => {
          console.error('Failed to update lead in backend', err);
          if (onError) onError(err);
        }
      });
    },
    addLeadNote(leadId: string, noteData: { author: string; text: string; type?: 'call' | 'whatsapp' | 'status_change' | 'general' }) {
      api.addNote(leadId, { text: noteData.text, type: noteData.type }).subscribe();
      patchState(store, (state) => ({
        leads: state.leads.map(lead => {
          if (lead.id !== leadId) return lead;
          const now = new Date();
          const day = now.getDate();
          const month = now.getMonth() + 1;
          const year = now.getFullYear();
          const hours = now.getHours();
          const ampm = hours >= 12 ? 'م' : 'ص';
          const formattedHours = hours % 12 || 12;
          const minutes = String(now.getMinutes()).padStart(2, '0');
          const timestamp = `${day}/${month}/${year} • ${formattedHours}:${minutes} ${ampm}`;

          const newNote: LeadNote = {
            id: Date.now().toString(),
            author: noteData.author || lead.repName || 'الموظف المسؤول',
            timestamp: timestamp,
            text: noteData.text,
            type: noteData.type || 'general'
          };
          const existingNotes = lead.timelineNotes || (lead.notes ? [{
            id: 'legacy',
            author: lead.repName || 'الموظف المسؤول',
            timestamp: lead.createdAt || 'سابقاً',
            text: lead.notes,
            type: 'general' as const
          }] : []);

          return {
            ...lead,
            timelineNotes: [newNote, ...existingNotes],
            notes: noteData.text,
            updatedAt: 'الآن'
          };
        })
      }));
    },
    createLead(leadDto: any, onSuccess?: () => void) {
      api.create(leadDto).subscribe({
        next: (res: any) => {
          const createdItem = res?.data || res;
          // Add manually instead of calling loadLeads() because methods in the same block can't reference each other
          patchState(store, (state) => {
            const mappedItem: Lead = {
              id: createdItem.id,
              name: createdItem.customer?.name || 'عميل جديد',
              location: createdItem.customer?.city ? `${createdItem.customer.city}${createdItem.customer.state ? ' - ' + createdItem.customer.state : ''}` : '',
              stage: createdItem.stage as LeadStage,
              phone: createdItem.customer?.phone || '',
              badgeText: createdItem.follow_up_at ? formatDateEn(createdItem.follow_up_at) : 'غير محدد',
              badgeIcon: 'event_upcoming',
              badgeType: 'primary',
              notes: createdItem.notes?.[0]?.content || '',
              repName: createdItem.assignedTo?.name || 'غير محدد',
              source: createdItem.source,
              createdAt: createdItem.created_at,
              updatedAt: createdItem.updated_at,
              followupDate: createdItem.follow_up_at,
              timelineNotes: []
            };
            return { leads: [mappedItem, ...state.leads] };
          });
          if (onSuccess) onSuccess();
        },
        error: (err) => {
          console.error('Failed to create lead', err);
        }
      });
    }
  }))
);

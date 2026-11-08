import re

file_path = "f:/apps/orca/crm/src/app/features/leads/state/leads.store.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the initial state
initial_state_match = re.search(r"const initialState: LeadsState = \{[\s\S]*?\n\};\n", content)
if initial_state_match:
    new_initial_state = """const initialState: LeadsState = {
  leads: [],
  isLoading: false,
  viewMode: 'kanban',
  searchQuery: ''
};
"""
    content = content.replace(initial_state_match.group(0), new_initial_state)

# Inject LeadsApiService
content = content.replace(
    "import { computed, inject } from '@angular/core';",
    "import { computed, inject } from '@angular/core';\nimport { LeadsApiService } from '../../../core/services/api/leads-api.service';"
)

content = content.replace(
    "withMethods((store) => ({",
    "withMethods((store, api = inject(LeadsApiService)) => ({"
)

# Insert loadLeads
load_leads_str = """
    loadLeads() {
      patchState(store, { isLoading: true });
      api.getAll().subscribe({
        next: (data: any[]) => {
          const leads: Lead[] = data.map(item => {
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
              badgeText: item.follow_up_at ? new Date(item.follow_up_at).toLocaleDateString('ar-SA') : (item.stage === 'converted' ? 'مكتمل بنجاح' : 'غير محدد'),
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
                timestamp: new Date(n.created_at).toLocaleString('ar-SA'),
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
    },"""

content = content.replace(
    "withMethods((store, api = inject(LeadsApiService)) => ({",
    "withMethods((store, api = inject(LeadsApiService)) => ({" + load_leads_str
)

# Update updateLeadStage
update_lead_stage_old = """    updateLeadStage(leadId: string, newStage: LeadStage) {
      patchState(store, (state) => ({
        leads: state.leads.map(lead => 
          lead.id === leadId ? { ...lead, stage: newStage } : lead
        )
      }));
    },"""
update_lead_stage_new = """    updateLeadStage(leadId: string, newStage: LeadStage) {
      patchState(store, (state) => ({
        leads: state.leads.map(lead => 
          lead.id === leadId ? { ...lead, stage: newStage } : lead
        )
      }));
      api.updateStage(leadId, newStage).subscribe({
        error: (err) => console.error('Failed to update stage', err)
      });
    },"""
content = content.replace(update_lead_stage_old, update_lead_stage_new)

# Update addLeadNote
add_note_old = """    addLeadNote(leadId: string, noteData: { author: string; text: string; type?: 'call' | 'whatsapp' | 'status_change' | 'general' }) {
      patchState(store, (state) => ({"""
add_note_new = """    addLeadNote(leadId: string, noteData: { author: string; text: string; type?: 'call' | 'whatsapp' | 'status_change' | 'general' }) {
      api.addNote(leadId, { text: noteData.text, type: noteData.type }).subscribe();
      patchState(store, (state) => ({"""
content = content.replace(add_note_old, add_note_new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done")

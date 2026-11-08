import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KanbanColumn } from '../kanban-column/kanban-column';
import { LeadCard } from '../lead-card/lead-card';
import { LeadsStore, Lead } from '../../state/leads.store';

@Component({
  selector: 'app-kanban-view',
  standalone: true,
  imports: [CommonModule, KanbanColumn, LeadCard],
  host: { class: 'flex-1 flex flex-col min-h-0' },
  template: `
    <div class="overflow-x-auto pb-1 flex-1 min-h-0 custom-scrollbar">
      <div class="flex items-stretch gap-3 h-full min-w-min">
        
        <!-- Column 1: Interested (مهتم) -->
        <app-kanban-column 
          statusKey="interested"
          [count]="store.interestedLeads().length" 
          (addClick)="addLead.emit()">
          @for (lead of store.interestedLeads(); track lead.id) {
            <app-lead-card [lead]="lead" (cardClick)="selectLead.emit($event)"></app-lead-card>
          }
        </app-kanban-column>

        <!-- Column 2: Negotiation (مفاوضات) -->
        <app-kanban-column 
          statusKey="negotiation"
          [count]="store.negotiationLeads().length" 
          (addClick)="addLead.emit()">
          @for (lead of store.negotiationLeads(); track lead.id) {
            <app-lead-card [lead]="lead" (cardClick)="selectLead.emit($event)"></app-lead-card>
          }
        </app-kanban-column>

        <!-- Column 3: Converted / Won (فوز/نهائي) -->
        <app-kanban-column 
          statusKey="won"
          [count]="store.convertedLeads().length" 
          (addClick)="addLead.emit()">
          @for (lead of store.convertedLeads(); track lead.id) {
            <app-lead-card [lead]="lead" (cardClick)="selectLead.emit($event)"></app-lead-card>
          }
        </app-kanban-column>

        <!-- Column 4: Closed (مغلق) -->
        <app-kanban-column 
          statusKey="closed"
          [count]="store.closedLeads().length" 
          (addClick)="addLead.emit()">
          @for (lead of store.closedLeads(); track lead.id) {
            <app-lead-card [lead]="lead" (cardClick)="selectLead.emit($event)"></app-lead-card>
          }
        </app-kanban-column>

      </div>
    </div>
  `
})
export class KanbanView {
  store = inject(LeadsStore);
  selectLead = output<Lead>();
  addLead = output<void>();
}

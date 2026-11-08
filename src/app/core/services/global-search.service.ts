import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OrdersStore } from '../../features/orders/store/orders.store';
import { LeadsStore } from '../../features/leads/state/leads.store';
import { InboxStore } from '../../features/inbox/store/inbox.store';
import { matchesPhone, normalizeArabicSearch } from '../../shared/pipes/phone-format.pipe';

export type SearchResultType = 'order' | 'lead' | 'conversation';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeType?: string;
  route: string[];
  icon: string;
  typeLabel: string;
}

export interface GroupedSearchResults {
  orders: SearchResult[];
  leads: SearchResult[];
  conversations: SearchResult[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {
  private readonly ordersStore = inject(OrdersStore);
  private readonly leadsStore = inject(LeadsStore);
  private readonly inboxStore = inject(InboxStore);
  private readonly router = inject(Router);

  search(rawQuery: string): GroupedSearchResults {
    const rawTrimmed = rawQuery?.trim() || '';
    const normQ = normalizeArabicSearch(rawTrimmed);

    if (rawTrimmed.length < 2) {
      return {
        orders: [],
        leads: [],
        conversations: [],
        totalCount: 0
      };
    }

    // 1. Search Orders
    const matchingOrders: SearchResult[] = this.ordersStore
      .orders()
      .filter(o => {
        const phoneMatch = matchesPhone(o.phone, rawTrimmed);
        if (phoneMatch) return true;
        const num = normalizeArabicSearch(o.orderNumber);
        const name = normalizeArabicSearch(o.customerName);
        const city = normalizeArabicSearch(o.city);
        return num.includes(normQ) || name.includes(normQ) || city.includes(normQ);
      })
      .slice(0, 4)
      .map(o => ({
        type: 'order' as const,
        id: o.id,
        title: o.customerName || 'عميل بدون اسم',
        subtitle: `${o.orderNumber} • ${o.phone} ${o.city ? '• ' + o.city : ''}`,
        badge: o.statusLabel || (o.status === 'active' ? 'نشط' : o.status === 'expiring' ? 'ينتهي قريباً' : 'منتهي'),
        badgeType: o.status,
        route: ['/orders', o.id],
        icon: 'receipt_long',
        typeLabel: 'طلب اشتراك'
      }));

    // 2. Search Leads
    const matchingLeads: SearchResult[] = this.leadsStore
      .leads()
      .filter(l => {
        const phoneMatch = matchesPhone(l.phone, rawTrimmed);
        if (phoneMatch) return true;
        const name = normalizeArabicSearch(l.name);
        const loc = normalizeArabicSearch(l.location);
        const rep = normalizeArabicSearch(l.repName);
        return name.includes(normQ) || loc.includes(normQ) || rep.includes(normQ);
      })
      .slice(0, 4)
      .map(l => ({
        type: 'lead' as const,
        id: l.id,
        title: l.name,
        subtitle: `${l.phone} ${l.location ? '• ' + l.location : ''} • المسؤول: ${l.repName}`,
        badge: l.badgeText || (l.stage === 'converted' ? 'مكتمل' : l.stage === 'negotiation' ? 'تفاوض' : 'مهتم'),
        badgeType: l.badgeType || 'neutral',
        route: ['/leads'],
        icon: 'person_search',
        typeLabel: 'عميل محتمل'
      }));

    // 3. Search Inbox Conversations
    const matchingConversations: SearchResult[] = this.inboxStore
      .conversations()
      .filter(c => {
        const phoneMatch = matchesPhone(c.phone, rawTrimmed);
        if (phoneMatch) return true;
        const name = normalizeArabicSearch(c.contactName);
        const nameEn = (c.contactNameEn || '').toLowerCase();
        const msg = normalizeArabicSearch(c.lastMessage);
        return name.includes(normQ) || nameEn.includes(normQ) || msg.includes(normQ);
      })
      .slice(0, 4)
      .map(c => ({
        type: 'conversation' as const,
        id: c.id,
        title: c.contactName,
        subtitle: `${c.phone} • ${c.lastMessage ? c.lastMessage.slice(0, 36) + '...' : 'لا توجد رسائل'}`,
        badge: c.statusLabel || (c.status === 'needs-reply' ? 'يحتاج رد' : 'مكتمل'),
        badgeType: c.status === 'needs-reply' ? 'warning' : 'neutral',
        route: ['/inbox'],
        icon: 'forum',
        typeLabel: 'محادثة'
      }));

    const totalCount = matchingOrders.length + matchingLeads.length + matchingConversations.length;

    return {
      orders: matchingOrders,
      leads: matchingLeads,
      conversations: matchingConversations,
      totalCount
    };
  }

  navigateToResult(result: SearchResult): void {
    if (result.type === 'conversation') {
      this.inboxStore.selectConversation(result.id);
      this.router.navigate(result.route);
    } else if (result.type === 'lead') {
      this.leadsStore.setSearchQuery(result.title);
      this.router.navigate(result.route);
    } else if (result.type === 'order') {
      this.router.navigate(result.route);
    }
  }
}

import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalSearchService, GroupedSearchResults, SearchResult } from '../../../core/services/global-search.service';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full" dir="rtl">
      <!-- Search Input Container -->
      <div
        class="relative flex items-center w-full transition-all duration-200"
        [class.ring-2]="isOpen()"
        [class.ring-brand-500/20]="isOpen()"
      >
        <span class="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none transition-colors"
              [class.text-brand-600]="isOpen()">
          search
        </span>

        <input
          #searchInput
          type="text"
          [ngModel]="query()"
          (ngModelChange)="onQueryChange($event)"
          (focus)="onInputFocus()"
          (keydown)="onKeyDown($event)"
          class="w-full h-10 pr-10 pl-20 rounded-xl bg-surface border border-border-subtle font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-brand-500 transition-all shadow-xs"
          placeholder="البحث عن عميل، رقم هاتف، أو رقم طلب... (⌘K)"
          autocomplete="off"
          spellcheck="false"
          role="combobox"
          [attr.aria-expanded]="isOpen()"
          aria-haspopup="listbox"
        />

        <!-- Action / Shortcut Pills on the Left in RTL -->
        <div class="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          @if (query().length > 0) {
            <button
              type="button"
              (click)="clearQuery($event)"
              class="w-6 h-6 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
              title="مسح البحث"
            >
              <span class="material-symbols-outlined text-[16px]">close</span>
            </button>
          } @else {
            <div class="hidden sm:flex items-center gap-0.5 pointer-events-none select-none">
              <kbd class="px-1.5 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-code-sm text-[10px] border border-border-subtle shadow-2xs font-semibold">
                {{ isMac ? '⌘' : 'Ctrl' }}
              </kbd>
              <kbd class="px-1.5 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-code-sm text-[10px] border border-border-subtle shadow-2xs font-semibold">
                K
              </kbd>
            </div>
          }
        </div>
      </div>

      <!-- Search Results Dropdown Panel -->
      @if (isOpen()) {
        <div
          class="absolute right-0 left-0 top-full mt-1.5 z-50 bg-surface rounded-2xl border border-border-subtle shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col max-h-[75vh] sm:max-h-[520px] animate-in fade-in zoom-in-95 duration-150"
          role="listbox"
        >
          <!-- Header Bar with Quick Stats & Category Pills -->
          <div class="px-4 py-2.5 bg-surface-alt border-b border-border-subtle flex items-center justify-between text-xs text-on-surface-variant">
            <div class="flex items-center gap-2">
              <span class="font-bold text-on-surface">نتائج البحث</span>
              @if (results().totalCount > 0) {
                <span class="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 font-semibold text-[11px]">
                  {{ results().totalCount }} نتيجة
                </span>
              }
            </div>

            <div class="flex items-center gap-2 text-[11px] text-on-surface-variant/80">
              <span class="hidden sm:inline">استخدم</span>
              <kbd class="px-1 py-0.5 rounded bg-surface border border-border-subtle text-[10px]">↑</kbd>
              <kbd class="px-1 py-0.5 rounded bg-surface border border-border-subtle text-[10px]">↓</kbd>
              <span class="hidden sm:inline">للتنقل و</span>
              <kbd class="px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-[10px]">Enter</kbd>
              <span class="hidden sm:inline">للاختيار</span>
            </div>
          </div>

          <!-- Results Scroll Area -->
          <div class="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar divide-y divide-border-subtle/40">

            <!-- 1. ORDERS SECTION -->
            @if (results().orders.length > 0) {
              <div class="space-y-1 pt-1 first:pt-0">
                <div class="px-3 py-1 text-[11px] font-bold text-on-surface-variant/70 tracking-wider flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[15px] text-brand-600">receipt_long</span>
                  <span>الطلبات والاشتراكات ({{ results().orders.length }})</span>
                </div>

                @for (item of results().orders; track item.id; let idx = $index) {
                  <div
                    (click)="selectItem(item)"
                    (mouseenter)="setHoveredItem(item)"
                    class="p-2.5 px-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
                    [class.bg-brand-50]="isSelected(item)"
                    [class.dark:bg-brand-500/10]="isSelected(item)"
                    [class.hover:bg-surface-container]="!isSelected(item)"
                  >
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-500/20 text-brand-600 flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-[19px]">receipt_long</span>
                      </div>
                      <div class="min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-sm text-on-surface truncate">{{ item.title }}</span>
                          <span class="text-[11px] font-code-sm text-brand-600 font-semibold px-1.5 py-0.2 rounded-md bg-brand-50 dark:bg-brand-500/10">
                            {{ item.route[1] ? ('#' + item.subtitle.split(' • ')[0]) : '' }}
                          </span>
                        </div>
                        <span class="text-xs text-on-surface-variant truncate block mt-0.5">{{ item.subtitle }}</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                      @if (item.badge) {
                        <span
                          class="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                          [ngClass]="{
                            'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300': item.badgeType === 'active',
                            'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300': item.badgeType === 'expiring',
                            'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300': item.badgeType === 'expired'
                          }"
                        >
                          {{ item.badge }}
                        </span>
                      }
                      <span class="material-symbols-outlined text-[18px] text-on-surface-variant/40 group-hover:text-on-surface-variant">arrow_back</span>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- 2. LEADS SECTION -->
            @if (results().leads.length > 0) {
              <div class="space-y-1 pt-2">
                <div class="px-3 py-1 text-[11px] font-bold text-on-surface-variant/70 tracking-wider flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[15px] text-emerald-600">person_search</span>
                  <span>العملاء المحتملون ({{ results().leads.length }})</span>
                </div>

                @for (item of results().leads; track item.id) {
                  <div
                    (click)="selectItem(item)"
                    (mouseenter)="setHoveredItem(item)"
                    class="p-2.5 px-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
                    [class.bg-brand-50]="isSelected(item)"
                    [class.dark:bg-brand-500/10]="isSelected(item)"
                    [class.hover:bg-surface-container]="!isSelected(item)"
                  >
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-[19px]">person_search</span>
                      </div>
                      <div class="min-w-0">
                        <span class="font-bold text-sm text-on-surface truncate block">{{ item.title }}</span>
                        <span class="text-xs text-on-surface-variant truncate block mt-0.5">{{ item.subtitle }}</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                      @if (item.badge) {
                        <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container text-on-surface-variant border border-border-subtle">
                          {{ item.badge }}
                        </span>
                      }
                      <span class="material-symbols-outlined text-[18px] text-on-surface-variant/40">arrow_back</span>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- 3. INBOX CONVERSATIONS SECTION -->
            @if (results().conversations.length > 0) {
              <div class="space-y-1 pt-2">
                <div class="px-3 py-1 text-[11px] font-bold text-on-surface-variant/70 tracking-wider flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[15px] text-blue-600">forum</span>
                  <span>محادثات صندوق الوارد ({{ results().conversations.length }})</span>
                </div>

                @for (item of results().conversations; track item.id) {
                  <div
                    (click)="selectItem(item)"
                    (mouseenter)="setHoveredItem(item)"
                    class="p-2.5 px-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
                    [class.bg-brand-50]="isSelected(item)"
                    [class.dark:bg-brand-500/10]="isSelected(item)"
                    [class.hover:bg-surface-container]="!isSelected(item)"
                  >
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-[19px]">forum</span>
                      </div>
                      <div class="min-w-0">
                        <span class="font-bold text-sm text-on-surface truncate block">{{ item.title }}</span>
                        <span class="text-xs text-on-surface-variant truncate block mt-0.5">{{ item.subtitle }}</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                      @if (item.badge) {
                        <span
                          class="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                          [class.bg-amber-100]="item.badgeType === 'warning'"
                          [class.text-amber-800]="item.badgeType === 'warning'"
                          [class.bg-surface-container]="item.badgeType !== 'warning'"
                        >
                          {{ item.badge }}
                        </span>
                      }
                      <span class="material-symbols-outlined text-[18px] text-on-surface-variant/40">arrow_back</span>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- 4. EMPTY / NO RESULTS STATE -->
            @if (query().trim().length >= 2 && results().totalCount === 0) {
              <div class="py-10 px-4 text-center flex flex-col items-center justify-center gap-2">
                <div class="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant/50">
                  <span class="material-symbols-outlined text-[28px]">search_off</span>
                </div>
                <p class="font-bold text-sm text-on-surface">لم يتم العثور على نتائج</p>
                <p class="text-xs text-on-surface-variant max-w-xs">
                  لا توجد طلبات أو عملاء أو محادثات تطابق بحثك عن <span class="font-bold text-brand-600">"{{ query() }}"</span>.
                </p>
              </div>
            }

            <!-- 5. INITIAL PROMPT STATE (query < 2 chars) -->
            @if (query().trim().length < 2) {
              <div class="py-6 px-4 space-y-4">
                <div class="text-center space-y-1">
                  <span class="material-symbols-outlined text-[32px] text-brand-600/70">manage_search</span>
                  <p class="text-xs font-semibold text-on-surface">بحث عام فوري في كافة أقسام النظام</p>
                  <p class="text-[11px] text-on-surface-variant">اكتب حرفين أو أكثر للبحث في الطلبات، المشتركين، والمحادثات</p>
                </div>

                <div class="grid grid-cols-3 gap-2 pt-2 border-t border-border-subtle/50 text-center">
                  <div class="p-2 rounded-xl bg-surface-alt border border-border-subtle/60 flex flex-col items-center gap-1">
                    <span class="material-symbols-outlined text-[18px] text-brand-600">receipt_long</span>
                    <span class="text-[11px] font-bold text-on-surface">الطلبات</span>
                    <span class="text-[10px] text-on-surface-variant">برقم الطلب أو الهاتف</span>
                  </div>
                  <div class="p-2 rounded-xl bg-surface-alt border border-border-subtle/60 flex flex-col items-center gap-1">
                    <span class="material-symbols-outlined text-[18px] text-emerald-600">person_search</span>
                    <span class="text-[11px] font-bold text-on-surface">العملاء</span>
                    <span class="text-[10px] text-on-surface-variant">بالاسم والمدينة</span>
                  </div>
                  <div class="p-2 rounded-xl bg-surface-alt border border-border-subtle/60 flex flex-col items-center gap-1">
                    <span class="material-symbols-outlined text-[18px] text-blue-600">forum</span>
                    <span class="text-[11px] font-bold text-on-surface">المحادثات</span>
                    <span class="text-[10px] text-on-surface-variant">في رسائل الوارد</span>
                  </div>
                </div>
              </div>
            }

          </div>

          <!-- Bottom Footer -->
          <div class="px-4 py-2 bg-surface-alt border-t border-border-subtle flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>orca Global Search</span>
            <button
              type="button"
              (click)="close()"
              class="hover:text-on-surface transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>إغلاق</span>
              <kbd class="px-1 py-0.5 rounded bg-surface border border-border-subtle text-[10px]">Esc</kbd>
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class GlobalSearchComponent {
  private readonly searchService = inject(GlobalSearchService);
  private readonly elementRef = inject(ElementRef);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  readonly isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  isOpen = signal(false);
  query = signal('');
  selectedIndex = signal(0);

  // Grouped search results
  readonly results = computed<GroupedSearchResults>(() => {
    return this.searchService.search(this.query());
  });

  // Flat list of all results for arrow key navigation
  readonly flatResults = computed<SearchResult[]>(() => {
    const res = this.results();
    return [...res.orders, ...res.leads, ...res.conversations];
  });

  // Close dropdown on click anywhere outside this component
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    const target = event.target as Node;
    if (target && !this.elementRef.nativeElement.contains(target)) {
      this.close();
    }
  }

  // Listen to Global Shortcut: Ctrl+K or Cmd+K
  @HostListener('document:keydown', ['$event'])
  handleGlobalShortcut(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openAndFocus();
    } else if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.close();
    }
  }

  onInputFocus(): void {
    this.isOpen.set(true);
  }

  openAndFocus(): void {
    this.isOpen.set(true);
    setTimeout(() => {
      this.searchInput?.nativeElement?.focus();
      this.searchInput?.nativeElement?.select();
    }, 50);
  }

  close(): void {
    this.isOpen.set(false);
  }

  onQueryChange(val: string): void {
    this.query.set(val);
    this.selectedIndex.set(0);
    if (!this.isOpen()) {
      this.isOpen.set(true);
    }
  }

  clearQuery(event: MouseEvent): void {
    event.stopPropagation();
    this.query.set('');
    this.selectedIndex.set(0);
    this.searchInput?.nativeElement?.focus();
  }

  onKeyDown(event: KeyboardEvent): void {
    const list = this.flatResults();
    if (!this.isOpen() || list.length === 0) {
      if (event.key === 'ArrowDown') {
        this.isOpen.set(true);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = (this.selectedIndex() + 1) % list.length;
      this.selectedIndex.set(next);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prev = (this.selectedIndex() - 1 + list.length) % list.length;
      this.selectedIndex.set(prev);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = list[this.selectedIndex()];
      if (item) {
        this.selectItem(item);
      }
    }
  }

  isSelected(item: SearchResult): boolean {
    const list = this.flatResults();
    const curr = list[this.selectedIndex()];
    return curr?.id === item.id && curr?.type === item.type;
  }

  setHoveredItem(item: SearchResult): void {
    const list = this.flatResults();
    const idx = list.findIndex(r => r.id === item.id && r.type === item.type);
    if (idx >= 0) {
      this.selectedIndex.set(idx);
    }
  }

  selectItem(item: SearchResult): void {
    this.searchService.navigateToResult(item);
    this.close();
  }
}

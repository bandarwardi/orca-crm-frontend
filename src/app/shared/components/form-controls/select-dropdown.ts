import { Component, forwardRef, input, signal, computed, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';

export interface SelectOption {
  label: string;
  value: any;
  icon?: string;
  badge?: string;
  badgeClass?: string;
  searchKeywords?: string[];
}

/**
 * AppSelect Component
 * Accessible, customizable dropdown select supporting options, search, badges, and icons.
 * Features built-in instant search for US/Canadian states and keyword matching.
 * Consumes Deep Indigo design tokens.
 */
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, OverlayModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppSelect),
      multi: true
    }
  ],
  template: `
    <div class="flex flex-col gap-1.5 w-full">
      @if (label()) {
        <label class="font-label-sm text-[13px] text-on-surface font-semibold flex items-center gap-1.5 text-right justify-start">
          <span>{{ label() }}</span>
          @if (required()) {
            <span class="text-accent-rose text-[12px] leading-none">*</span>
          }
        </label>
      }

      <!-- Trigger Button with CDK Overlay Origin -->
      <button 
        type="button"
        cdkOverlayOrigin
        #trigger="cdkOverlayOrigin"
        class="w-full h-10 px-3 rounded-lg bg-surface border transition-all duration-200 flex items-center justify-between text-right"
        [class.border-accent-rose]="error()"
        [class.border-border-subtle]="!error() && !isOpen()"
        [class.border-brand-500]="!error() && isOpen()"
        [class.ring-2]="isOpen()"
        [class.ring-brand-500\/20]="!error() && isOpen()"
        [class.ring-rose-500\/20]="error() && isOpen()"
        [class.opacity-60]="disabled()"
        [class.cursor-not-allowed]="disabled()"
        [disabled]="disabled()"
        (click)="toggleOpen()"
      >
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <!-- Single prefix icon only -->
          @if (prefixIcon()) {
            <span class="material-symbols-outlined text-on-surface-variant text-[18px] flex-shrink-0"
                  [class.text-brand-600]="isOpen() && !error()">
              {{ prefixIcon() }}
            </span>
          }
          
          @if (selectedOption()) {
            <div class="flex items-center gap-2 truncate">
              <!-- Render option icon only if no prefixIcon is configured to avoid duplicate icons -->
              @if (selectedOption()?.icon && !prefixIcon()) {
                <span class="material-symbols-outlined text-[16px] text-on-surface-variant">{{ selectedOption()?.icon }}</span>
              }
              <span class="font-body-md text-[13px] text-on-surface font-medium truncate">{{ selectedOption()?.label }}</span>
              @if (selectedOption()?.badge) {
                <span class="px-2 py-0.5 rounded-full font-label-sm text-[10px] font-semibold flex-shrink-0"
                      [ngClass]="selectedOption()?.badgeClass || 'bg-surface-container text-on-surface-variant'">
                  {{ selectedOption()?.badge }}
                </span>
              }
            </div>
          } @else {
            <span class="font-body-md text-[13px] text-on-surface-variant/60 truncate">{{ placeholder() }}</span>
          }
        </div>

        <span class="material-symbols-outlined text-on-surface-variant text-[20px] transition-transform duration-200 flex-shrink-0 ms-2"
              [class.rotate-180]="isOpen()">
          expand_more
        </span>
      </button>

      <!-- CDK Connected Overlay for Dropdown Menu -->
      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="trigger"
        [cdkConnectedOverlayOpen]="isOpen()"
        [cdkConnectedOverlayHasBackdrop]="true"
        cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
        (backdropClick)="close()"
      >
        <div class="w-full bg-surface rounded-xl shadow-xl border border-border-subtle overflow-hidden my-1 z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col"
             [style.min-width.px]="triggerWidth()"
             [style.max-width.px]="Math.max(triggerWidth(), 320)"
             dir="rtl">
          
          <!-- Sticky Search Header if searchable is enabled -->
          @if (searchable()) {
            <div class="p-2 border-b border-border-subtle bg-surface sticky top-0 z-10" (click)="$event.stopPropagation()">
              <div class="relative flex items-center">
                <span class="material-symbols-outlined text-on-surface-variant text-[17px] absolute start-2.5 pointer-events-none">
                  search
                </span>
                <input 
                  #searchInput
                  type="text"
                  [placeholder]="searchPlaceholder()"
                  [ngModel]="searchQuery()"
                  (ngModelChange)="onSearchChange($event)"
                  (keydown.escape)="close()"
                  class="w-full h-8 ps-8 pe-8 rounded-lg bg-surface-alt border border-border-subtle text-[12px] text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-brand-500 transition-colors"
                />
                @if (searchQuery()) {
                  <button 
                    type="button" 
                    (click)="clearSearch($event)"
                    class="absolute end-2 w-5 h-5 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-full transition-colors"
                    title="مسح البحث">
                    <span class="material-symbols-outlined text-[14px]">close</span>
                  </button>
                }
              </div>
            </div>
          }

          <!-- Options List -->
          <div class="max-h-60 overflow-y-auto custom-scrollbar py-1">
            @for (option of filteredOptions(); track option.value) {
              <button
                type="button"
                class="w-full px-3.5 py-2.5 flex items-center justify-between text-right text-on-surface hover:bg-surface-alt transition-colors group cursor-pointer"
                [class.bg-brand-50]="option.value === value()"
                [class.text-brand-600]="option.value === value()"
                [class.dark:bg-brand-500/20]="option.value === value()"
                [class.dark:text-brand-300]="option.value === value()"
                (click)="selectOption(option)"
              >
                <div class="flex items-center gap-2.5 min-w-0 flex-1">
                  @if (option.icon) {
                    <span class="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-brand-600 transition-colors flex-shrink-0"
                          [class.text-brand-600]="option.value === value()">
                      {{ option.icon }}
                    </span>
                  }
                  <span class="font-label-md text-[13px] font-medium truncate">{{ option.label }}</span>
                  @if (option.badge) {
                    <span class="px-2 py-0.5 rounded-full font-label-sm text-[10px] font-semibold flex-shrink-0"
                          [ngClass]="option.badgeClass || 'bg-surface-container text-on-surface-variant'">
                      {{ option.badge }}
                    </span>
                  }
                </div>

                @if (option.value === value()) {
                  <span class="material-symbols-outlined text-brand-600 text-[18px] flex-shrink-0 ms-2">check</span>
                }
              </button>
            } @empty {
              <div class="px-4 py-6 text-center text-on-surface-variant text-[12px] flex flex-col items-center gap-1.5">
                <span class="material-symbols-outlined text-[24px] opacity-40">search_off</span>
                <span>لا توجد نتائج مطابقة لـ "{{ searchQuery() }}"</span>
                <span class="text-[11px] opacity-70">جرب كتابة رمز الولاية مثل SD أو CA أو الاسم بالعربية</span>
              </div>
            }
          </div>
        </div>
      </ng-template>

      <!-- Helper / Error Message -->
      @if (error()) {
        <span class="font-body-sm text-[12px] text-accent-rose flex items-center gap-1 mt-0.5">
          <span class="material-symbols-outlined text-[14px]">error</span>
          <span>{{ error() }}</span>
        </span>
      } @else if (hint()) {
        <span class="font-body-sm text-[12px] text-on-surface-variant mt-0.5">{{ hint() }}</span>
      }
    </div>
  `
})
export class AppSelect implements ControlValueAccessor {
  private elementRef = inject(ElementRef);
  Math = Math;

  @ViewChild('searchInput') searchInputElement?: ElementRef<HTMLInputElement>;

  label = input<string>();
  placeholder = input<string>('اختر من القائمة...');
  options = input<SelectOption[]>([]);
  prefixIcon = input<string>();
  error = input<string>();
  hint = input<string>();
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  searchable = input<boolean>(false);
  searchPlaceholder = input<string>('ابحث بالاسم أو الاختصار (مثال: SD, CA)...');

  value = signal<any>(null);
  isOpen = signal<boolean>(false);
  searchQuery = signal<string>('');

  filteredOptions = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const all = this.options();
    if (!query) return all;

    return all.filter(opt => {
      // Direct label or string value match
      const labelMatch = (opt.label || '').toLowerCase().includes(query);
      const valMatch = String(opt.value || '').toLowerCase().includes(query);
      
      // Keyword match (e.g. state abbreviation 'SD', 'CA', english/arabic aliases)
      const keywordMatch = opt.searchKeywords?.some(k => k.toLowerCase().includes(query));

      return labelMatch || valMatch || keywordMatch;
    });
  });

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: any): void {
    this.value.set(val);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Handled by signal input
  }

  toggleOpen(): void {
    if (!this.disabled()) {
      this.isOpen.update(v => !v);
      if (this.isOpen()) {
        this.onTouched();
        this.searchQuery.set('');
        if (this.searchable()) {
          setTimeout(() => this.searchInputElement?.nativeElement?.focus(), 50);
        }
      }
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.searchQuery.set('');
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  clearSearch(event: Event): void {
    event.stopPropagation();
    this.searchQuery.set('');
    this.searchInputElement?.nativeElement?.focus();
  }

  selectOption(option: SelectOption): void {
    this.value.set(option.value);
    this.onChange(option.value);
    this.close();
  }

  selectedOption(): SelectOption | undefined {
    return this.options().find(opt => opt.value === this.value());
  }

  triggerWidth(): number {
    return this.elementRef.nativeElement.getBoundingClientRect().width;
  }
}

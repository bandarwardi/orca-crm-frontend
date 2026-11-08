import { Component, TemplateRef, ContentChild, ContentChildren, QueryList, Directive, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Column definition directive for data-table
 */
@Directive({
  selector: '[appColumnDef]',
  standalone: true
})
export class ColumnDef {
  name = input.required<string>({ alias: 'appColumnDef' });
  header = input.required<string>();
  
  private hostTemplate = inject(TemplateRef, { optional: true });
  @ContentChild(TemplateRef) contentTemplate?: TemplateRef<any>;

  get template(): TemplateRef<any> | null {
    return this.hostTemplate || this.contentTemplate || null;
  }
}

/**
 * DataTable Component
 * A reusable data table tailored for CRM data lists using Deep Indigo tokens.
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full bg-surface rounded-xl border border-border-subtle overflow-hidden shadow-xs">
      <div class="overflow-x-auto">
        <table class="w-full text-right border-collapse">
          <thead>
            <tr class="bg-surface-alt border-b border-border-subtle">
              @if (selectable()) {
                <th class="px-space-sm py-3 w-12">
                  <input type="checkbox" class="rounded border-border-subtle text-brand-600 focus:ring-brand-500" 
                         [checked]="allSelected" (change)="toggleAll()">
                </th>
              }
              @for (col of columns; track col.name()) {
                <th class="px-space-sm py-3 font-label-sm text-on-surface-variant whitespace-nowrap">
                  {{ col.header() }}
                </th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-border-subtle">
            @for (row of data(); track $index) {
              <tr 
                  class="hover:bg-surface-alt transition-colors group cursor-pointer"
                  [class.bg-brand-50/50]="selection.has(row)"
                  [class.dark:bg-brand-500/10]="selection.has(row)"
                  (click)="rowClick.emit(row)"
              >
                @if (selectable()) {
                  <td class="px-space-sm py-3" (click)="$event.stopPropagation()">
                    <input type="checkbox" class="rounded border-border-subtle text-brand-600 focus:ring-brand-500"
                           [checked]="selection.has(row)" (change)="toggleSelection(row)">
                  </td>
                }
                @for (col of columns; track col.name()) {
                  <td class="px-space-sm py-4 font-body-md text-on-surface">
                    <ng-container *ngTemplateOutlet="col.template; context: { $implicit: row }"></ng-container>
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td [attr.colspan]="columns.length + (selectable() ? 1 : 0)" class="px-space-sm py-8 text-center text-on-surface-variant font-body-md">
                  لا توجد بيانات لعرضها
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      
      <!-- Pagination (Optional) -->
      @if (showPagination()) {
        <div class="px-space-sm py-3 border-t border-border-subtle flex items-center justify-between bg-surface">
          <span class="font-label-sm text-on-surface-variant">عرض {{ data().length }} عنصر</span>
          <div class="flex items-center gap-2">
            <button class="w-8 h-8 rounded-lg border border-border-subtle flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50">
              <span class="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
            <button class="w-8 h-8 rounded-lg border border-border-subtle flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50">
              <span class="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class DataTable {
  data = input<any[]>([]);
  selectable = input<boolean>(false);
  showPagination = input<boolean>(false);
  
  rowClick = output<any>();
  selectionChange = output<any[]>();

  @ContentChildren(ColumnDef) columnDefs!: QueryList<ColumnDef>;

  selection = new Set<any>();

  get columns(): ColumnDef[] {
    return this.columnDefs ? this.columnDefs.toArray() : [];
  }

  get allSelected(): boolean {
    return this.data().length > 0 && this.selection.size === this.data().length;
  }

  toggleAll(): void {
    if (this.allSelected) {
      this.selection.clear();
    } else {
      this.data().forEach(item => this.selection.add(item));
    }
    this.selectionChange.emit(Array.from(this.selection));
  }

  toggleSelection(item: any): void {
    if (this.selection.has(item)) {
      this.selection.delete(item);
    } else {
      this.selection.add(item);
    }
    this.selectionChange.emit(Array.from(this.selection));
  }
}

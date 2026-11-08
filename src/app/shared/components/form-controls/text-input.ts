import { Component, forwardRef, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

/**
 * AppTextInput Component
 * Reusable accessible text input supporting icons, labels, errors, and Angular Reactive Forms.
 * Guaranteed RTL alignment with natural flex layout (no absolute positioning bugs).
 * Consumes Deep Indigo design tokens.
 */
@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  host: {
    'dir': 'rtl',
    'class': 'block w-full text-right'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppTextInput),
      multi: true
    }
  ],
  template: `
    <div class="flex flex-col gap-1.5 w-full text-right" dir="rtl">
      @if (label()) {
        <label class="font-label-sm text-[13px] text-on-surface font-semibold flex items-center gap-1.5 text-right justify-start">
          <span>{{ label() }}</span>
          @if (required()) {
            <span class="text-accent-rose text-[12px] leading-none">*</span>
          }
        </label>
      }

      <div 
        class="relative flex items-center rounded-lg bg-surface border transition-all duration-200 px-3 gap-2"
        [class.border-accent-rose]="error()"
        [class.border-border-subtle]="!error() && !isFocused()"
        [class.border-brand-500]="!error() && isFocused()"
        [class.ring-2]="isFocused()"
        [class.ring-brand-500\/20]="!error() && isFocused()"
        [class.ring-rose-500\/20]="error() && isFocused()"
        [class.opacity-60]="disabled()"
        [class.cursor-not-allowed]="disabled()"
      >
        <!-- Prefix Icon (First child in RTL flex container = strictly on the right) -->
        @if (prefixIcon()) {
          <span class="material-symbols-outlined text-on-surface-variant text-[18px] pointer-events-none transition-colors shrink-0"
                [class.text-brand-600]="isFocused() && !error()"
                [class.text-accent-rose]="error()">
            {{ prefixIcon() }}
          </span>
        }

        <!-- Native Input Element (takes all remaining flex width) -->
        <input 
          [type]="type()"
          [value]="value()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [attr.dir]="inputDir()"
          class="w-full h-10 bg-transparent font-body-md text-[13px] text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none transition-all"
          [class.text-left]="inputDir() === 'ltr'"
          [class.text-right]="inputDir() !== 'ltr'"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
        />

        <!-- Suffix Icon or Clear Button (Last child in RTL flex container = strictly on the left) -->
        @if (clearable() && value() && !disabled()) {
          <button 
            type="button" 
            class="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
            (click)="onClear()"
            title="مسح"
          >
            <span class="material-symbols-outlined text-[16px] block">close</span>
          </button>
        } @else if (suffixIcon()) {
          <span class="material-symbols-outlined text-on-surface-variant text-[18px] pointer-events-none shrink-0">
            {{ suffixIcon() }}
          </span>
        }
      </div>

      <!-- Helper / Error Message -->
      @if (error()) {
        <span class="font-body-sm text-[12px] text-accent-rose flex items-center gap-1 mt-0.5 justify-start">
          <span class="material-symbols-outlined text-[14px]">error</span>
          <span>{{ error() }}</span>
        </span>
      } @else if (hint()) {
        <span class="font-body-sm text-[12px] text-on-surface-variant mt-0.5 text-right">{{ hint() }}</span>
      }
    </div>
  `
})
export class AppTextInput implements ControlValueAccessor {
  label = input<string>();
  placeholder = input<string>('');
  type = input<string>('text');
  prefixIcon = input<string>();
  suffixIcon = input<string>();
  error = input<string>();
  hint = input<string>();
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  clearable = input<boolean>(false);
  inputDir = input<string>('rtl', { alias: 'dir' });

  value = signal<string>('');
  isFocused = signal<boolean>(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string): void {
    this.value.set(val || '');
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

  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.value.set(inputElement.value);
    this.onChange(inputElement.value);
  }

  onFocus(): void {
    this.isFocused.set(true);
    this.onTouched();
  }

  onBlur(): void {
    this.isFocused.set(false);
  }

  onClear(): void {
    this.value.set('');
    this.onChange('');
  }
}

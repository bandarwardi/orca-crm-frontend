import { Component, forwardRef, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

/**
 * AppTextarea Component
 * Multi-line text input with Deep Indigo token integration.
 */
@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppTextarea),
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

      <div 
        class="relative rounded-lg bg-surface border transition-all duration-200"
        [class.border-accent-rose]="error()"
        [class.border-border-subtle]="!error() && !isFocused()"
        [class.border-brand-500]="!error() && isFocused()"
        [class.ring-2]="isFocused()"
        [class.ring-brand-500\/20]="!error() && isFocused()"
        [class.ring-rose-500\/20]="error() && isFocused()"
        [class.opacity-60]="disabled()"
        [class.cursor-not-allowed]="disabled()"
      >
        <textarea
          [rows]="rows()"
          [value]="value()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          class="w-full p-3 rounded-lg bg-transparent font-body-md text-[13px] text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none resize-none transition-all custom-scrollbar"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
        ></textarea>
      </div>

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
export class AppTextarea implements ControlValueAccessor {
  label = input<string>();
  placeholder = input<string>('');
  rows = input<number>(3);
  error = input<string>();
  hint = input<string>();
  required = input<boolean>(false);
  disabled = input<boolean>(false);

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
    const textarea = event.target as HTMLTextAreaElement;
    this.value.set(textarea.value);
    this.onChange(textarea.value);
  }

  onFocus(): void {
    this.isFocused.set(true);
    this.onTouched();
  }

  onBlur(): void {
    this.isFocused.set(false);
  }
}

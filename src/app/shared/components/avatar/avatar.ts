import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Avatar Component
 * Displays a user or entity avatar. Either an image or initials.
 * Uses Deep Indigo palette tokens.
 */
@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      [class]="containerClasses() + ' ' + colorClasses()"
      class="flex items-center justify-center flex-shrink-0 font-semibold overflow-hidden shadow-xs"
    >
      @if (imageUrl()) {
        <img [src]="imageUrl()" [alt]="name()" class="w-full h-full object-cover" />
      } @else {
        <span>{{ initials() }}</span>
      }
    </div>
  `
})
export class Avatar {
  name = input<string>('');
  imageUrl = input<string>();
  size = input<'sm' | 'md' | 'lg'>('md');
  rounded = input<'full' | 'lg'>('full');

  initials = computed(() => {
    if (!this.name()) return '';
    const words = this.name().split(' ').filter(w => w.length > 0);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return this.name().substring(0, 1).toUpperCase();
  });

  containerClasses = computed(() => {
    let classes = '';
    
    switch (this.size()) {
      case 'sm': classes += 'w-8 h-8 text-sm '; break;
      case 'md': classes += 'w-9 h-9 text-base '; break;
      case 'lg': classes += 'w-11 h-11 text-lg '; break;
    }

    if (this.rounded() === 'full') {
      classes += 'rounded-full ';
    } else {
      classes += 'rounded-lg ';
    }

    return classes;
  });

  colorClasses = computed(() => {
    if (this.imageUrl()) return 'bg-surface-container';
    
    // Hash name to a consistent index
    const nameStr = this.name() || 'Unknown';
    let hash = 0;
    for (let i = 0; i < nameStr.length; i++) {
      hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      'bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300',
      'bg-[#ECFDF5] text-[#059669] dark:bg-emerald-500/20 dark:text-emerald-300',
      'bg-[#FFFBEB] text-[#D97706] dark:bg-amber-500/20 dark:text-amber-300',
      'bg-brand-100 text-brand-700 dark:bg-indigo-500/20 dark:text-indigo-300',
      'bg-[#FDF2F8] text-[#DB2777] dark:bg-pink-500/20 dark:text-pink-300',
      'bg-[#F1F5F9] text-[#475569] dark:bg-slate-800 dark:text-slate-300'
    ];
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  });
}

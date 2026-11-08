import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type KpiVariant = 'default' | 'revenue' | 'today-orders' | 'active-leads' | 'expiring';

/**
 * KpiCard Component
 * Displays a key performance indicator with Deep Indigo styling.
 * 
 * Features:
 * - Revenue card: Deep Indigo gradient, white typography, translucent sparkline
 * - 3px colored top borders for category cards (brand-500, #A855F7, accent-amber)
 */
@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  host: { class: 'block h-full' },
  template: `
    @if (isRevenueCard()) {
      <!-- REVENUE CARD: Deep Indigo Gradient + Translucent Sparkline + White Text -->
      <div 
        class="rounded-xl p-space-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden h-full shadow-md hover:shadow-lg text-white"
        style="background: linear-gradient(135deg, #4F46E5 0%, #3730D9 60%, #2E1FA8 100%);"
      >
        <!-- Ambient subtle inner glow -->
        <div class="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

        <div class="flex items-center justify-between z-10">
          <span class="font-label-md text-white/90 font-medium">{{ title() }}</span>
          @if (icon()) {
            <div class="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-xs text-white flex items-center justify-center shadow-xs">
              <span class="material-symbols-outlined text-[22px]">{{ icon() }}</span>
            </div>
          }
        </div>
        
        <!-- Divider -->
        <div class="h-px w-full bg-white/20 mt-3 mb-2 z-10"></div>
        
        <div class="flex flex-col gap-1 z-10">
          <div class="flex items-baseline gap-2">
            <span class="font-display text-4xl font-bold tracking-tight text-white">{{ value() }}</span>
            @if (trend()) {
              <span class="font-label-sm px-2 py-0.5 rounded-full flex items-center gap-0.5 font-semibold bg-white/20 text-white backdrop-blur-xs">
                @if (trendDirection() === 'up') {
                  <span class="material-symbols-outlined text-[14px]">trending_up</span>
                }
                @if (trendDirection() === 'down') {
                  <span class="material-symbols-outlined text-[14px]">trending_down</span>
                }
                {{ trend() }}
              </span>
            }
          </div>
          @if (subLabel()) {
            <span class="font-label-sm text-white/80 text-[11px] font-medium">{{ subLabel() }}</span>
          }
        </div>

        <!-- Translucent White Sparkline -->
        <svg class="absolute bottom-0 start-0 w-44 h-16 opacity-35 pointer-events-none z-0" viewBox="0 0 100 40" fill="none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="revenue-spark-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45"/>
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <path d="M 0 35 Q 15 22, 30 26 T 60 14 T 85 18 T 100 6 L 100 40 L 0 40 Z" fill="url(#revenue-spark-gradient)"/>
          <path d="M 0 35 Q 15 22, 30 26 T 60 14 T 85 18 T 100 6" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        </svg>
      </div>
    } @else {
      <!-- STANDARD KPI CARD: White Surface with 3px Meaningful Top Border -->
      <div 
        class="rounded-xl p-space-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden h-full bg-surface border border-border-subtle shadow-sm hover:shadow-md"
        [ngClass]="topBorderClass()"
      >
        <div class="flex items-center justify-between z-10">
          <span class="font-label-md text-on-surface-variant font-medium">{{ title() }}</span>
          @if (icon()) {
            <div class="w-11 h-11 rounded-xl transition-colors flex items-center justify-center" [ngClass]="iconContainerClasses()">
              <span class="material-symbols-outlined text-[22px]">{{ icon() }}</span>
            </div>
          }
        </div>
        
        <!-- Divider -->
        <div class="h-px w-full bg-border-subtle mt-3 mb-2"></div>
        
        <div class="flex flex-col gap-1 z-10">
          <div class="flex items-baseline gap-2">
            <span class="font-display text-4xl font-bold tracking-tight text-on-surface">{{ value() }}</span>
            @if (trend()) {
              <span class="font-label-sm px-2 py-0.5 rounded-full flex items-center gap-0.5 font-medium" [ngClass]="trendClasses()">
                @if (trendDirection() === 'up') {
                  <span class="material-symbols-outlined text-[14px]">trending_up</span>
                }
                @if (trendDirection() === 'down') {
                  <span class="material-symbols-outlined text-[14px]">trending_down</span>
                }
                {{ trend() }}
              </span>
            }
          </div>
          @if (subLabel()) {
            <span class="font-label-sm text-on-surface-variant text-[11px]">{{ subLabel() }}</span>
          }
        </div>
      </div>
    }
  `
})
export class KpiCard {
  title = input<string>('');
  value = input<string>('');
  trend = input<string>();
  trendDirection = input<'up' | 'down' | 'neutral'>();
  icon = input<string>();
  color = input<'blue' | 'green' | 'amber' | 'rose' | 'indigo' | 'purple' | 'slate'>('blue');
  subLabel = input<string>();
  highlight = input<boolean>(false);
  variant = input<KpiVariant>('default');

  isRevenueCard = computed(() => {
    return this.variant() === 'revenue' || this.title().includes('إيرادات') || this.color() === 'green';
  });

  topBorderClass = computed(() => {
    const rawTitle = this.title();
    const v = this.variant();

    // 1. طلبات اليوم: 3px top border matching --brand-500
    if (v === 'today-orders' || rawTitle.includes('طلبات')) {
      return 'border-t-[3px] !border-t-brand-500';
    }

    // 2. عملاء محتملون نشطون: 3px top border matching #A855F7 (violet)
    if (v === 'active-leads' || rawTitle.includes('عملاء')) {
      return 'border-t-[3px] !border-t-[#A855F7]';
    }

    // 3. اشتراكات تنتهي قريباً: 3px top border matching --accent-amber
    if (v === 'expiring' || rawTitle.includes('تنتهي') || rawTitle.includes('اشتراكات')) {
      return 'border-t-[3px] !border-t-accent-amber';
    }

    return 'border-t-[3px] !border-t-brand-500';
  });

  trendClasses = computed(() => {
    if (this.trendDirection() === 'up') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
    if (this.trendDirection() === 'down') return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
    return 'bg-surface-container text-on-surface-variant';
  });

  iconContainerClasses = computed(() => {
    const rawTitle = this.title();
    if (rawTitle.includes('طلبات')) {
      return 'bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300';
    }
    if (rawTitle.includes('عملاء')) {
      return 'bg-purple-50 text-[#A855F7] dark:bg-purple-500/20 dark:text-purple-300';
    }
    if (rawTitle.includes('تنتهي') || rawTitle.includes('اشتراكات')) {
      return 'bg-amber-50 text-accent-amber dark:bg-amber-500/20 dark:text-amber-300';
    }
    return 'bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300';
  });
}

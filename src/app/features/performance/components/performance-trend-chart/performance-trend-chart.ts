import { Component, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChartPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

@Component({
  selector: 'app-performance-trend-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-surface-container-lowest rounded-xl p-space-md border border-surface-container shadow-sm flex flex-col justify-between h-full overflow-hidden" dir="rtl">
      <!-- Chart Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-space-sm border-b border-surface-container mb-space-xs shrink-0">
        <div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">{{ icon() }}</span>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">{{ title() }}</h3>
          </div>
          @if (subtitle()) {
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{{ subtitle() }}</p>
          }
        </div>

        <!-- Legend -->
        <div class="flex items-center gap-4 text-label-sm font-label-sm">
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span class="text-on-surface font-medium">{{ primaryLabel() }}</span>
          </div>
          @if (secondaryLabel()) {
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-brand-500"></span>
              <span class="text-on-surface-variant font-medium">{{ secondaryLabel() }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Chart Content Area (Flex-1) -->
      <div class="flex-1 flex flex-col justify-between pt-2">
        <!-- SVG Canvas Area with Relative Coordinates & Hover Tooltip -->
        <div
          class="relative w-full flex-1 min-h-[155px]"
          (mouseleave)="activeHoverIndex.set(null)">

          <svg class="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
            <defs>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#10B981" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="#10B981" stop-opacity="0.0"/>
              </linearGradient>
              <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#4F46E5" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#4F46E5" stop-opacity="0.0"/>
              </linearGradient>
            </defs>

            <!-- Horizontal Dotted Grid Lines -->
            <line x1="20" y1="28" x2="480" y2="28" stroke="currentColor" class="text-surface-container" stroke-dasharray="4 4" />
            <line x1="20" y1="72" x2="480" y2="72" stroke="currentColor" class="text-surface-container" stroke-dasharray="4 4" />
            <line x1="20" y1="116" x2="480" y2="116" stroke="currentColor" class="text-surface-container" stroke-dasharray="4 4" />
            <line x1="20" y1="150" x2="480" y2="150" stroke="currentColor" class="text-surface-container" stroke-dasharray="4 4" />

            <!-- Area fill for primary line -->
            @if (areaPathPrimary()) {
              <path [attr.d]="areaPathPrimary()" fill="url(#emeraldGradient)" />
            }

            <!-- Secondary line (if present) -->
            @if (linePathSecondary()) {
              <path
                [attr.d]="linePathSecondary()"
                fill="none"
                stroke="#4F46E5"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round" />
            }

            <!-- Primary line -->
            @if (linePathPrimary()) {
              <path
                [attr.d]="linePathPrimary()"
                fill="none"
                stroke="#10B981"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round" />
            }

            <!-- Active Hover Guide Line -->
            @if (activePoint(); as act) {
              <line
                [attr.x1]="act.x"
                y1="15"
                [attr.x2]="act.x"
                y2="150"
                stroke="#94A3B8"
                stroke-width="1.5"
                stroke-dasharray="3 3"
                class="pointer-events-none transition-all duration-150" />
            }

            <!-- Data Point Circles -->
            @for (pt of computedPoints(); track pt.label; let i = $index) {
              <!-- Primary circle -->
              <circle
                [attr.cx]="pt.x"
                [attr.cy]="pt.y"
                [attr.r]="activeHoverIndex() === i ? 6 : 4"
                fill="#ffffff"
                stroke="#10B981"
                stroke-width="2.5"
                class="transition-all duration-150 pointer-events-none" />

              <!-- Secondary circle (if present) -->
              @if (pt.y2 !== undefined) {
                <circle
                  [attr.cx]="pt.x"
                  [attr.cy]="pt.y2"
                  [attr.r]="activeHoverIndex() === i ? 5.5 : 3.5"
                  fill="#ffffff"
                  stroke="#4F46E5"
                  stroke-width="2.5"
                  class="transition-all duration-150 pointer-events-none" />
              }

              <!-- Active Halo Rings on Hover -->
              @if (activeHoverIndex() === i) {
                <circle
                  [attr.cx]="pt.x"
                  [attr.cy]="pt.y"
                  r="9"
                  fill="#10B981"
                  fill-opacity="0.2"
                  class="pointer-events-none animate-pulse" />

                @if (pt.y2 !== undefined) {
                  <circle
                    [attr.cx]="pt.x"
                    [attr.cy]="pt.y2"
                    r="8.5"
                    fill="#4F46E5"
                    fill-opacity="0.2"
                    class="pointer-events-none animate-pulse" />
                }
              }

              <!-- Transparent Hit Zone Rect for Easy Hovering -->
              <rect
                [attr.x]="pt.x - hitAreaWidth() / 2"
                y="0"
                [attr.width]="hitAreaWidth()"
                height="160"
                fill="transparent"
                class="cursor-pointer"
                (mouseenter)="activeHoverIndex.set(i)" />
            }
          </svg>

          <!-- Interactive Floating Tooltip Card (Contained & Bounds-safe) -->
          @if (activePoint(); as pt) {
            <div
              class="absolute z-30 pointer-events-none transition-all duration-150 ease-out"
              [style.left.%]="pt.percentX"
              [style.top.px]="getTooltipTop(pt)"
              [style.transform]="getTooltipTransform(pt.percentX)">
              <div class="bg-surface-container-highest/95 backdrop-blur-md text-on-surface border border-surface-container shadow-xl rounded-xl px-3 py-2 text-xs flex flex-col gap-1 min-w-[135px] whitespace-nowrap">
                <div class="font-bold text-on-surface text-[12px] pb-1 border-b border-surface-container flex items-center justify-between gap-3">
                  <span>{{ pt.label }}</span>
                  <span class="text-[10px] text-outline font-normal">مؤشر الفترة</span>
                </div>
                <div class="flex items-center justify-between gap-3 text-[11px]">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span class="text-on-surface-variant">{{ primaryLabel() }}:</span>
                  </div>
                  <span class="font-bold text-emerald-700" dir="ltr">{{ pt.value }}{{ valueSuffix() }}</span>
                </div>
                @if (pt.secondaryValue !== undefined) {
                  <div class="flex items-center justify-between gap-3 text-[11px]">
                    <div class="flex items-center gap-1.5">
                      <span class="w-2.5 h-2.5 rounded-full bg-brand-500 shrink-0"></span>
                      <span class="text-on-surface-variant">{{ secondaryLabel() || 'الطلبات' }}:</span>
                    </div>
                    <span class="font-bold text-brand-700" dir="ltr">{{ pt.secondaryValue }}{{ effectiveSecondarySuffix() }}</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- X-Axis Labels Row (Strictly inside card, aligned 1:1 with points) -->
        <div class="relative w-full h-11 mt-1 pt-1 border-t border-surface-container/60 shrink-0">
          @for (pt of computedPoints(); track pt.label; let i = $index) {
            <div
              class="absolute top-1 flex flex-col items-center pointer-events-none -translate-x-1/2 transition-transform duration-150"
              [style.left.%]="pt.percentX"
              [class.scale-105]="activeHoverIndex() === i">
              <span
                [class.text-primary]="activeHoverIndex() === i"
                [class.font-bold]="activeHoverIndex() === i"
                [class.text-on-surface-variant]="activeHoverIndex() !== i"
                class="font-label-sm text-label-sm font-medium whitespace-nowrap transition-colors">
                {{ pt.label }}
              </span>
              <span
                [class.text-emerald-700]="activeHoverIndex() === i"
                [class.font-bold]="activeHoverIndex() === i"
                class="font-code-sm text-[11px] text-emerald-600 font-semibold"
                dir="ltr">
                {{ pt.value }}{{ valueSuffix() }}
              </span>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class PerformanceTrendChart {
  title = input<string>('اتجاه الأداء خلال الفترة');
  subtitle = input<string>('معدل التحويل ونمو العمليات أسبوعياً');
  icon = input<string>('show_chart');
  points = input<ChartPoint[]>([]);
  valueSuffix = input<string>('%');
  primaryLabel = input<string>('معدل التحويل');
  secondaryLabel = input<string | undefined>(undefined);
  secondarySuffix = input<string | undefined>(undefined);

  activeHoverIndex = signal<number | null>(null);

  effectiveSecondarySuffix = computed(() => {
    if (this.secondarySuffix() !== undefined) return this.secondarySuffix();
    return this.secondaryLabel()?.includes('%') ? '%' : '';
  });

  computedPoints = computed(() => {
    const pts = this.points();
    if (!pts || pts.length === 0) return [];
    
    const count = pts.length;
    const width = 500;
    const height = 160;
    const paddingX = 42;
    const stepX = (width - paddingX * 2) / Math.max(count - 1, 1);

    const primaryValues = pts.map(p => p.value);
    const hasSecondary = pts.some(p => p.secondaryValue !== undefined);
    const secondaryIsSameUnit = this.valueSuffix() === '%' && (this.secondaryLabel()?.includes('%') ?? false);

    let minValPrimary: number;
    let maxValPrimary: number;
    let minValSecondary: number;
    let maxValSecondary: number;

    if (hasSecondary && secondaryIsSameUnit) {
      const allValues = pts.flatMap(p => [p.value, p.secondaryValue].filter((v): v is number => v !== undefined));
      minValPrimary = Math.max(0, Math.min(...allValues) * 0.7);
      maxValPrimary = Math.max(...allValues) * 1.15 || 100;
      minValSecondary = minValPrimary;
      maxValSecondary = maxValPrimary;
    } else {
      minValPrimary = Math.max(0, Math.min(...primaryValues) * 0.75);
      maxValPrimary = Math.max(...primaryValues) * 1.18 || 100;

      if (hasSecondary) {
        const secValues = pts.map(p => p.secondaryValue!).filter(v => v !== undefined);
        minValSecondary = Math.max(0, Math.min(...secValues) * 0.75);
        maxValSecondary = Math.max(...secValues) * 1.18 || 100;
      } else {
        minValSecondary = 0;
        maxValSecondary = 100;
      }
    }

    const rangePrimary = maxValPrimary - minValPrimary || 1;
    const rangeSecondary = maxValSecondary - minValSecondary || 1;

    return pts.map((pt, i) => {
      // In RTL Arabic layout: index 0 (oldest period) starts at the RIGHT side (width - paddingX)
      // and index count - 1 (latest period) ends at the LEFT side (paddingX).
      const x = (width - paddingX) - i * stepX;
      const percentX = (x / width) * 100;

      const normalizedY = (pt.value - minValPrimary) / rangePrimary;
      const y = (height - 22) - (normalizedY * (height - 44));

      let y2: number | undefined;
      if (pt.secondaryValue !== undefined) {
        const normalizedY2 = (pt.secondaryValue - minValSecondary) / rangeSecondary;
        y2 = (height - 22) - (normalizedY2 * (height - 44));
      }

      return {
        x,
        y,
        y2,
        percentX,
        label: pt.label,
        value: pt.value,
        secondaryValue: pt.secondaryValue
      };
    });
  });

  hitAreaWidth = computed(() => {
    const pts = this.points();
    if (!pts || pts.length <= 1) return 80;
    const width = 500;
    const paddingX = 42;
    return (width - paddingX * 2) / (pts.length - 1);
  });

  activePoint = computed(() => {
    const idx = this.activeHoverIndex();
    if (idx === null) return null;
    const pts = this.computedPoints();
    return pts[idx] || null;
  });

  linePathPrimary = computed(() => {
    const pts = this.computedPoints();
    if (pts.length === 0) return '';
    return pts.reduce((acc, pt, i) => i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '');
  });

  areaPathPrimary = computed(() => {
    const pts = this.computedPoints();
    if (pts.length === 0) return '';
    const first = pts[0];
    const last = pts[pts.length - 1];
    return `M ${first.x} 150 L ${first.x} ${first.y} ` +
      pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') +
      ` L ${last.x} 150 Z`;
  });

  linePathSecondary = computed(() => {
    const pts = this.computedPoints().filter(p => p.y2 !== undefined);
    if (pts.length === 0) return '';
    return pts.reduce((acc, pt, i) => i === 0 ? `M ${pt.x} ${pt.y2}` : `${acc} L ${pt.x} ${pt.y2}`, '');
  });

  getTooltipTransform(percentX: number): string {
    if (percentX < 22) {
      return 'translateX(-12%)';
    } else if (percentX > 78) {
      return 'translateX(-88%)';
    }
    return 'translateX(-50%)';
  }

  getTooltipTop(pt: { y: number; y2?: number }): number {
    const minY = pt.y2 !== undefined ? Math.min(pt.y, pt.y2) : pt.y;
    if (minY < 58) {
      return Math.min(95, minY + 18);
    }
    return Math.max(6, minY - 68);
  }
}

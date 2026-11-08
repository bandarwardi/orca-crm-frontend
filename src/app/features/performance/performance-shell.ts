import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerformanceStore } from './store/performance.store';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-performance-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  host: { class: 'flex-1 flex flex-col min-h-0 h-full overflow-hidden' },
  template: `
    <div class="flex-1 flex flex-col min-h-0 overflow-y-auto p-space-md lg:p-space-lg gap-space-lg custom-scrollbar" dir="rtl">
      <router-outlet></router-outlet>
    </div>
  `
})
export class PerformanceShell implements OnInit {
  store = inject(PerformanceStore);

  ngOnInit() {
    this.store.loadPerformanceData();
  }
}

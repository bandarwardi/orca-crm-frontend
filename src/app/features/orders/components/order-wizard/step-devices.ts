import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersStore } from '../../store/orders.store';
import { AppSelect, SelectOption } from '../../../../shared/components/form-controls/select-dropdown';

@Component({
  selector: 'app-step-devices',
  standalone: true,
  imports: [CommonModule, FormsModule, AppSelect],
  template: `
    <div class="space-y-5">
      <!-- Section Header -->
      <div class="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <span class="material-symbols-outlined text-[22px]">tv</span>
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-900">المرحلة ٣: الأجهزة المشغلة</h2>
            <p class="text-xs text-slate-500 mt-0.5">أدخل بيانات الأجهزة وعناوين MAC ومفاتيح التفعيل للعميل</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
            عدد الأجهزة: {{ store.wizardDevices().length }}
          </span>
        </div>
      </div>

      <!-- Repeatable Device Cards -->
      <div class="space-y-4">
        @for (device of store.wizardDevices(); track device.id; let idx = $index) {
          <article class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all">
            <!-- Card Header -->
            <div class="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div class="flex items-center gap-3">
                <span class="p-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                  <span class="material-symbols-outlined text-[20px] leading-none">devices</span>
                </span>
                <div>
                  <h3 class="text-sm font-bold text-slate-900">{{ device.name }}</h3>
                  <span class="text-[11px] text-slate-500 font-medium">{{ device.subtitle }}</span>
                </div>
              </div>

              @if (store.wizardDevices().length > 1) {
                <button
                  type="button"
                  (click)="store.removeWizardDevice(idx)"
                  class="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors"
                  title="حذف الجهاز"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                </button>
              }
            </div>

            <!-- Card Inputs Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <app-select
                  label="نوع الجهاز"
                  placeholder="ابحث واختر نوع الجهاز..."
                  prefixIcon="tv"
                  [searchable]="true"
                  searchPlaceholder="ابحث بنوع الجهاز (مثال: شاشة سامسونج، Apple TV، Firestick)..."
                  [options]="deviceTypeOptions"
                  [ngModel]="device.deviceType"
                  (ngModelChange)="store.updateWizardDevice(idx, { deviceType: $event })"
                ></app-select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5 text-right">MAC Address (عنوان الماك)</label>
                <input
                  [ngModel]="device.macAddress"
                  (ngModelChange)="store.updateWizardDevice(idx, { macAddress: $event })"
                  class="w-full h-10 text-xs font-mono font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 text-left focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  dir="ltr"
                  placeholder="00:1A:79:XX:XX:XX"
                  type="text"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5 text-right">Device Key (مفتاح الجهاز)</label>
                <input
                  [ngModel]="device.deviceKey"
                  (ngModelChange)="store.updateWizardDevice(idx, { deviceKey: $event })"
                  class="w-full h-10 text-xs font-mono font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 text-left focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  dir="ltr"
                  placeholder="XXXX-DK-TIZEN"
                  type="text"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5 text-right">اسم المستخدم المخصص</label>
                <input
                  [ngModel]="device.username"
                  (ngModelChange)="store.updateWizardDevice(idx, { username: $event })"
                  class="w-full h-10 text-xs font-mono font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 text-left focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  dir="ltr"
                  placeholder="user_tv"
                  type="text"
                />
              </div>

              <div class="sm:col-span-2 md:col-span-2">
                <app-select
                  label="التطبيق المعتمد"
                  placeholder="ابحث واختر التطبيق المعتمد..."
                  prefixIcon="apps"
                  [searchable]="true"
                  searchPlaceholder="ابحث باسم التطبيق أو نوع الجهاز (مثال: IBO, شاشة, Android)..."
                  [options]="appOptions"
                  [ngModel]="device.app"
                  (ngModelChange)="store.updateWizardDevice(idx, { app: $event })"
                ></app-select>
              </div>
            </div>
          </article>
        }
      </div>

      <!-- Add Another Device Button -->
      <button
        type="button"
        (click)="store.addWizardDevice()"
        class="w-full py-3.5 px-4 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-2xl text-slate-600 hover:text-blue-700 text-xs font-bold transition-all flex items-center justify-center gap-2 group bg-white shadow-sm cursor-pointer"
      >
        <span class="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
          <svg class="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
        </span>
        <span>+ إضافة جهاز آخر</span>
      </button>


      <!-- Wizard Action Footer Card -->
      <div class="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            (click)="store.setWizardStep(4)"
            class="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>التالي: المراجعة والتأكيد</span>
            <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
          </button>
          <button
            type="button"
            class="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors border border-slate-200"
          >
            حفظ كمسودة
          </button>
        </div>

        <button
          type="button"
          (click)="store.setWizardStep(2)"
          class="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4 rtl:rotate-0 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          <span>السابق: بيانات الدفع</span>
        </button>
      </div>
    </div>
  `
})
export class StepDevices {
  readonly store = inject(OrdersStore);

  readonly deviceTypeOptions: SelectOption[] = [
    { label: 'شاشة سامسونج ذكية - Samsung Tizen', value: 'Samsung Smart TV (Tizen)', icon: 'tv', badge: 'Tizen OS', badgeClass: 'bg-blue-100 text-blue-700 border border-blue-200', searchKeywords: ['سامسونج', 'samsung', 'tizen', 'شاشة', 'tv'] },
    { label: 'شاشة إل جي ذكية - LG webOS', value: 'LG Smart TV (webOS)', icon: 'tv', badge: 'webOS', badgeClass: 'bg-rose-100 text-rose-700 border border-rose-200', searchKeywords: ['ال جي', 'lg', 'webos', 'شاشة', 'tv'] },
    { label: 'شاشة أندرويد - Android TV / Google TV', value: 'Android TV / Google TV', icon: 'smart_display', badge: 'Android TV', badgeClass: 'bg-emerald-100 text-emerald-700 border border-emerald-200', searchKeywords: ['اندرويد', 'android', 'google', 'tv', 'شاشة', 'سوني', 'tcl', 'شاومي'] },
    { label: 'جهاز آبل تي في - Apple TV', value: 'Apple TV', icon: 'devices', badge: 'tvOS', badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200', searchKeywords: ['apple', 'tv', 'ابل', 'تيفي', 'tvos'] },
    { label: 'جهاز أندرويد بوكس - Xiaomi / Android Box', value: 'Android Box', icon: 'tv_gen', badge: 'Android Box', badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200', searchKeywords: ['شاومي', 'بوكس', 'android', 'box', 'ريسيفر', 'mi'] },
    { label: 'أمازون فاير ستيك - Amazon Fire TV', value: 'Amazon Fire TV', icon: 'cast', badge: 'FireOS', badgeClass: 'bg-orange-100 text-orange-700 border border-orange-200', searchKeywords: ['firestick', 'fire', 'tv', 'amazon', 'امازون', 'ستيك'] },
    { label: 'جهاز ماج - MAG / Stalker Portal', value: 'MAG Device', icon: 'developer_board', badge: 'MAG/Portal', badgeClass: 'bg-purple-100 text-purple-700 border border-purple-200', searchKeywords: ['mag', 'stalker', 'portal', 'انفيجن', '250', '254', '322'] },
    { label: 'جهاز فورمولر - Formuler / Z-Series', value: 'Formuler Box', icon: 'screenshot_monitor', badge: 'Formuler', badgeClass: 'bg-indigo-100 text-indigo-700 border border-indigo-200', searchKeywords: ['formuler', 'z8', 'z10', 'z11', 'فورمولر'] },
    { label: 'آيفون / آيباد - Apple iOS', value: 'iOS (iPhone / iPad)', icon: 'phone_iphone', badge: 'iOS', badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200', searchKeywords: ['ايفون', 'ايباد', 'iphone', 'ipad', 'ios'] },
    { label: 'هاتف أندرويد - Android Mobile', value: 'Android Mobile', icon: 'smartphone', badge: 'Android', badgeClass: 'bg-emerald-100 text-emerald-700 border border-emerald-200', searchKeywords: ['جوال', 'سامسونج', 'هاتف', 'اندرويد', 'تابلت', 'mobile'] },
    { label: 'حاسوب ويندوز - Windows PC', value: 'Windows PC', icon: 'desktop_windows', badge: 'Windows', badgeClass: 'bg-blue-100 text-blue-700 border border-blue-200', searchKeywords: ['كمبيوتر', 'بي سي', 'pc', 'windows', 'ويندوز'] },
    { label: 'حاسوب ماك - Apple macOS', value: 'macOS', icon: 'laptop_mac', badge: 'macOS', badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200', searchKeywords: ['ماك', 'mac', 'macbook', 'ابل'] }
  ];

  readonly appOptions: SelectOption[] = [
    { 
      label: 'IBO Player Pro', 
      value: 'IBO Player Pro', 
      icon: 'tv', 
      badge: 'Smart TV / Android',
      badgeClass: 'bg-blue-100 text-blue-700 border border-blue-200',
      searchKeywords: ['ibo', 'player', 'pro', 'شاشة', 'ذكية', 'smart', 'tv', 'tizen', 'webos', 'android', 'سامسونج', 'lg', 'شاشات']
    },
    { 
      label: 'IPTV Smarters Pro', 
      value: 'IPTV Smarters Pro', 
      icon: 'devices', 
      badge: 'متعدد المنصات',
      badgeClass: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      searchKeywords: ['smarters', 'pro', 'iptv', 'الكل', 'ios', 'android', 'tv', 'شاشة', 'جوال', 'وندوز', 'mac']
    },
    { 
      label: 'TiviMate IPTV Player', 
      value: 'TiviMate', 
      icon: 'live_tv', 
      badge: 'Android TV / Firestick',
      badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200',
      searchKeywords: ['tivimate', 'tivi', 'mate', 'اندرويد', 'android', 'box', 'firestick', 'شاومي', 'ريسيفر']
    },
    { 
      label: 'SmartOne IPTV', 
      value: 'SmartOne IPTV', 
      icon: 'tv', 
      badge: 'Samsung / LG Smart TV',
      badgeClass: 'bg-blue-100 text-blue-700 border border-blue-200',
      searchKeywords: ['smartone', 'smart', 'one', 'شاشة', 'سامسونج', 'samsung', 'lg', 'webos', 'tizen']
    },
    { 
      label: 'BOB Player', 
      value: 'BOB Player', 
      icon: 'smart_display', 
      badge: 'Smart TV',
      badgeClass: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
      searchKeywords: ['bob', 'player', 'شاشات', 'tv', 'tizen', 'webos', 'سامسونج']
    },
    { 
      label: 'Flix IPTV', 
      value: 'Flix IPTV', 
      icon: 'play_circle', 
      badge: 'Smart TV / Android',
      badgeClass: 'bg-purple-100 text-purple-700 border border-purple-200',
      searchKeywords: ['flix', 'iptv', 'شاشة', 'اندرويد', 'firestick', 'android']
    },
    { 
      label: 'XCIPTV Player', 
      value: 'XCIPTV Player', 
      icon: 'screenshot_monitor', 
      badge: 'Android Box / Fire TV',
      badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200',
      searchKeywords: ['xciptv', 'xc', 'iptv', 'اندرويد', 'fire', 'tv', 'stick', 'box']
    },
    { 
      label: 'Smarters Player Lite (iOS)', 
      value: 'Smarters Pro iOS', 
      icon: 'phone_iphone', 
      badge: 'iPhone / iPad / Apple TV',
      badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
      searchKeywords: ['smarters', 'ios', 'iphone', 'ipad', 'apple', 'ايفون', 'ايباد', 'ابل']
    },
    { 
      label: 'DuplexPlay', 
      value: 'DuplexPlay', 
      icon: 'desktop_windows', 
      badge: 'Smart TV / PC',
      badgeClass: 'bg-teal-100 text-teal-700 border border-teal-200',
      searchKeywords: ['duplex', 'play', 'duplexplay', 'كمبيوتر', 'pc', 'شاشة']
    },
    { 
      label: 'NET IPTV', 
      value: 'NET IPTV', 
      icon: 'tv', 
      badge: 'Samsung / LG Smart TV',
      badgeClass: 'bg-blue-100 text-blue-700 border border-blue-200',
      searchKeywords: ['net', 'iptv', 'netiptv', 'شاشة', 'سامسونج', 'lg']
    },
    { 
      label: 'OTT Navigator IPTV', 
      value: 'OTT Navigator', 
      icon: 'smart_display', 
      badge: 'Android TV',
      badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200',
      searchKeywords: ['ott', 'navigator', 'اندرويد', 'android']
    },
    { 
      label: 'Bay TV', 
      value: 'Bay TV', 
      icon: 'tv', 
      badge: 'Smart TV',
      badgeClass: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
      searchKeywords: ['bay', 'tv', 'baytv', 'شاشة', 'ذكية']
    },
    { 
      label: 'GSE Smart IPTV', 
      value: 'GSE Smart IPTV', 
      icon: 'phone_iphone', 
      badge: 'iOS / macOS',
      badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
      searchKeywords: ['gse', 'smart', 'iptv', 'apple', 'ios', 'mac', 'ابل']
    }
  ];
}

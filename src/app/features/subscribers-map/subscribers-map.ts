import { Component, inject, signal, effect, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterPanel } from '../../shared/components/filter-panel/filter-panel';
import { SubscribersMapStore } from './store/subscribers-map.store';
import { MapSubscriberPin } from './models/subscriber-map.models';
import * as L from 'leaflet';

@Component({
  selector: 'app-subscribers-map',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPanel],
  templateUrl: './subscribers-map.html',
  styleUrls: ['./subscribers-map.scss'],
  host: {
    class: 'flex-1 min-h-0 overflow-y-auto w-full p-space-sm sm:p-space-md lg:p-space-lg'
  }
})
export class SubscribersMap implements AfterViewInit {
  store = inject(SubscribersMapStore);

  isFilterPanelOpen = signal(false);

  // Form values for filters
  statusFilter = signal<string>('all');
  cityFilter = signal<string>('all');

  private map: L.Map | undefined;
  private markers: L.Marker[] = [];

  constructor() {
    effect(() => {
      const subscribers = this.store.filteredSubscribers();
      if (this.map) {
        // Clear existing markers
        this.markers.forEach(m => m.remove());
        this.markers = [];

        // Add new markers
        subscribers.forEach(sub => {
          if (sub.coordinates && sub.coordinates.lat && sub.coordinates.lng) {
            const statusClass = sub.status === 'active' ? 'bg-secondary' : 'bg-error';
            const statusBgClass = sub.status === 'active' ? 'bg-secondary/20' : 'bg-error/20';
            const statusLabelClass = sub.status === 'active' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-error-container text-error';
            const statusText = sub.status === 'active' ? 'نشط' : (sub.status === 'expired' ? 'منتهي' : 'معلق');

            const customIcon = L.divIcon({
              className: 'custom-crm-marker bg-transparent',
              html: `
                <div class="relative flex items-center justify-center group">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${statusBgClass}">
                    <div class="w-4 h-4 rounded-full shadow-md ${statusClass}"></div>
                  </div>
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
              popupAnchor: [0, -16]
            });

            const popupHtml = `
              <div class="text-right p-1" dir="rtl">
                <div class="font-bold text-[14px] text-surface-900 mb-1">${sub.name}</div>
                <div class="text-[12px] text-surface-600 mb-2">${sub.city || 'مدينة غير محددة'}</div>
                <div class="text-[11px] font-semibold px-2 py-0.5 rounded-full inline-block ${statusLabelClass}">
                  ${statusText}
                </div>
              </div>
            `;

            const marker = L.marker([sub.coordinates.lat, sub.coordinates.lng], { icon: customIcon })
              .bindPopup(popupHtml)
              .addTo(this.map!);
            this.markers.push(marker);
          }
        });
      }
    });

    effect(() => {
      const zoom = this.store.zoomLevel();
      if (this.map && this.map.getZoom() !== zoom) {
        this.map.setZoom(zoom);
      }
    });
  }

  ngAfterViewInit(): void {
    // Fix default icon issue with Leaflet in Angular
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    // Center on US by default
    this.map = L.map('leaflet-map', {
      zoomControl: false,
      attributionControl: false
    }).setView([39.8283, -98.5795], 4);

    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(this.map);

    // Invalidate size to ensure map fills the container properly after render
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 250);
  }

  zoomIn(): void {
    this.map?.zoomIn();
  }

  zoomOut(): void {
    this.map?.zoomOut();
  }

  resetView(): void {
    if (this.markers.length > 0) {
      const group = L.featureGroup(this.markers);
      this.map?.fitBounds(group.getBounds().pad(0.2));
    } else {
      this.map?.setView([39.8283, -98.5795], 4);
    }
  }

  toggleFullscreen(): void {
    const mapContainer = document.getElementById('mapWorkspace');
    if (!document.fullscreenElement && mapContainer) {
      if (mapContainer.requestFullscreen) {
        mapContainer.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 300);
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.store.setSearchQuery(target.value);
  }

  applyFilters(): void {
    this.store.setFilterStatus(this.statusFilter() as any);
    this.store.setFilterCity(this.cityFilter());
    this.isFilterPanelOpen.set(false);
  }

  clearFilters(): void {
    this.statusFilter.set('all');
    this.cityFilter.set('all');
    this.store.clearFilters();
  }
}

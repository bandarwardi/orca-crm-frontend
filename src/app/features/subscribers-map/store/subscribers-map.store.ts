import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import {
  MapFilterState,
  MapSubscriberPin,
  ServerStatus
} from '../models/subscriber-map.models';
import { CustomersApiService } from '../../../core/services/api/customers-api.service';

export interface SubscribersMapState {
  subscribers: MapSubscriberPin[];
  filters: MapFilterState;
  selectedSubscriberId: string | null;
  zoomLevel: number;
  isLiveUpdateActive: boolean;
  serverStatus: ServerStatus;
}

const initialState: SubscribersMapState = {
  subscribers: [],
  filters: {
    searchQuery: '',
    status: 'all',
    city: 'all'
  },
  selectedSubscriberId: null,
  zoomLevel: 5,
  isLiveUpdateActive: true,
  serverStatus: {
    isOnline: true,
    uptimePercentage: 99.98
  }
};

export const SubscribersMapStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ subscribers, filters }) => ({
    filteredSubscribers: computed(() => {
      const query = filters.searchQuery().toLowerCase().trim();
      const status = filters.status();
      const city = filters.city();

      return subscribers().filter(sub => {
        const matchesSearch = !query || sub.name.toLowerCase().includes(query) || (sub.city && sub.city.toLowerCase().includes(query));
        const matchesStatus = status === 'all' || sub.status === status;
        const matchesCity = city === 'all' || sub.city === city;
        
        return matchesSearch && matchesStatus && matchesCity;
      });
    }),
    totalConnectionPoints: computed(() => {
      return subscribers().length;
    })
  })),
  withMethods((store, customersApi = inject(CustomersApiService)) => ({
    loadPins: rxMethod<void>(
      pipe(
        switchMap(() => customersApi.getMapPins().pipe(
          tap({
            next: (res: any) => {
              const rawPins = Array.isArray(res) ? res : (res?.data || []);
              const pins = rawPins.map((p: any) => ({
                id: p.id,
                name: p.name,
                city: p.city,
                status: 'active', // default status
                coordinates: { lat: parseFloat(p.lat), lng: parseFloat(p.lng) }
              }));
              patchState(store, { subscribers: pins });
            },
            error: (err) => console.error('Failed to load map pins', err)
          })
        ))
      )
    ),
    setZoom(factor: number): void {
      const current = store.zoomLevel();
      const newZoom = Math.min(Math.max(current + factor, 1), 18);
      patchState(store, { zoomLevel: newZoom });
    },
    resetZoom(): void {
      patchState(store, { zoomLevel: 1 });
    },
    selectSubscriber(id: string | null): void {
      patchState(store, { selectedSubscriberId: id });
    },
    setSearchQuery(query: string): void {
      patchState(store, (state) => ({
        filters: { ...state.filters, searchQuery: query }
      }));
    },
    setFilterStatus(status: MapFilterState['status']): void {
      patchState(store, (state) => ({
        filters: { ...state.filters, status }
      }));
    },
    setFilterCity(city: string): void {
      patchState(store, (state) => ({
        filters: { ...state.filters, city }
      }));
    },
    clearFilters(): void {
      patchState(store, (state) => ({
        filters: { searchQuery: '', status: 'all' as MapFilterState['status'], city: 'all' }
      }));
    },
    toggleLiveStatus(): void {
      patchState(store, { isLiveUpdateActive: !store.isLiveUpdateActive() });
    }
  })),
  withMethods((store) => ({
    refreshData(): void {
      store.loadPins();
    }
  })),
  withHooks({
    onInit(store) {
      store.loadPins();
    }
  })
);

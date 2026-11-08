export type SubscriberStatus = 'active' | 'expired' | 'pending';
export type NodeType = 'hub' | 'subscriber' | 'alert';

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface MapSubscriberPin {
  id: string;
  name: string;
  status: SubscriberStatus;
  city: string;
  coordinates: MapCoordinates;
  icon?: string;
  isPulsing?: boolean;
}

export interface MapFilterState {
  searchQuery: string;
  status: SubscriberStatus | 'all';
  city: string | 'all';
}

export interface ServerStatus {
  isOnline: boolean;
  uptimePercentage: number;
}

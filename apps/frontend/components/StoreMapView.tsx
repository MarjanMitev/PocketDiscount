import { StoreLocation } from '@/services/types';

interface Props {
  filteredStores: (StoreLocation & { distance?: number })[];
  locationGranted: boolean;
  center: { latitude: number; longitude: number };
  onNavigate: (store: StoreLocation) => void;
}

export default function StoreMapView(_props: Props) {
  return null;
}

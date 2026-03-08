import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { StoreLocation } from '@/services/types';

interface Props {
  filteredStores: (StoreLocation & { distance?: number })[];
  locationGranted: boolean;
  center: { latitude: number; longitude: number };
  onNavigate: (store: StoreLocation) => void;
}

export default function StoreMapView({ filteredStores, locationGranted, center }: Props) {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        ...center,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }}
      showsUserLocation={locationGranted}
      showsMyLocationButton={true}
    >
      {filteredStores.map((store) => (
        <Marker
          key={store.id}
          coordinate={{ latitude: store.lat, longitude: store.lng }}
          title={store.name}
          description={store.address}
          pinColor={store.color}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { height: 220 },
});

import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

type Medic = {
  latitude: number;
  longitude: number;
};

type Props = {
  medics: Medic[];
};

export const EmergencyMap = ({ medics }: Props) => {
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});

      setLocation(currentLocation.coords);
    } finally {
      setLoading(false);
    }
  };

  const initialRegion = useMemo(() => {
    if (!location) {
      return {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    return {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }, [location]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton
    >
      {location && (
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="You"
          pinColor="blue"
        />
      )}

      {medics.map((medic) => (
        <Marker
          key={medic.latitude + medic.longitude}
          coordinate={{
            latitude: medic.latitude,
            longitude: medic.longitude,
          }}
          title="Paramedic"
          description="Nearby medic"
          pinColor="red"
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: 250,
    height: 188,
    borderRadius: 24,
  },

  loader: {
    width: 250,
    height: 188,
    justifyContent: "center",
    alignItems: "center",
  },
});

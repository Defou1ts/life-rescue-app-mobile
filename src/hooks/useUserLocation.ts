import * as Location from "expo-location";
import { useEffect, useState } from "react";

const MOCK_LOCATION = {
  latitude: 53.9023,
  longitude: 27.5619,
};

type Coords = {
  latitude: number;
  longitude: number;
};

export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState<Coords | null>(null);

  useEffect(() => {
    let watchSub: Location.LocationSubscription | null = null;
    let cancelled = false;

    const init = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      let coords: Coords;
      if (status !== "granted") {
        coords = MOCK_LOCATION;
      } else {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
      }

      if (cancelled) return;
      setUserLocation(coords);

      if (status === "granted") {
        watchSub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000,
            distanceInterval: 5,
          },
          (loc) => {
            setUserLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
          },
        );
      }
    };

    void init();

    return () => {
      cancelled = true;
      watchSub?.remove();
    };
  }, []);

  return { userLocation };
};

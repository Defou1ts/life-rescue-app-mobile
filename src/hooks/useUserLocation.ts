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
    const initializeLocation = async () => {
      let coords: Coords;

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        coords = MOCK_LOCATION;
      } else {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        coords = {
          latitude: location.coords.latitude,

          longitude: location.coords.longitude,
        };
      }

      setUserLocation(coords);
    };
    initializeLocation();
  }, []);

  return { userLocation };
};

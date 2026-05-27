// src/components/emergency-map.tsx

import { ActiveEmergency } from "@/api/hooks/useGetActiveEmergencyRequest";
import { useParamedicsNearby } from "@/api/hooks/useParamedicsNeaby";
import { useUserLocation } from "@/hooks/useUserLocation";

import { signalRService } from "@/services/signalr";

import { useEffect, useMemo, useRef, useState } from "react";

import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { WebView } from "react-native-webview";

const USE_MOCK_LOCATION = false;

const MOCK_LOCATION = {
  latitude: 53.9023,
  longitude: 27.5619,
};

type Coords = {
  latitude: number;
  longitude: number;
};

type Props = {
  activeEmergency?: ActiveEmergency | null;
};

export const EmergencyMap = ({ activeEmergency }: Props) => {
  const webViewRef = useRef<WebView>(null);

  const { mutateAsync: fetchParamedics, isPending } = useParamedicsNearby();

  const [loading, setLoading] = useState(true);

  const { userLocation } = useUserLocation();

  const [nearbyMedics, setNearbyMedics] = useState<Coords[]>([]);

  const [paramedicLocation, setParamedicLocation] = useState<Coords | null>(
    null,
  );

  const [estimatedArrival, setEstimatedArrival] = useState<string | null>(null);

  useEffect(() => {
    if (userLocation) {
      initialize();
    }
  }, [userLocation]);

  useEffect(() => {
    signalRService.onReceiveParamedicLocation = (payload) => {
      if (payload.emergencyId !== activeEmergency?.id) {
        return;
      }

      setParamedicLocation(payload.paramedicLocation);
    };

    return () => {
      signalRService.onReceiveParamedicLocation = null;
    };
  }, [activeEmergency?.id]);

  useEffect(() => {
    if (!paramedicLocation || !userLocation) {
      return;
    }

    setEstimatedArrival(calculateETA(paramedicLocation, userLocation));
  }, [paramedicLocation, userLocation]);

  const initialize = async () => {
    try {
      if (userLocation) {
        const medics = await fetchParamedics({
          latitude: userLocation.latitude,

          longitude: userLocation.longitude,
        });

        setNearbyMedics(medics ?? []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const calculateETA = (from: Coords, to: Coords) => {
    const R = 6371;

    const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;

    const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((from.latitude * Math.PI) / 180) *
        Math.cos((to.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    const etaMinutes = Math.max(1, Math.round((distance / 40) * 60));

    return `${etaMinutes}-${etaMinutes + 3} min`;
  };

  const html = useMemo(() => {
    if (!userLocation) {
      return null;
    }

    const nearbyMarkersJS = nearbyMedics
      .map(
        (medic) => `
        L.marker([${medic.latitude}, ${medic.longitude}])
          .addTo(map)
          .bindPopup('Nearby paramedic');
      `,
      )
      .join("\n");

    const activeParamedicJS =
      activeEmergency && paramedicLocation
        ? `
        L.marker([${paramedicLocation.latitude}, ${paramedicLocation.longitude}])
          .addTo(map)
          .bindPopup('Assigned paramedic');

        var routeLine = L.polyline([
          [${userLocation.latitude}, ${userLocation.longitude}],
          [${paramedicLocation.latitude}, ${paramedicLocation.longitude}]
        ], { color: '#0D9488', weight: 4 }).addTo(map);

        map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
      `
        : "";

    /**
     * Always show nearby medics.
     * When activeEmergency exists and paramedicLocation arrives — also draw
     * the assigned paramedic marker + route line on top.
     */
    const markersJS = `${nearbyMarkersJS}\n${activeParamedicJS}`;

    return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      var map = L.map('map', { zoomControl: false })
        .setView([${userLocation.latitude}, ${userLocation.longitude}], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      L.marker([${userLocation.latitude}, ${userLocation.longitude}])
        .addTo(map)
        .bindPopup('You')
        .openPopup();

      ${markersJS}
    </script>
  </body>
</html>`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userLocation?.latitude,
    userLocation?.longitude,
    nearbyMedics,
    activeEmergency?.id,
    paramedicLocation?.latitude,
    paramedicLocation?.longitude,
  ]);

  if (loading || isPending || !userLocation || !html) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
      />

      {activeEmergency && estimatedArrival && (
        <View style={styles.etaContainer}>
          <Text style={styles.etaText}>Arriving in {estimatedArrival}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 400,
    height: 300,
    overflow: "hidden",
  },

  map: {
    flex: 1,
  },

  loader: {
    width: 250,
    height: 188,
    justifyContent: "center",
    alignItems: "center",
  },

  etaContainer: {
    position: "absolute",

    bottom: 10,

    alignSelf: "center",

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 14,

    paddingVertical: 8,

    borderRadius: 20,

    shadowColor: "#000",

    shadowOffset: {
      width: 2,
      height: 2,
    },

    shadowOpacity: 0.12,

    shadowRadius: 6,

    elevation: 4,
  },

  etaText: {
    color: "#0D9488",

    fontWeight: "600",

    fontSize: 14,
  },
});

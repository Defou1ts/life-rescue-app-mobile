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

  /**
   * WebView + Leaflet is sensitive to frequent source reloads.
   * We normalize coords/arrays to avoid regenerating HTML for tiny float jitter.
   */
  const roundCoord = (v: number, decimals = 5) =>
    Math.round(v * 10 ** decimals) / 10 ** decimals;

  const normalizedUser = useMemo(() => {
    if (!userLocation) return null;
    return {
      latitude: roundCoord(userLocation.latitude, 5),
      longitude: roundCoord(userLocation.longitude, 5),
    };
  }, [userLocation?.latitude, userLocation?.longitude]);

  const normalizedParamedic = useMemo(() => {
    if (!paramedicLocation) return null;
    return {
      latitude: roundCoord(paramedicLocation.latitude, 5),
      longitude: roundCoord(paramedicLocation.longitude, 5),
    };
  }, [paramedicLocation?.latitude, paramedicLocation?.longitude]);

  const nearbyMedicsKey = useMemo(() => {
    if (!nearbyMedics?.length) return "";
    // stable ordering + rounding so small float noise doesn't reload map
    const normalized = nearbyMedics
      .map((m) => ({
        latitude: roundCoord(m.latitude, 5),
        longitude: roundCoord(m.longitude, 5),
      }))
      .sort((a, b) => {
        if (a.latitude !== b.latitude) return a.latitude - b.latitude;
        return a.longitude - b.longitude;
      });

    return normalized.map((m) => `${m.latitude},${m.longitude}`).join("|");
  }, [nearbyMedics]);

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

        // avoid state updates if the list is effectively the same
        const next = medics ?? [];
        setNearbyMedics((prev) => {
          if (!prev?.length && !next.length) return prev;
          const prevKey = prev
            .map((m) => `${roundCoord(m.latitude, 5)},${roundCoord(m.longitude, 5)}`)
            .sort()
            .join("|");
          const nextKey = next
            .map((m) => `${roundCoord(m.latitude, 5)},${roundCoord(m.longitude, 5)}`)
            .sort()
            .join("|");
          return prevKey === nextKey ? prev : next;
        });
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
    if (!normalizedUser) {
      return null;
    }

    const nearbyMarkersJS = nearbyMedicsKey
      ? nearbyMedicsKey
          .split("|")
          .filter(Boolean)
          .map((pair) => {
            const [lat, lng] = pair.split(",").map(Number);
            return `
              L.marker([${lat}, ${lng}])
                .addTo(map)
                .bindPopup('Nearby paramedic');
            `;
          })
          .join("\n")
      : "";

    const activeParamedicJS =
      activeEmergency && normalizedParamedic
        ? `
        L.marker([${normalizedParamedic.latitude}, ${normalizedParamedic.longitude}])
          .addTo(map)
          .bindPopup('Assigned paramedic');

        var routeLine = L.polyline([
          [${normalizedUser.latitude}, ${normalizedUser.longitude}],
          [${normalizedParamedic.latitude}, ${normalizedParamedic.longitude}]
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
        .setView([${normalizedUser.latitude}, ${normalizedUser.longitude}], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      L.marker([${normalizedUser.latitude}, ${normalizedUser.longitude}])
        .addTo(map)
        .bindPopup('You')
        .openPopup();

      ${markersJS}
    </script>
  </body>
</html>`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    normalizedUser?.latitude,
    normalizedUser?.longitude,
    nearbyMedicsKey,
    activeEmergency?.id,
    normalizedParamedic?.latitude,
    normalizedParamedic?.longitude,
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

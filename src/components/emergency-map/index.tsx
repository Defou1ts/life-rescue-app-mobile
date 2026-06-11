import { useMemo } from "react";

import { useDrivingRoute } from "@/hooks/useDrivingRoute";
import type { Coordinates } from "@/types/emergency";
import { formatDrivingEta } from "@/utils/fetchDrivingRoute";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

const MAP_HEIGHT = 300;
const MAP_WIDTH = Dimensions.get("window").width - 84;

type Props = {
  userLocation: Coordinates | null;
  paramedicLocation: Coordinates | null;
  nearbyMedics?: Coordinates[];
  hasActiveEmergency?: boolean;
  isLoading?: boolean;
};

/**
 * Round to N decimals so small GPS float jitter doesn't regenerate
 * the HTML string and cause a WebView reload every few seconds.
 */
const roundCoord = (v: number, decimals = 5) =>
  Math.round(v * 10 ** decimals) / 10 ** decimals;

const fallbackEta = (from: Coordinates, to: Coordinates): string => {
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
  const minutes = Math.max(1, Math.round((distance / 40) * 60));
  return `${minutes}-${minutes + 3} min`;
};

export const EmergencyMap = ({
  userLocation,
  paramedicLocation,
  nearbyMedics = [],
  hasActiveEmergency = false,
  isLoading = false,
}: Props) => {
  const normalizedUser = useMemo(() => {
    if (!userLocation) return null;
    return {
      latitude: roundCoord(userLocation.latitude),
      longitude: roundCoord(userLocation.longitude),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation?.latitude, userLocation?.longitude]);

  const normalizedParamedic = useMemo(() => {
    if (!paramedicLocation) return null;
    return {
      latitude: roundCoord(paramedicLocation.latitude),
      longitude: roundCoord(paramedicLocation.longitude),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramedicLocation?.latitude, paramedicLocation?.longitude]);

  const nearbyMedicsKey = useMemo(() => {
    if (!nearbyMedics.length) return "";
    const normalized = nearbyMedics
      .map((m) => ({
        latitude: roundCoord(m.latitude),
        longitude: roundCoord(m.longitude),
      }))
      .sort((a, b) => {
        if (a.latitude !== b.latitude) return a.latitude - b.latitude;
        return a.longitude - b.longitude;
      });

    return normalized.map((m) => `${m.latitude},${m.longitude}`).join("|");
  }, [nearbyMedics]);

  const { route } = useDrivingRoute(normalizedParamedic, normalizedUser);

  const routeKey = useMemo(() => {
    if (!route) {
      return null;
    }

    const first = route.coordinates[0];
    const last = route.coordinates[route.coordinates.length - 1];

    return `${route.coordinates.length}:${first.latitude},${first.longitude}:${last.latitude},${last.longitude}:${route.durationSeconds}`;
  }, [route]);

  const estimatedArrival =
    normalizedParamedic && normalizedUser
      ? route
        ? formatDrivingEta(route.durationSeconds)
        : fallbackEta(normalizedParamedic, normalizedUser)
      : null;

  const html = useMemo(() => {
    if (!normalizedUser) return null;

    const nearbyMarkersJS =
      !hasActiveEmergency && nearbyMedicsKey
        ? nearbyMedicsKey
            .split("|")
            .filter(Boolean)
            .map((pair) => {
              const [lat, lng] = pair.split(",").map(Number);
              return `
        L.circleMarker(
          [${lat}, ${lng}],
          {
            radius: 7,
            color: '#047857',
            weight: 2,
            opacity: 1,
            fillColor: '#6EE7B7',
            fillOpacity: 0.9
          }
        )
          .addTo(map)
          .bindPopup('Nearby paramedic');
      `;
            })
            .join("\n")
        : "";

    const paramedicJS = normalizedParamedic
      ? (() => {
          const routeCoords =
            route && route.coordinates.length >= 2
              ? route.coordinates.map(({ latitude, longitude }) => [
                  latitude,
                  longitude,
                ])
              : [
                  [
                    normalizedParamedic.latitude,
                    normalizedParamedic.longitude,
                  ],
                  [normalizedUser.latitude, normalizedUser.longitude],
                ];

          return `
        L.circleMarker(
          [${normalizedParamedic.latitude}, ${normalizedParamedic.longitude}],
          {
            radius: 9,
            color: '#047857',
            weight: 3,
            opacity: 1,
            fillColor: '#34D399',
            fillOpacity: 0.95
          }
        )
          .addTo(map)
          .bindPopup('Paramedic');

        var routeCoords = ${JSON.stringify(routeCoords)};
        var routeLine = L.polyline(routeCoords, {
          color: '#0D9488',
          weight: 5,
          opacity: 0.9
        }).addTo(map);

        map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
      `;
        })()
      : "";

    return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; width: 100%; height: ${MAP_HEIGHT}px; overflow: hidden; }
      #map { width: 100%; height: ${MAP_HEIGHT}px; }
      .leaflet-control-attribution { display: none; }
      .leaflet-control-zoom { display: none; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      try {
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
        });
      } catch (e) {}

      var map = L.map('map', { zoomControl: false })
        .setView([${normalizedUser.latitude}, ${normalizedUser.longitude}], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        keepBuffer: 4
      }).addTo(map);

      L.circleMarker(
        [${normalizedUser.latitude}, ${normalizedUser.longitude}],
        {
          radius: 9,
          color: '#2563EB',
          weight: 3,
          opacity: 1,
          fillColor: '#60A5FA',
          fillOpacity: 0.95
        }
      )
        .addTo(map)
        .bindPopup('You');

      ${nearbyMarkersJS}
      ${paramedicJS}

      setTimeout(function() { map.invalidateSize(); }, 300);
    </script>
  </body>
</html>`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    normalizedUser?.latitude,
    normalizedUser?.longitude,
    normalizedParamedic?.latitude,
    normalizedParamedic?.longitude,
    nearbyMedicsKey,
    hasActiveEmergency,
    routeKey,
  ]);

  if (!html) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <WebView
          originWhitelist={["*"]}
          source={{ html }}
          style={styles.map}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          allowsFullscreenVideo={false}
          mixedContentMode="always"
          cacheEnabled
          cacheMode="LOAD_DEFAULT"
          setSupportMultipleWindows={false}
          scrollEnabled={false}
          bounces={false}
        />
      </View>

      {hasActiveEmergency && !!estimatedArrival && (
        <View style={styles.etaContainer}>
          <View style={styles.etaDot} />
          <View>
            <Text style={styles.etaTitle}>Estimated Arrival</Text>
            <Text style={styles.etaText}>{estimatedArrival}</Text>
          </View>
        </View>
      )}

      {isLoading && (
        <View style={styles.statusOverlay}>
          <ActivityIndicator size="small" color="#0D9488" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    alignSelf: "center",
  },
  container: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  map: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    backgroundColor: "transparent",
  },
  loader: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  statusOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 28,
  },
  etaContainer: {
    position: "absolute",
    bottom: 18,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  etaDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#22C55E",
  },
  etaTitle: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  etaText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "700",
  },
});


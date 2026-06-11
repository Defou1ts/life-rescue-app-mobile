import type { Coordinates } from "@/types/emergency";

export type DrivingRoute = {
  coordinates: Coordinates[];
  durationSeconds: number;
  distanceMeters: number;
};

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

export async function fetchDrivingRoute(
  from: Coordinates,
  to: Coordinates,
  signal?: AbortSignal,
): Promise<DrivingRoute | null> {
  const url =
    `${OSRM_BASE}/${from.longitude},${from.latitude};` +
    `${to.longitude},${to.latitude}?overview=simplified&geometries=geojson`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    code?: string;
    routes?: {
      duration: number;
      distance: number;
      geometry: { coordinates: [number, number][] };
    }[];
  };

  const route = data.routes?.[0];
  if (data.code !== "Ok" || !route) {
    return null;
  }

  return {
    coordinates: route.geometry.coordinates.map(([longitude, latitude]) => ({
      latitude,
      longitude,
    })),
    durationSeconds: route.duration,
    distanceMeters: route.distance,
  };
}

export function formatDrivingEta(durationSeconds: number): string {
  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  return `${minutes} min`;
}

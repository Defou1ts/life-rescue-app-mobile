import { useEffect, useState } from "react";

import type { Coordinates } from "@/types/emergency";
import {
  fetchDrivingRoute,
  type DrivingRoute,
} from "@/utils/fetchDrivingRoute";

const ROUTE_DEBOUNCE_MS = 1_000;

export function useDrivingRoute(
  from: Coordinates | null,
  to: Coordinates | null,
) {
  const [route, setRoute] = useState<DrivingRoute | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!from || !to) {
      setRoute(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    const timeout = setTimeout(() => {
      void fetchDrivingRoute(from, to, controller.signal)
        .then((result) => {
          if (!controller.signal.aborted) {
            setRoute(result);
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setRoute(null);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        });
    }, ROUTE_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [from?.latitude, from?.longitude, to?.latitude, to?.longitude]);

  return { route, isLoading };
}

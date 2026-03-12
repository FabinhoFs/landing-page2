import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "dtr_city";

export const useGeolocation = () => {
  const [city, setCity] = useState<string | null>(() => {
    // Priority 1: URL param
    const params = new URLSearchParams(window.location.search);
    const urlCity = params.get("cidade");
    if (urlCity) {
      localStorage.setItem(STORAGE_KEY, urlCity);
      return urlCity;
    }
    // Priority 2: localStorage cache
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) return cached;
    // Priority 3: null (will show fallback until API responds)
    return null;
  });

  const [detected, setDetected] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return !!params.get("cidade") || !!localStorage.getItem(STORAGE_KEY);
  });

  useEffect(() => {
    // Skip API if already resolved
    if (city) return;

    const controller = new AbortController();
    fetch("https://ipapi.co/json/", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data?.city) {
          localStorage.setItem(STORAGE_KEY, data.city);
          setCity(data.city);
          setDetected(true);
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [city]);

  // Helper: returns city or null
  // `detected` tells if city was found (for phrase switching)
  return { city, detected };
};

import { useState, useEffect } from "react";

export const useGeolocation = () => {
  const [city, setCity] = useState<string>("sua região");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch("https://ipapi.co/json/", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data?.city) setCity(data.city);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return { city, loading };
};

// Joe Street Cafe coordinates (Sitio Malinong East, Brgy. Layog, Maasin, Iloilo)
const CAFE_LAT = 10.9425778;
const CAFE_LNG = 122.4177239;
const ALLOWED_RADIUS_METERS = 100;

/**
 * Calculate distance between two coordinates using Haversine formula.
 * Returns distance in meters.
 */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface LocationCheck {
  allowed: boolean;
  distance: number;
  error?: string;
}

export function isWithinCafe(lat: number, lng: number): LocationCheck {
  const distance = haversineDistance(lat, lng, CAFE_LAT, CAFE_LNG);
  return {
    allowed: distance <= ALLOWED_RADIUS_METERS,
    distance: Math.round(distance),
  };
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });
}

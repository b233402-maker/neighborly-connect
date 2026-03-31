import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateProfile } from '@/hooks/useProfile';

interface UserLocation {
  lat: number;
  lng: number;
  isDefault: boolean;
}

const DEFAULT_LOCATION: UserLocation = { lat: 40.7128, lng: -74.006, isDefault: true };

export function useUserLocation() {
  const { profile } = useAuth();
  const [location, setLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);
  const updateProfile = useUpdateProfile();

  useEffect(() => {
    // If profile has real coordinates (non-default), use those
    if (profile?.lat && profile?.lng) {
      const isDefault = profile.lat === 40.7128 && profile.lng === -74.006;
      setLocation({ lat: profile.lat, lng: profile.lng, isDefault });
      setLoading(false);
      return;
    }
    setLoading(false);
  }, [profile]);

  const requestLocation = (): Promise<UserLocation> => {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        resolve(DEFAULT_LOCATION);
        return;
      }

      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: UserLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            isDefault: false,
          };
          setLocation(loc);
          setLoading(false);

          // Persist to profile
          updateProfile.mutate({ lat: loc.lat, lng: loc.lng });
          resolve(loc);
        },
        () => {
          setLoading(false);
          resolve(location);
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    });
  };

  return { location, loading, requestLocation };
}

/**
 * Calculate distance between two lat/lng points in km (Haversine formula)
 */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Apply a blur offset to coordinates (for "blurred" privacy level)
 * Returns coordinates offset by ~500m in a random direction
 */
export function blurCoordinates(lat: number, lng: number, seed?: string): { lat: number; lng: number } {
  // Use seed for deterministic offset per user
  let hash = 0;
  const s = seed || `${lat}-${lng}`;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  const angle = (Math.abs(hash) % 360) * (Math.PI / 180);
  const offsetKm = 0.3 + (Math.abs(hash >> 8) % 5) * 0.04; // 0.3-0.5 km
  const dLat = (offsetKm / 111.32) * Math.cos(angle);
  const dLng = (offsetKm / (111.32 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle);
  return { lat: lat + dLat, lng: lng + dLng };
}

/**
 * Filter and transform locations based on privacy settings
 * @param viewerLat - viewer's latitude
 * @param viewerLng - viewer's longitude  
 * @param items - items with lat/lng/privacy_level/user_id
 * @param radiusKm - max radius to show
 * @param viewerId - current user's id
 */
export function filterByPrivacy<T extends { lat: number | null; lng: number | null; privacy_level?: string; user_id?: string; author_id?: string }>(
  viewerLat: number,
  viewerLng: number,
  items: T[],
  radiusKm: number,
  viewerId?: string,
): (T & { displayLat: number; displayLng: number; distanceKm: number })[] {
  return items
    .filter((item) => {
      if (!item.lat || !item.lng) return false;

      const privacy = item.privacy_level || 'public';
      const itemUserId = item.user_id || item.author_id;
      const isSelf = viewerId && itemUserId === viewerId;

      // Always show own items
      if (isSelf) return true;

      // "friends" privacy - skip (we don't have friends system yet, hide from non-friends)
      if (privacy === 'friends') return false;

      // "nearby" - only show within 2km
      if (privacy === 'nearby') {
        const dist = distanceKm(viewerLat, viewerLng, item.lat, item.lng);
        return dist <= 2;
      }

      // "blurred" and "public" - show within radius
      const dist = distanceKm(viewerLat, viewerLng, item.lat, item.lng);
      return dist <= radiusKm;
    })
    .map((item) => {
      const dist = distanceKm(viewerLat, viewerLng, item.lat!, item.lng!);
      const privacy = item.privacy_level || 'public';
      const itemUserId = item.user_id || item.author_id;
      const isSelf = viewerId && itemUserId === viewerId;

      let displayLat = item.lat!;
      let displayLng = item.lng!;

      // Apply blur for non-self "blurred" privacy
      if (!isSelf && privacy === 'blurred') {
        const blurred = blurCoordinates(item.lat!, item.lng!, itemUserId);
        displayLat = blurred.lat;
        displayLng = blurred.lng;
      }

      return { ...item, displayLat, displayLng, distanceKm: dist };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

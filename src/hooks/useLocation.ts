import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateProfile } from '@/hooks/useProfile';

interface UserLocation {
  lat: number;
  lng: number;
  isDefault: boolean;
  hasRealLocation: boolean;
}

const DEFAULT_LOCATION: UserLocation = { lat: 40.7128, lng: -74.006, isDefault: true, hasRealLocation: false };

/**
 * Check if coordinates are the database default (NYC fallback)
 */
function isDefaultCoords(lat: number | null, lng: number | null): boolean {
  if (!lat || !lng) return true;
  return Math.abs(lat - 40.7128) < 0.0001 && Math.abs(lng - (-74.006)) < 0.0001;
}

export function useUserLocation() {
  const { profile } = useAuth();
  const [location, setLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);
  const updateProfile = useUpdateProfile();

  useEffect(() => {
    if (profile?.lat && profile?.lng) {
      const hasReal = !isDefaultCoords(profile.lat, profile.lng);
      setLocation({ lat: profile.lat, lng: profile.lng, isDefault: !hasReal, hasRealLocation: hasReal });
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
            hasRealLocation: true,
          };
          setLocation(loc);
          setLoading(false);
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
 * Returns coordinates offset by ~300-500m in a deterministic direction per user
 */
export function blurCoordinates(lat: number, lng: number, seed?: string): { lat: number; lng: number } {
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
 * Privacy-aware location filter.
 * 
 * Rules:
 * 1. No real location (default coords) → NEVER shown on map
 * 2. Privacy = "public" → everyone within radius sees (Pro = exact, non-Pro = blurred)
 * 3. Privacy = "blurred" → everyone within radius sees blurred coords
 * 4. Privacy = "friends" → only mutual follows see location (Pro = exact, non-Pro = blurred)
 * 5. Privacy = "nearby" → only within 2km radius can see (Pro = exact, non-Pro = blurred)
 * 6. Own items always visible with exact coords
 * 
 * @param viewerLat - viewer's latitude
 * @param viewerLng - viewer's longitude
 * @param items - items with lat/lng/privacy_level/user_id
 * @param radiusKm - max discovery radius
 * @param viewerId - current user's id
 * @param friendIds - list of friend (mutual follow) user ids
 * @param viewerIsPro - whether the viewer is a Pro user
 */
export function filterByPrivacy<T extends { lat: number | null; lng: number | null; privacy_level?: string; user_id?: string; author_id?: string }>(
  viewerLat: number,
  viewerLng: number,
  items: T[],
  radiusKm: number,
  viewerId?: string,
  friendIds?: string[],
  viewerIsPro?: boolean,
): (T & { displayLat: number; displayLng: number; distanceKm: number; isBlurred: boolean })[] {
  const friendSet = new Set(friendIds || []);

  return items
    .filter((item) => {
      // Must have coordinates
      if (!item.lat || !item.lng) return false;

      // Skip users with default/no real location
      if (isDefaultCoords(item.lat, item.lng)) return false;

      const privacy = item.privacy_level || 'public';
      const itemUserId = item.user_id || item.author_id;
      const isSelf = viewerId && itemUserId === viewerId;

      // Always show own items
      if (isSelf) return true;

      const dist = distanceKm(viewerLat, viewerLng, item.lat, item.lng);

      switch (privacy) {
        case 'friends':
          // Only visible to mutual follows (friends)
          return itemUserId ? friendSet.has(itemUserId) : false;

        case 'nearby':
          // Only visible within 2km
          return dist <= 2;

        case 'blurred':
          // Visible to anyone within the discovery radius
          return dist <= radiusKm;

        case 'public':
          // Visible to anyone within the discovery radius
          return dist <= radiusKm;

        default:
          return dist <= radiusKm;
      }
    })
    .map((item) => {
      const dist = distanceKm(viewerLat, viewerLng, item.lat!, item.lng!);
      const privacy = item.privacy_level || 'public';
      const itemUserId = item.user_id || item.author_id;
      const isSelf = viewerId && itemUserId === viewerId;
      const isFriend = itemUserId ? friendSet.has(itemUserId) : false;

      let displayLat = item.lat!;
      let displayLng = item.lng!;
      let isBlurred = false;

      if (!isSelf) {
        // Determine if we show exact or blurred
        // Pro viewers see exact for "public" privacy only
        // Friends always see exact for "friends" privacy
        // Everything else gets blurred for non-Pro
        if (privacy === 'public' && viewerIsPro) {
          // Pro user sees exact location for public profiles
          isBlurred = false;
        } else if (privacy === 'friends' && isFriend) {
          // Friends see exact location for friend-only profiles
          isBlurred = false;
        } else {
          // Non-Pro OR blurred/nearby privacy → blur coordinates
          const blurred = blurCoordinates(item.lat!, item.lng!, itemUserId);
          displayLat = blurred.lat;
          displayLng = blurred.lng;
          isBlurred = true;
        }
      }

      return { ...item, displayLat, displayLng, distanceKm: dist, isBlurred };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

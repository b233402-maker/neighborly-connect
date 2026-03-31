import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NearbyUser {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  karma: number;
  verified: boolean;
  is_pro: boolean;
  privacy_level: string;
  lat: number | null;
  lng: number | null;
}

/**
 * Fetch users that have real (non-default) locations.
 * Default coords (40.7128, -74.006) are excluded — those users haven't enabled location.
 */
export function useNearbyUsers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['nearby-users'],
    queryFn: async (): Promise<NearbyUser[]> => {
      const { data, error } = await supabase
        .from('profiles_public')
        .select('user_id, display_name, avatar_url, karma, verified, is_pro, privacy_level, lat, lng')
        .not('lat', 'is', null)
        .not('lng', 'is', null);

      if (error) throw error;

      return (data || []).filter((p) => {
        // Exclude current user
        if (p.user_id === user?.id) return false;
        // Exclude users with default (no real) location
        if (Math.abs((p.lat || 0) - 40.7128) < 0.0001 && Math.abs((p.lng || 0) - (-74.006)) < 0.0001) return false;
        return true;
      });
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

/**
 * Search for a specific user by name (for friend location lookup)
 */
export function useSearchUsers(query: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['search-users', query],
    queryFn: async (): Promise<NearbyUser[]> => {
      if (!query || query.length < 2) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, karma, verified, is_pro, privacy_level, lat, lng')
        .ilike('display_name', `%${query}%`)
        .neq('user_id', user?.id || '')
        .limit(10);

      if (error) throw error;
      return (data || []) as NearbyUser[];
    },
    enabled: !!user && query.length >= 2,
    staleTime: 10_000,
  });
}

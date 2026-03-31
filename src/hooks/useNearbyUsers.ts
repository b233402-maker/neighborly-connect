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

export function useNearbyUsers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['nearby-users'],
    queryFn: async (): Promise<NearbyUser[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, karma, verified, is_pro, privacy_level, lat, lng')
        .not('lat', 'is', null)
        .not('lng', 'is', null);

      if (error) throw error;
      // Exclude current user
      return (data || []).filter((p) => p.user_id !== user?.id);
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

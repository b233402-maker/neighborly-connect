import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Eye, Layers, Navigation } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { useNearbyUsers } from "@/hooks/useNearbyUsers";
import { useFriendIds } from "@/hooks/useFollows";
import { useUserLocation, filterByPrivacy } from "@/hooks/useLocation";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function MiniMap() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { location } = useUserLocation();
  const isPro = profile?.is_pro || false;
  const [radius, setRadius] = useState([2]);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markersRef = useRef<L.Layer[]>([]);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);

  const { data: posts } = usePosts();
  const { data: nearbyUsers } = useNearbyUsers();
  const { data: friendIds } = useFriendIds();

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const center: [number, number] = [location.lat, location.lng];

    const map = L.map(mapContainerRef.current, {
      center,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png").addTo(map);

    const circle = L.circle(center, {
      radius: radius[0] * 1000,
      color: "hsl(217, 91%, 53%)",
      fillColor: "hsl(217, 91%, 53%)",
      fillOpacity: 0.08,
      weight: 2,
      dashArray: "8 4",
    }).addTo(map);
    circleRef.current = circle;

    // User's own position
    const userMarker = L.circleMarker(center, {
      radius: 6, color: "#2563EB", fillColor: "#2563EB", fillOpacity: 1, weight: 2,
    }).addTo(map);
    userMarkerRef.current = userMarker;

    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Recenter when location changes
  useEffect(() => {
    if (!mapRef.current) return;
    const center: [number, number] = [location.lat, location.lng];
    mapRef.current.setView(center);
    circleRef.current?.setLatLng(center);
    userMarkerRef.current?.setLatLng(center);
  }, [location.lat, location.lng]);

  // Update post markers
  useEffect(() => {
    if (!mapRef.current || !posts) return;

    markersRef.current.forEach((m) => mapRef.current!.removeLayer(m));
    markersRef.current = [];

    // Apply privacy filtering
    const visiblePosts = filterByPrivacy(
      location.lat, location.lng,
      posts.map(p => ({ ...p, privacy_level: p.author?.privacy_level || 'public', user_id: p.author_id })),
      radius[0],
      user?.id,
      friendIds,
      isPro,
    );

    visiblePosts.forEach((post) => {
      const color = post.category === "urgent" ? "hsl(38, 92%, 50%)" : post.type === "offer" ? "hsl(160, 84%, 39%)" : "hsl(217, 91%, 53%)";
      const c = L.circleMarker([post.displayLat, post.displayLng], {
        radius: 8,
        color,
        fillColor: color,
        fillOpacity: 0.3,
        weight: 1.5,
      }).addTo(mapRef.current!);
      markersRef.current.push(c);
    });

    // Also show nearby users as small dots
    if (nearbyUsers) {
      const visibleUsers = filterByPrivacy(
        location.lat, location.lng,
        nearbyUsers,
        radius[0],
        user?.id,
        friendIds,
        isPro,
      );

      visibleUsers.slice(0, 10).forEach((u) => {
        const dot = L.circleMarker([u.displayLat, u.displayLng], {
          radius: 5, color: "#8B5CF6", fillColor: "#8B5CF6", fillOpacity: 0.3, weight: 1,
        }).addTo(mapRef.current!);
        markersRef.current.push(dot);
      });
    }
  }, [posts, nearbyUsers, radius, location.lat, location.lng, user?.id]);

  useEffect(() => {
    circleRef.current?.setRadius(radius[0] * 1000);
  }, [radius]);

  // Filter posts by radius for nearby activity list
  const nearbyPosts = posts 
    ? filterByPrivacy(
        location.lat, location.lng,
        posts.map(p => ({ ...p, privacy_level: p.author?.privacy_level || 'public', user_id: p.author_id })),
        radius[0],
        user?.id,
        friendIds
      ).slice(0, 5)
    : [];

  return (
    <div className="flex flex-col gap-4 sticky top-[4.5rem] h-fit">
      {/* Map Card */}
      <div className="feed-card p-0 overflow-hidden">
        <div className="relative" style={{ height: 360 }}>
          <div ref={mapContainerRef} className="h-full w-full rounded-2xl" />

          <div className="absolute top-3 right-3 flex flex-col gap-2 z-[1000]">
            <button onClick={() => navigate('/map')} className="h-8 w-8 rounded-lg bg-card/90 backdrop-blur flex items-center justify-center shadow-sm border border-border hover:bg-card transition-colors">
              <Layers className="h-4 w-4 text-foreground" />
            </button>
            <button onClick={() => {
              if (mapRef.current) mapRef.current.setView([location.lat, location.lng], 14);
            }} className="h-8 w-8 rounded-lg bg-card/90 backdrop-blur flex items-center justify-center shadow-sm border border-border hover:bg-card transition-colors">
              <Navigation className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground">Discovery Radius</span>
            <span className="text-xs font-bold text-primary">{radius[0]} km</span>
          </div>
          <Slider value={radius} onValueChange={setRadius} min={1} max={50} step={1} className="w-full" />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">1 km</span>
            <span className="text-[10px] text-muted-foreground">50 km</span>
          </div>
        </div>
      </div>

      {/* Nearby Activity */}
      <div className="feed-card">
        <h4 className="font-display font-semibold text-sm text-foreground mb-3">
          Nearby Activity
          {nearbyPosts.length > 0 && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({nearbyPosts.length} within {radius[0]}km)
            </span>
          )}
        </h4>
        <div className="space-y-3">
          {nearbyPosts.map((post) => (
            <div key={post.id} className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full shrink-0 ${
                post.category === "urgent" ? "bg-accent animate-pulse" : post.type === "offer" ? "bg-success" : "bg-primary"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{post.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {getTimeAgo(post.created_at)} · {post.author?.display_name || 'User'} · {post.distanceKm < 1 ? `${Math.round(post.distanceKm * 1000)}m` : `${post.distanceKm.toFixed(1)}km`}
                </p>
              </div>
            </div>
          ))}
          {nearbyPosts.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No nearby activity within {radius[0]}km</p>
          )}
        </div>
      </div>
    </div>
  );
}

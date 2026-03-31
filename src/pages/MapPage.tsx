import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Navigation, Search, Filter, X, Users, MapPin, Crown, Lock, Eye } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { usePosts, flattenPostPages } from "@/hooks/usePosts";
import { useNearbyUsers, useSearchUsers } from "@/hooks/useNearbyUsers";
import { useFriendIds } from "@/hooks/useFollows";
import { useUserLocation, filterByPrivacy } from "@/hooks/useLocation";
import { useAuth } from "@/contexts/AuthContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function MapPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { location } = useUserLocation();
  const [radius, setRadius] = useState([5]);
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markersRef = useRef<L.Layer[]>([]);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [view, setView] = useState<"posts" | "people">("posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const isPro = profile?.is_pro || false;

  const { data: postsData } = usePosts();
  const posts = flattenPostPages(postsData);
  const { data: nearbyUsers } = useNearbyUsers();
  const { data: friendIds } = useFriendIds();
  const { data: searchResults } = useSearchUsers(searchQuery);

  const sel = posts.find((p) => p.id === selectedPostId);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const center: [number, number] = [location.lat, location.lng];
    const map = L.map(containerRef.current, { center, zoom: 14, zoomControl: false, attributionControl: false });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png").addTo(map);

    const circle = L.circle(center, {
      radius: radius[0] * 1000, color: "hsl(217, 91%, 53%)", fillColor: "hsl(217, 91%, 53%)", fillOpacity: 0.06, weight: 2, dashArray: "8 4",
    }).addTo(map);
    circleRef.current = circle;

    const userMarker = L.circleMarker(center, { radius: 8, color: "#2563EB", fillColor: "#2563EB", fillOpacity: 1, weight: 3 }).addTo(map);
    userMarker.bindPopup('<div style="font-family:Inter,sans-serif"><strong>You are here</strong></div>');
    userMarkerRef.current = userMarker;

    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);
    return () => { map.remove(); mapRef.current = null; };
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
    if (!mapRef.current || !posts || view !== "posts") return;

    markersRef.current.forEach((m) => mapRef.current!.removeLayer(m));
    markersRef.current = [];

    const filteredPosts = filter === "all" ? posts : posts.filter((p) => p.category === filter || p.type === filter);

    const visiblePosts = filterByPrivacy(
      location.lat, location.lng,
      filteredPosts.map(p => ({ ...p, privacy_level: p.author?.privacy_level || 'public', user_id: p.author_id })),
      radius[0],
      user?.id,
      friendIds,
      isPro,
    );

    visiblePosts.forEach((post) => {
      const color = post.category === "urgent" ? "#F59E0B" : post.type === "offer" ? "#10B981" : "#2563EB";
      const marker = L.circleMarker([post.displayLat, post.displayLng], { radius: 12, color, fillColor: color, fillOpacity: 0.3, weight: 2 }).addTo(mapRef.current!);
      const distLabel = post.distanceKm < 1 ? `${Math.round(post.distanceKm * 1000)}m away` : `${post.distanceKm.toFixed(1)}km away`;
      const blurLabel = post.isBlurred ? '<br/><small style="color:#94a3b8">📍 Approximate location</small>' : '';
      marker.bindPopup(`<div style="font-family:Inter,sans-serif;min-width:180px"><strong style="font-size:13px">${post.title}</strong><br/><small style="color:#64748b">${post.author?.display_name || 'User'} · ${distLabel}</small>${blurLabel}<br/><span style="font-size:11px;background:${color}15;color:${color};padding:2px 8px;border-radius:12px;display:inline-block;margin-top:4px">${post.category}</span></div>`);
      marker.on("click", () => setSelectedPostId(post.id));
      markersRef.current.push(marker);
    });
  }, [posts, filter, view, radius, location.lat, location.lng, user?.id, friendIds, isPro]);

  // Update people markers
  useEffect(() => {
    if (!mapRef.current || !nearbyUsers || view !== "people") return;

    markersRef.current.forEach((m) => mapRef.current!.removeLayer(m));
    markersRef.current = [];

    const visibleUsers = filterByPrivacy(
      location.lat, location.lng,
      nearbyUsers,
      radius[0],
      user?.id,
      friendIds,
      isPro,
    );

    visibleUsers.forEach((u) => {
      const isFriend = friendIds?.includes(u.user_id);
      const markerColor = isFriend ? "#10B981" : "#8B5CF6";
      const marker = L.circleMarker([u.displayLat, u.displayLng], {
        radius: 10, color: markerColor, fillColor: markerColor, fillOpacity: 0.4, weight: 2,
      }).addTo(mapRef.current!);
      const distLabel = u.distanceKm < 1 ? `${Math.round(u.distanceKm * 1000)}m away` : `${u.distanceKm.toFixed(1)}km away`;
      const locationLabel = u.isBlurred ? '📍 Approximate' : '📍 Exact location';
      const friendLabel = isFriend ? '<span style="color:#10B981;font-size:11px">✓ Friend</span> · ' : '';
      marker.bindPopup(`<div style="font-family:Inter,sans-serif;min-width:160px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><img src="${u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.user_id}`}" style="width:32px;height:32px;border-radius:50%;background:#e2e8f0" /><div><strong style="font-size:13px">${u.display_name}</strong><br/><small style="color:#64748b">${friendLabel}${distLabel}</small></div></div><small style="color:#8B5CF6">⭐ ${u.karma} karma${u.verified ? ' · ✓ Verified' : ''}</small><br/><small style="color:#94a3b8">${locationLabel}</small></div>`);
      marker.on("click", () => navigate(`/user/${u.user_id}`));
      markersRef.current.push(marker);
    });
  }, [nearbyUsers, view, radius, location.lat, location.lng, user?.id, friendIds, isPro]);

  useEffect(() => { circleRef.current?.setRadius(radius[0] * 1000); }, [radius]);

  const handleRecenter = () => {
    if (mapRef.current) mapRef.current.setView([location.lat, location.lng], 14);
  };

  // Navigate to a searched user on the map
  const handleSearchSelect = (u: { user_id: string; lat: number | null; lng: number | null; display_name: string }) => {
    setSearchQuery("");
    setSearchFocused(false);
    if (u.lat && u.lng && mapRef.current) {
      // Check if we can see this user (privacy)
      const visible = filterByPrivacy(
        location.lat, location.lng,
        [{ ...u, privacy_level: 'public' }],
        999, // unlimited radius for friend search
        user?.id,
        friendIds,
        isPro,
      );
      if (visible.length > 0) {
        mapRef.current.setView([visible[0].displayLat, visible[0].displayLng], 16);
      } else {
        // Navigate to profile instead
        navigate(`/user/${u.user_id}`);
      }
    } else {
      navigate(`/user/${u.user_id}`);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background relative">
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center gap-2">
        <button onClick={() => navigate("/")} className="h-10 w-10 rounded-xl bg-card/90 backdrop-blur-lg flex items-center justify-center shadow-md border border-border shrink-0">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search friends or neighbors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-card/90 backdrop-blur-lg text-sm text-foreground border border-border outline-none shadow-md"
          />
          {/* Search results dropdown */}
          {searchFocused && searchResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-card rounded-xl border border-border shadow-xl overflow-hidden z-50">
              {searchResults.map((u) => {
                const hasLocation = u.lat && u.lng && !(Math.abs((u.lat || 0) - 40.7128) < 0.0001 && Math.abs((u.lng || 0) - (-74.006)) < 0.0001);
                const isFriend = friendIds?.includes(u.user_id);
                return (
                  <button
                    key={u.user_id}
                    onMouseDown={() => handleSearchSelect(u)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                  >
                    <img
                      src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.user_id}`}
                      alt=""
                      className="h-8 w-8 rounded-lg bg-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {u.display_name}
                        {isFriend && <span className="ml-1 text-[10px] text-success">✓ Friend</span>}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {hasLocation ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Location available
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-muted-foreground/50">
                            <Lock className="h-3 w-3" /> No location
                          </span>
                        )}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* View toggle + filter chips */}
      <div className="absolute top-[4.5rem] left-4 right-4 z-[1000] space-y-2">
        <div className="flex gap-2">
          <button onClick={() => { setView("posts"); setSelectedPostId(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border transition-colors flex items-center gap-1.5 ${
              view === "posts" ? "bg-primary text-primary-foreground border-primary" : "bg-card/90 backdrop-blur-lg text-foreground border-border"
            }`}>
            <MapPin className="h-3 w-3" /> Posts
          </button>
          <button onClick={() => { setView("people"); setSelectedPostId(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border transition-colors flex items-center gap-1.5 ${
              view === "people" ? "bg-primary text-primary-foreground border-primary" : "bg-card/90 backdrop-blur-lg text-foreground border-border"
            }`}>
            <Users className="h-3 w-3" /> People
          </button>
          {!isPro && (
            <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20 flex items-center gap-1.5">
              <Eye className="h-3 w-3" /> Blurred view
            </div>
          )}
          {isPro && (
            <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-karma/10 text-karma border border-karma/20 flex items-center gap-1.5">
              <Crown className="h-3 w-3" /> Pro — Exact locations
            </div>
          )}
        </div>
        {view === "posts" && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["all", "urgent", "service", "borrow", "offering"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shadow-sm border transition-colors ${
                  filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card/90 backdrop-blur-lg text-foreground border-border"
                }`}>
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div ref={containerRef} className="flex-1" />

      {/* Bottom panel */}
      <div className="absolute bottom-20 lg:bottom-4 left-4 right-4 z-[1000] space-y-2">
        {sel && view === "posts" && (
          <div className="glass-overlay p-4">
            <button onClick={() => setSelectedPostId(null)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-3">
              <img src={sel.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sel.author_id}`} alt="" className="h-11 w-11 rounded-xl bg-muted shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-semibold text-sm text-foreground truncate">{sel.title}</h4>
                <p className="text-xs text-muted-foreground">{sel.author?.display_name || 'User'}</p>
              </div>
              <button className="btn-help text-xs py-1.5 px-3">Help</button>
            </div>
          </div>
        )}

        <div className="glass-overlay p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground">Discovery Radius</span>
            <span className="text-xs font-bold text-primary">{radius[0]} km</span>
          </div>
          <Slider value={radius} onValueChange={setRadius} min={1} max={50} step={1} />
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-3">
              {view === "posts" ? (
                [{ color: "bg-primary", label: "Needs" }, { color: "bg-success", label: "Offers" }, { color: "bg-accent", label: "Urgent" }].map(l => (
                  <div key={l.label} className="flex items-center gap-1"><div className={`h-2 w-2 rounded-full ${l.color}`} /><span className="text-[10px] text-muted-foreground">{l.label}</span></div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-[#8B5CF6]" /><span className="text-[10px] text-muted-foreground">Neighbors</span></div>
                  <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-success" /><span className="text-[10px] text-muted-foreground">Friends</span></div>
                </>
              )}
            </div>
            <button onClick={handleRecenter} className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <Navigation className="h-4 w-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}

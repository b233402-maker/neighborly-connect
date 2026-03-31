import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Navigation, Search, Filter, X, Users, MapPin } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { usePosts } from "@/hooks/usePosts";
import { useNearbyUsers } from "@/hooks/useNearbyUsers";
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
  const { user } = useAuth();
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

  const { data: posts } = usePosts();
  const { data: nearbyUsers } = useNearbyUsers();
  const { data: friendIds } = useFriendIds();

  const sel = (posts || []).find((p) => p.id === selectedPostId);

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

    // User's own marker
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

    // Apply privacy filtering
    const visiblePosts = filterByPrivacy(
      location.lat, location.lng, 
      filteredPosts.map(p => ({ ...p, privacy_level: p.author?.privacy_level || 'public', user_id: p.author_id })),
      radius[0],
      user?.id
    );

    visiblePosts.forEach((post) => {
      const color = post.category === "urgent" ? "#F59E0B" : post.type === "offer" ? "#10B981" : "#2563EB";
      const marker = L.circleMarker([post.displayLat, post.displayLng], { radius: 12, color, fillColor: color, fillOpacity: 0.3, weight: 2 }).addTo(mapRef.current!);
      const distLabel = post.distanceKm < 1 ? `${Math.round(post.distanceKm * 1000)}m away` : `${post.distanceKm.toFixed(1)}km away`;
      marker.bindPopup(`<div style="font-family:Inter,sans-serif;min-width:180px"><strong style="font-size:13px">${post.title}</strong><br/><small style="color:#64748b">${post.author?.display_name || 'User'} · ${distLabel}</small><br/><span style="font-size:11px;background:${color}15;color:${color};padding:2px 8px;border-radius:12px;display:inline-block;margin-top:4px">${post.category}</span></div>`);
      marker.on("click", () => setSelectedPostId(post.id));
      markersRef.current.push(marker);
    });
  }, [posts, filter, view, radius, location.lat, location.lng, user?.id]);

  // Update people markers
  useEffect(() => {
    if (!mapRef.current || !nearbyUsers || view !== "people") return;

    markersRef.current.forEach((m) => mapRef.current!.removeLayer(m));
    markersRef.current = [];

    const visibleUsers = filterByPrivacy(
      location.lat, location.lng,
      nearbyUsers,
      radius[0],
      user?.id
    );

    visibleUsers.forEach((u) => {
      const marker = L.circleMarker([u.displayLat, u.displayLng], {
        radius: 10, color: "#8B5CF6", fillColor: "#8B5CF6", fillOpacity: 0.4, weight: 2,
      }).addTo(mapRef.current!);
      const distLabel = u.distanceKm < 1 ? `${Math.round(u.distanceKm * 1000)}m away` : `${u.distanceKm.toFixed(1)}km away`;
      const privacyLabel = u.privacy_level === 'blurred' ? ' (approximate)' : '';
      marker.bindPopup(`<div style="font-family:Inter,sans-serif;min-width:160px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><img src="${u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.user_id}`}" style="width:32px;height:32px;border-radius:50%;background:#e2e8f0" /><div><strong style="font-size:13px">${u.display_name}</strong><br/><small style="color:#64748b">${distLabel}${privacyLabel}</small></div></div><small style="color:#8B5CF6">⭐ ${u.karma} karma${u.verified ? ' · ✓ Verified' : ''}</small></div>`);
      markersRef.current.push(marker);
    });
  }, [nearbyUsers, view, radius, location.lat, location.lng, user?.id]);

  useEffect(() => { circleRef.current?.setRadius(radius[0] * 1000); }, [radius]);

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.setView([location.lat, location.lng], 14);
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
          <input placeholder="Search this area..." className="w-full h-10 pl-9 pr-4 rounded-xl bg-card/90 backdrop-blur-lg text-sm text-foreground border border-border outline-none shadow-md" />
        </div>
        <button className="h-10 w-10 rounded-xl bg-card/90 backdrop-blur-lg flex items-center justify-center shadow-md border border-border shrink-0">
          <Filter className="h-5 w-5 text-foreground" />
        </button>
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
                <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-[#8B5CF6]" /><span className="text-[10px] text-muted-foreground">Neighbors</span></div>
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

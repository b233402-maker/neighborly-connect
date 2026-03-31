import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Layers, Navigation, Search, X, Filter } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { usePosts } from "@/hooks/usePosts";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const CENTER: [number, number] = [40.7128, -74.006];

export default function MapPage() {
  const navigate = useNavigate();
  const [radius, setRadius] = useState([5]);
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const { data: posts } = usePosts();

  // Find selected post
  const sel = (posts || []).find((p) => p.id === selectedPostId);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { center: CENTER, zoom: 14, zoomControl: false, attributionControl: false });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png").addTo(map);

    const circle = L.circle(CENTER, {
      radius: 5000, color: "hsl(217, 91%, 53%)", fillColor: "hsl(217, 91%, 53%)", fillOpacity: 0.06, weight: 2, dashArray: "8 4",
    }).addTo(map);
    circleRef.current = circle;

    L.circleMarker(CENTER, { radius: 8, color: "#2563EB", fillColor: "#2563EB", fillOpacity: 1, weight: 3 }).addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Update markers when posts change
  useEffect(() => {
    if (!mapRef.current || !posts) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const filteredPosts = filter === "all" ? posts : posts.filter((p) => p.category === filter || p.type === filter);

    filteredPosts.forEach((post) => {
      if (!post.lat || !post.lng) return;
      const color = post.category === "urgent" ? "#F59E0B" : post.type === "offer" ? "#10B981" : "#2563EB";
      const marker = L.circleMarker([post.lat, post.lng], { radius: 12, color, fillColor: color, fillOpacity: 0.3, weight: 2 }).addTo(mapRef.current!);
      marker.bindPopup(`<div style="font-family:Inter,sans-serif;min-width:180px"><strong style="font-size:13px">${post.title}</strong><br/><small style="color:#64748b">${post.author?.display_name || 'User'}</small><br/><span style="font-size:11px;background:${color}15;color:${color};padding:2px 8px;border-radius:12px;display:inline-block;margin-top:4px">${post.category}</span></div>`);
      marker.on("click", () => setSelectedPostId(post.id));
      markersRef.current.push(marker);
    });
  }, [posts, filter]);

  useEffect(() => { circleRef.current?.setRadius(radius[0] * 1000); }, [radius]);

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

      {/* Filter chips */}
      <div className="absolute top-[4.5rem] left-4 right-4 z-[1000] flex gap-2 overflow-x-auto pb-1">
        {["all", "urgent", "service", "borrow", "offering"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shadow-sm border transition-colors ${
              filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card/90 backdrop-blur-lg text-foreground border-border"
            }`}>
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Map */}
      <div ref={containerRef} className="flex-1" />

      {/* Bottom panel */}
      <div className="absolute bottom-20 lg:bottom-4 left-4 right-4 z-[1000] space-y-2">
        {sel && (
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
              {[{ color: "bg-primary", label: "Needs" }, { color: "bg-success", label: "Offers" }, { color: "bg-accent", label: "Urgent" }].map(l => (
                <div key={l.label} className="flex items-center gap-1"><div className={`h-2 w-2 rounded-full ${l.color}`} /><span className="text-[10px] text-muted-foreground">{l.label}</span></div>
              ))}
            </div>
            <button className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <Navigation className="h-4 w-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}

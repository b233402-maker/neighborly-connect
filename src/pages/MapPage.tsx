import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Layers, Eye, Navigation, Search } from "lucide-react";
import { mockPosts } from "@/data/mockData";
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
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { center: CENTER, zoom: 14, zoomControl: false, attributionControl: false });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png").addTo(map);

    const circle = L.circle(CENTER, {
      radius: radius[0] * 1000, color: "hsl(217, 91%, 53%)", fillColor: "hsl(217, 91%, 53%)", fillOpacity: 0.06, weight: 2, dashArray: "8 4",
    }).addTo(map);
    circleRef.current = circle;

    mockPosts.forEach((post) => {
      const color = post.category === "urgent" ? "#F59E0B" : post.type === "offer" ? "#10B981" : "#2563EB";
      const c = L.circleMarker([post.lat, post.lng], {
        radius: 10, color, fillColor: color, fillOpacity: 0.3, weight: 2,
      }).addTo(map);
      c.bindPopup(`<div style="font-family:Inter,sans-serif"><strong>${post.title}</strong><br/><small>${post.author.name} · ${post.createdAt}</small></div>`);
      c.on("click", () => setSelectedPost(post.id));
    });

    // User location marker
    L.circleMarker(CENTER, { radius: 8, color: "#2563EB", fillColor: "#2563EB", fillOpacity: 1, weight: 3 }).addTo(map);

    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => { circleRef.current?.setRadius(radius[0] * 1000); }, [radius]);

  const sel = mockPosts.find(p => p.id === selectedPost);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center gap-3">
        <button onClick={() => navigate("/")} className="h-10 w-10 rounded-xl bg-card/90 backdrop-blur flex items-center justify-center shadow-sm border border-border">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search this area..." className="w-full h-10 pl-9 pr-4 rounded-xl bg-card/90 backdrop-blur text-sm text-foreground border border-border outline-none shadow-sm" />
        </div>
        <button className="h-10 w-10 rounded-xl bg-card/90 backdrop-blur flex items-center justify-center shadow-sm border border-border">
          <Layers className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Map */}
      <div ref={containerRef} className="flex-1" />

      {/* Bottom controls */}
      <div className="absolute bottom-20 lg:bottom-4 left-4 right-4 z-[1000] space-y-3">
        {sel && (
          <div className="glass-overlay p-4 cursor-pointer" onClick={() => setSelectedPost(null)}>
            <div className="flex items-center gap-3">
              <img src={sel.author.avatar} alt="" className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-semibold text-sm text-foreground truncate">{sel.title}</h4>
                <p className="text-xs text-muted-foreground">{sel.author.name} · {sel.createdAt}</p>
              </div>
              <span className={`help-tag ${sel.category === "urgent" ? "help-tag-urgent" : sel.category === "service" ? "help-tag-service" : "help-tag-borrow"}`}>
                {sel.category}
              </span>
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
            <button className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Navigation className="h-4 w-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

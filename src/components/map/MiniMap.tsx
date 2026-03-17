import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Marker, useMap } from "react-leaflet";
import { Slider } from "@/components/ui/slider";
import { Eye, Layers } from "lucide-react";
import { mockPosts } from "@/data/mockData";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const CENTER: [number, number] = [40.7128, -74.006];

function RadiusUpdater({ radius }: { radius: number }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map, radius]);
  return null;
}

export function MiniMap() {
  const [radius, setRadius] = useState([2]);
  const radiusMeters = radius[0] * 1000;

  return (
    <div className="hidden lg:flex flex-col gap-4 sticky top-4 h-fit">
      {/* Map Card */}
      <div className="feed-card p-0 overflow-hidden">
        <div className="relative" style={{ height: 360 }}>
          <MapContainer
            center={CENTER}
            zoom={14}
            className="h-full w-full rounded-2xl"
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <RadiusUpdater radius={radius[0]} />

            {/* Privacy blur circle */}
            <Circle
              center={CENTER}
              radius={radiusMeters}
              pathOptions={{
                color: "hsl(217, 91%, 53%)",
                fillColor: "hsl(217, 91%, 53%)",
                fillOpacity: 0.08,
                weight: 2,
                dashArray: "8 4",
              }}
            />

            {/* Post markers */}
            {mockPosts.map((post) => (
              <Circle
                key={post.id}
                center={[post.lat, post.lng]}
                radius={200}
                pathOptions={{
                  color: post.category === "urgent" ? "hsl(38, 92%, 50%)" : "hsl(160, 84%, 39%)",
                  fillColor: post.category === "urgent" ? "hsl(38, 92%, 50%)" : "hsl(160, 84%, 39%)",
                  fillOpacity: 0.2,
                  weight: 1.5,
                }}
              />
            ))}
          </MapContainer>

          {/* Overlay controls */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-[1000]">
            <button className="h-8 w-8 rounded-lg bg-card/90 backdrop-blur flex items-center justify-center shadow-sm border border-border hover:bg-card transition-colors">
              <Layers className="h-4 w-4 text-foreground" />
            </button>
            <button className="h-8 w-8 rounded-lg bg-card/90 backdrop-blur flex items-center justify-center shadow-sm border border-border hover:bg-card transition-colors">
              <Eye className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>

        {/* Radius Slider */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground">Discovery Radius</span>
            <span className="text-xs font-bold text-primary">{radius[0]} km</span>
          </div>
          <Slider
            value={radius}
            onValueChange={setRadius}
            min={1}
            max={50}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">1 km</span>
            <span className="text-[10px] text-muted-foreground">50 km</span>
          </div>
        </div>
      </div>

      {/* Nearby Activity */}
      <div className="feed-card">
        <h4 className="font-display font-semibold text-sm text-foreground mb-3">Nearby Activity</h4>
        <div className="space-y-3">
          {mockPosts.slice(0, 3).map((post) => (
            <div key={post.id} className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${
                post.category === "urgent" ? "bg-accent animate-pulse-dot" : "bg-success"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{post.title}</p>
                <p className="text-[10px] text-muted-foreground">{post.createdAt} · {post.author.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

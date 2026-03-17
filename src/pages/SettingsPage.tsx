import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Bell, Shield, MapPin, Eye, Crown, Moon, Globe, LogOut, ChevronRight, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

interface SettingToggle { label: string; description: string; defaultOn: boolean; }
const privacySettings: SettingToggle[] = [
  { label: "Show blurred location", description: "Others see your approximate area", defaultOn: true },
  { label: "Allow DMs from strangers", description: "Anyone in your radius can message you", defaultOn: true },
  { label: "Show karma score", description: "Display your trust score publicly", defaultOn: true },
  { label: "Show online status", description: "Let neighbors know when you're active", defaultOn: false },
];

const notifSettings: SettingToggle[] = [
  { label: "Help offers", description: "When someone offers to help on your post", defaultOn: true },
  { label: "Comments", description: "When someone comments on your post", defaultOn: true },
  { label: "Likes", description: "When someone likes your post", defaultOn: false },
  { label: "Nearby urgent posts", description: "Urgent help requests in your area", defaultOn: true },
];

function ToggleRow({ setting }: { setting: SettingToggle }) {
  const [on, setOn] = useState(setting.defaultOn);
  return (
    <button onClick={() => { setOn(!on); toast.success(on ? "Disabled" : "Enabled"); }}
      className="w-full flex items-center justify-between py-3">
      <div className="text-left">
        <p className="text-sm font-medium text-foreground">{setting.label}</p>
        <p className="text-xs text-muted-foreground">{setting.description}</p>
      </div>
      {on ? <ToggleRight className="h-6 w-6 text-primary shrink-0" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground shrink-0" />}
    </button>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    { id: "profile", label: "Edit Profile", icon: User, desc: "Name, bio, avatar" },
    { id: "privacy", label: "Privacy & Location", icon: Shield, desc: "Control what others see" },
    { id: "notifications", label: "Notifications", icon: Bell, desc: "Manage alert preferences" },
    { id: "subscription", label: "Pro Neighbor", icon: Crown, desc: "Manage your subscription" },
  ];

  if (activeSection === "privacy") {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-0">
        <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border flex items-center gap-3 p-4">
          <button onClick={() => setActiveSection(null)} className="p-1 rounded-full hover:bg-muted"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="font-display font-bold text-lg text-foreground">Privacy & Location</h1>
        </div>
        <div className="p-4 space-y-1 divide-y divide-border">
          {privacySettings.map(s => <ToggleRow key={s.label} setting={s} />)}
        </div>
        <div className="px-4 mt-4">
          <div className="feed-card bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-2"><MapPin className="h-4 w-4 text-primary" /><span className="text-sm font-semibold text-foreground">Location Privacy</span></div>
            <p className="text-xs text-muted-foreground">Your exact location is never shared. Free users see a 500m blur radius. Pro neighbors can choose to share precise locations with specific people.</p>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "notifications") {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-0">
        <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border flex items-center gap-3 p-4">
          <button onClick={() => setActiveSection(null)} className="p-1 rounded-full hover:bg-muted"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="font-display font-bold text-lg text-foreground">Notifications</h1>
        </div>
        <div className="p-4 space-y-1 divide-y divide-border">
          {notifSettings.map(s => <ToggleRow key={s.label} setting={s} />)}
        </div>
      </div>
    );
  }

  if (activeSection === "subscription") {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-0">
        <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border flex items-center gap-3 p-4">
          <button onClick={() => setActiveSection(null)} className="p-1 rounded-full hover:bg-muted"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="font-display font-bold text-lg text-foreground">Pro Neighbor</h1>
        </div>
        <div className="p-4 space-y-4">
          <div className="feed-card bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 text-center">
            <Crown className="h-10 w-10 text-accent mx-auto mb-2" />
            <h2 className="font-display font-bold text-lg text-foreground">You're a Pro! 🎉</h2>
            <p className="text-sm text-muted-foreground mt-1">Your subscription renews on March 15, 2026</p>
          </div>
          <div className="space-y-3">
            {["See exact live locations (if permitted)", "Post unlimited help requests", "Priority post pinning in local feed", "Pro Neighbor badge on profile", "Advanced map features"].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center"><Eye className="h-3 w-3 text-success" /></div>
                <span className="text-sm text-foreground">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border flex items-center gap-3 p-4">
        <button onClick={() => navigate("/")} className="p-1 rounded-full hover:bg-muted lg:hidden"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="font-display font-bold text-xl text-foreground">Settings</h1>
      </div>

      <div className="p-4 space-y-2">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className="w-full feed-card flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><s.icon className="h-5 w-5 text-primary" /></div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}

        <div className="pt-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

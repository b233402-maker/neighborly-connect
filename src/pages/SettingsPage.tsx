import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, Shield, MapPin, Eye, Crown, LogOut, ChevronRight, ToggleLeft, ToggleRight, Palette, Globe, Lock, Smartphone, HelpCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

interface SettingToggle { label: string; description: string; defaultOn: boolean }

const privacySettings: SettingToggle[] = [
  { label: "Show blurred location", description: "Others see your approximate area (500m radius)", defaultOn: true },
  { label: "Allow DMs from strangers", description: "Anyone in your radius can message you", defaultOn: true },
  { label: "Show karma score", description: "Display your trust score publicly", defaultOn: true },
  { label: "Show online status", description: "Let neighbors know when you're active", defaultOn: false },
  { label: "Profile discoverability", description: "Appear in neighbor search results", defaultOn: true },
];

const notifSettings: SettingToggle[] = [
  { label: "Help offers", description: "When someone offers to help on your post", defaultOn: true },
  { label: "Comments & replies", description: "When someone comments on your post", defaultOn: true },
  { label: "Likes", description: "When someone likes your post or comment", defaultOn: false },
  { label: "Nearby urgent posts", description: "Urgent help requests in your area", defaultOn: true },
  { label: "New neighbor alerts", description: "When someone new joins your area", defaultOn: false },
];

function ToggleRow({ setting }: { setting: SettingToggle }) {
  const [on, setOn] = useState(setting.defaultOn);
  return (
    <button onClick={() => { setOn(!on); toast.success(on ? "Disabled" : "Enabled"); }}
      className="w-full flex items-center justify-between py-3.5 group">
      <div className="text-left">
        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{setting.label}</p>
        <p className="text-xs text-muted-foreground">{setting.description}</p>
      </div>
      {on ? <ToggleRight className="h-6 w-6 text-primary shrink-0" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground shrink-0" />}
    </button>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    { id: "profile", label: "Edit Profile", icon: User, desc: "Name, bio, avatar, skills", color: "text-primary", bg: "bg-primary/10" },
    { id: "privacy", label: "Privacy & Location", icon: Shield, desc: "Control who sees what", color: "text-success", bg: "bg-success/10" },
    { id: "notifications", label: "Notifications", icon: Bell, desc: "Manage alert preferences", color: "text-accent", bg: "bg-accent/10" },
    { id: "subscription", label: "Pro Neighbor", icon: Crown, desc: "Your subscription & perks", color: "text-karma", bg: "bg-karma/10" },
    { id: "appearance", label: "Appearance", icon: Palette, desc: "Theme and display settings", color: "text-primary", bg: "bg-primary/10" },
    { id: "help", label: "Help & Support", icon: HelpCircle, desc: "FAQ, contact, report issues", color: "text-muted-foreground", bg: "bg-muted" },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "privacy":
        return (
          <>
            <div className="divide-y divide-border">{privacySettings.map(s => <ToggleRow key={s.label} setting={s} />)}</div>
            <div className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Location Privacy</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Your exact location is never shared. Free users see a 500m blur radius. 
                    Pro neighbors can choose to share precise locations with specific people only when both parties agree.
                  </p>
                </div>
              </div>
            </div>
          </>
        );
      case "notifications":
        return <div className="divide-y divide-border">{notifSettings.map(s => <ToggleRow key={s.label} setting={s} />)}</div>;
      case "subscription":
        return (
          <div className="space-y-4">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
              <Crown className="h-12 w-12 text-accent mx-auto mb-3" />
              <h2 className="font-display font-bold text-xl text-foreground">You're a Pro Neighbor! 🎉</h2>
              <p className="text-sm text-muted-foreground mt-2">Your subscription renews on March 15, 2026</p>
              <p className="text-xs text-muted-foreground mt-1">$4.99/month · Cancel anytime</p>
            </div>
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Pro Benefits</h3>
              {[
                { icon: Eye, text: "See exact live locations (if permitted)" },
                { icon: FileText, text: "Post unlimited help requests" },
                { icon: Crown, text: "Priority post pinning in local feed" },
                { icon: Shield, text: "Pro Neighbor badge on profile" },
                { icon: MapPin, text: "Advanced map features & analytics" },
                { icon: Lock, text: "Private messaging with anyone" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                    <f.icon className="h-4 w-4 text-success" />
                  </div>
                  <span className="text-sm text-foreground">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <User className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">This section is coming soon</p>
          </div>
        );
    }
  };

  return (
    <AppLayout>
      <div className="lg:col-span-1 xl:col-span-2">
        {activeSection ? (
          <>
            <button onClick={() => setActiveSection(null)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ChevronRight className="h-4 w-4 rotate-180" /> Back to Settings
            </button>
            <h1 className="font-display font-bold text-2xl text-foreground mb-4">
              {sections.find(s => s.id === activeSection)?.label}
            </h1>
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
              {renderSection()}
            </div>
          </>
        ) : (
          <>
            <h1 className="font-display font-bold text-2xl text-foreground mb-4">Settings</h1>
            <div className="space-y-2">
              {sections.map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className="w-full bg-card rounded-2xl border border-border flex items-center gap-4 p-4 hover:shadow-md hover:border-primary/20 transition-all text-left group">
                  <div className={`h-11 w-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}

              <div className="pt-4 border-t border-border mt-4">
                <button onClick={() => { logout(); navigate('/auth'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
                <p className="text-center text-[10px] text-muted-foreground mt-4">Neighborly v1.0.0 · Made with ❤️ for communities</p>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, Shield, MapPin, Eye, Crown, LogOut, ChevronRight, ToggleLeft, ToggleRight, Palette, Globe, Lock, Smartphone, HelpCircle, FileText, Camera, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

interface SettingToggle { label: string; description: string; key: string; }

const privacySettings: SettingToggle[] = [
  { label: "Show blurred location", description: "Others see your approximate area (500m radius)", key: "show_blurred_location" },
  { label: "Allow DMs from strangers", description: "Anyone in your radius can message you", key: "allow_dms" },
  { label: "Show karma score", description: "Display your trust score publicly", key: "show_karma" },
  { label: "Show online status", description: "Let neighbors know when you're active", key: "show_online" },
  { label: "Profile discoverability", description: "Appear in neighbor search results", key: "discoverable" },
];

const notifSettings: SettingToggle[] = [
  { label: "Help offers", description: "When someone offers to help on your post", key: "notif_help" },
  { label: "Comments & replies", description: "When someone comments on your post", key: "notif_comments" },
  { label: "Likes", description: "When someone likes your post or comment", key: "notif_likes" },
  { label: "Nearby urgent posts", description: "Urgent help requests in your area", key: "notif_urgent" },
  { label: "New neighbor alerts", description: "When someone new joins your area", key: "notif_neighbors" },
];

function ToggleRow({ setting }: { setting: SettingToggle }) {
  const stored = localStorage.getItem(`setting-${setting.key}`);
  const [on, setOn] = useState(stored !== null ? stored === "true" : true);
  const handleToggle = () => {
    const newVal = !on;
    setOn(newVal);
    localStorage.setItem(`setting-${setting.key}`, String(newVal));
    toast.success(newVal ? `${setting.label} enabled` : `${setting.label} disabled`);
  };
  return (
    <button onClick={handleToggle} className="w-full flex items-center justify-between py-3.5 group">
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
  const { logout, profile, user } = useAuth();
  const updateProfile = useUpdateProfile();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Profile edit state
  const [editName, setEditName] = useState(profile?.display_name || "");
  const [editBio, setEditBio] = useState(profile?.bio || "");
  const [editAvatarUrl, setEditAvatarUrl] = useState(profile?.avatar_url || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("neighborly-theme") || "system");

  const sections = [
    { id: "profile", label: "Edit Profile", icon: User, desc: "Name, bio, avatar", color: "text-primary", bg: "bg-primary/10" },
    { id: "privacy", label: "Privacy & Location", icon: Shield, desc: "Control who sees what", color: "text-success", bg: "bg-success/10" },
    { id: "notifications", label: "Notifications", icon: Bell, desc: "Manage alert preferences", color: "text-accent", bg: "bg-accent/10" },
    { id: "subscription", label: "Pro Neighbor", icon: Crown, desc: "Your subscription & perks", color: "text-karma", bg: "bg-karma/10" },
    { id: "appearance", label: "Appearance", icon: Palette, desc: "Theme and display", color: "text-primary", bg: "bg-primary/10" },
    { id: "help", label: "Help & Support", icon: HelpCircle, desc: "FAQ, contact, report", color: "text-muted-foreground", bg: "bg-muted" },
  ];

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Avatar must be under 2MB"); return; }
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      await supabase.storage.from("post-images").upload(path, file, { upsert: true });
      const { data } = supabase.storage.from("post-images").getPublicUrl(path);
      const url = data.publicUrl + `?t=${Date.now()}`;
      setEditAvatarUrl(url);
      updateProfile.mutate({ avatar_url: url });
    } catch { toast.error("Upload failed"); }
    setUploadingAvatar(false);
  };

  const saveProfile = () => {
    updateProfile.mutate({ display_name: editName.trim(), bio: editBio.trim() });
  };

  const handleThemeChange = (t: string) => {
    setTheme(t);
    localStorage.setItem("neighborly-theme", t);
    if (t === "dark") document.documentElement.classList.add("dark");
    else if (t === "light") document.documentElement.classList.remove("dark");
    else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    }
    toast.success(`Theme set to ${t}`);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-5">
            <div className="flex flex-col items-center">
              <div className="relative mb-3">
                <img src={editAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="Avatar" className="h-20 w-20 rounded-2xl bg-muted object-cover" />
                <label className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90">
                  {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Display Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-muted text-sm text-foreground outline-none border border-border focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Bio</label>
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-muted text-sm text-foreground outline-none border border-border focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Email</label>
                <input type="email" value={user?.email || ""} disabled
                  className="w-full h-10 px-3 rounded-xl bg-muted text-sm text-muted-foreground outline-none border border-border opacity-60" />
              </div>
              <button onClick={saveProfile} disabled={updateProfile.isPending}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        );
      case "privacy":
        return (
          <>
            <div className="divide-y divide-border">{privacySettings.map(s => <ToggleRow key={s.key} setting={s} />)}</div>
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
        return <div className="divide-y divide-border">{notifSettings.map(s => <ToggleRow key={s.key} setting={s} />)}</div>;
      case "subscription":
        return (
          <div className="space-y-4">
            {profile?.is_pro ? (
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                <Crown className="h-12 w-12 text-accent mx-auto mb-3" />
                <h2 className="font-display font-bold text-xl text-foreground">You're a Pro Neighbor! 🎉</h2>
                <p className="text-sm text-muted-foreground mt-2">Your subscription is active</p>
                <p className="text-xs text-muted-foreground mt-1">$4.99/month · Cancel anytime</p>
              </div>
            ) : (
              <div className="text-center p-6 rounded-2xl bg-muted/50 border border-border">
                <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h2 className="font-display font-bold text-xl text-foreground">Free Plan</h2>
                <p className="text-sm text-muted-foreground mt-2">Upgrade to Pro for premium features</p>
                <button onClick={() => navigate('/upgrade')}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors">
                  Upgrade to Pro — $4.99/mo
                </button>
              </div>
            )}
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pro Benefits</h3>
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
      case "appearance":
        return (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Theme</h3>
            <div className="space-y-2">
              {[
                { id: "light", label: "Light", desc: "Clean, bright interface" },
                { id: "dark", label: "Dark", desc: "Easy on the eyes" },
                { id: "system", label: "System", desc: "Match your device setting" },
              ].map(t => (
                <button key={t.id} onClick={() => handleThemeChange(t.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                    theme === t.id ? "bg-primary/10 border border-primary/30" : "bg-muted/50 border border-transparent hover:bg-muted"
                  }`}>
                  <div className={`h-8 w-8 rounded-lg ${theme === t.id ? "bg-primary/20" : "bg-muted"} flex items-center justify-center`}>
                    <Palette className={`h-4 w-4 ${theme === t.id ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${theme === t.id ? "text-primary" : "text-foreground"}`}>{t.label}</p>
                    <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                  </div>
                  {theme === t.id && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          </div>
        );
      case "help":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              {[
                { q: "How does location privacy work?", a: "Your exact location is never shown. We use a 500m blur for free users. Pro users can optionally share precise locations with mutual consent." },
                { q: "How is karma calculated?", a: "Karma increases when people appreciate your help, like your posts, or verify positive interactions. It decreases with reports." },
                { q: "Can I delete my account?", a: "Yes, contact support and we'll process your deletion request within 48 hours. All your data will be permanently removed." },
                { q: "How do I report inappropriate content?", a: "Tap the three dots (⋯) on any post and select 'Report'. Our moderation team reviews reports within 24 hours." },
                { q: "What's Pro Neighbor?", a: "Pro Neighbor is a premium subscription that unlocks advanced features like precise locations, priority posts, and unlimited messaging." },
              ].map((faq, i) => (
                <details key={i} className="group bg-muted/50 rounded-xl border border-border">
                  <summary className="flex items-center justify-between p-3 cursor-pointer text-sm font-medium text-foreground">
                    {faq.q}
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="px-3 pb-3 text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-center">
              <p className="text-sm font-semibold text-foreground">Still need help?</p>
              <p className="text-xs text-muted-foreground mt-1">Contact us at support@neighborly.app</p>
              <button onClick={() => { window.location.href = "mailto:support@neighborly.app"; }}
                className="mt-3 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
                <Mail className="h-3.5 w-3.5 inline mr-1.5" />Email Support
              </button>
            </div>
          </div>
        );
      default:
        return null;
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
                <button key={s.id} onClick={() => { setActiveSection(s.id); if (s.id === 'profile') { setEditName(profile?.display_name || ''); setEditBio(profile?.bio || ''); setEditAvatarUrl(profile?.avatar_url || ''); } }}
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
                  <LogOut className="h-5 w-5" /><span className="text-sm font-medium">Sign Out</span>
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

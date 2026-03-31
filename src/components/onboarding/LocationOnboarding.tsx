import { useState } from "react";
import { MapPin, Globe, Users, Crosshair, Radio, ChevronRight, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useUpdateProfile } from "@/hooks/useProfile";

interface LocationOnboardingProps {
  open: boolean;
  onComplete: () => void;
}

type VisibilityOption = "nearby" | "friends" | "blurred" | "public";

const visibilityOptions: { id: VisibilityOption; label: string; description: string; icon: React.ElementType; color: string }[] = [
  { id: "nearby", label: "Nearby Only", description: "Only neighbors within 2km can see your posts", icon: Radio, color: "text-success" },
  { id: "friends", label: "Friends Only", description: "Only people you've connected with", icon: Users, color: "text-primary" },
  { id: "blurred", label: "Blurred", description: "500m approximate area (default privacy)", icon: Crosshair, color: "text-accent" },
  { id: "public", label: "Public", description: "Visible to everyone on the platform", icon: Globe, color: "text-muted-foreground" },
];

export function LocationOnboarding({ open, onComplete }: LocationOnboardingProps) {
  const [step, setStep] = useState(0);
  const [visibility, setVisibility] = useState<VisibilityOption>("blurred");
  const [locationGranted, setLocationGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const updateProfile = useUpdateProfile();

  const requestLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationGranted(true);
          setLoading(false);
          // Save real location to profile
          updateProfile.mutate({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          toast.success("Location enabled! 📍", { description: "We'll only show your approximate area." });
          setStep(1);
        },
        () => {
          setLocationGranted(false);
          setLoading(false);
          toast.info("Using default city view", { description: "You can enable location later in Settings." });
          setStep(1);
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    } else {
      setLoading(false);
      setStep(1);
    }
  };

  const handleComplete = () => {
    // Save privacy level to profile
    updateProfile.mutate({ privacy_level: visibility });
    localStorage.setItem("neighborly-onboarded", "true");
    onComplete();
    toast.success("You're all set! 🎉", { description: "Welcome to your neighborhood." });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/60 backdrop-blur-md" />

          <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-card rounded-3xl shadow-2xl border border-border w-full max-w-md overflow-hidden">

            {/* Progress dots */}
            <div className="flex justify-center gap-2 pt-5 pb-2">
              {[0, 1].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-primary" : "w-1.5 bg-border"}`} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="px-6 pb-6 pt-2">
                  <div className="text-center mb-6">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <MapPin className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="font-display font-bold text-2xl text-foreground mb-2">Welcome to Neighborly</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      To connect you with nearby neighbors, we need your location. 
                      Your exact address is <span className="font-semibold text-foreground">never shared</span> — we only show an approximate area.
                    </p>
                  </div>

                  <div className="feed-card bg-primary/5 border-primary/20 mb-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Privacy First</p>
                        <p className="text-xs text-muted-foreground mt-0.5">We use a 500m blur radius by default. Your house location is never visible to other users.</p>
                      </div>
                    </div>
                  </div>

                  <button onClick={requestLocation} disabled={loading}
                    className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 mb-2">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                        Detecting location...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <MapPin className="h-4 w-4" /> Enable Location
                      </span>
                    )}
                  </button>

                  <button onClick={() => setStep(1)} className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Skip for now — use city-wide view
                  </button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="px-6 pb-6 pt-2">
                  <div className="text-center mb-5">
                    <h2 className="font-display font-bold text-xl text-foreground mb-1">Who can discover you?</h2>
                    <p className="text-sm text-muted-foreground">Choose who can see your posts and profile</p>
                  </div>

                  <div className="space-y-2 mb-5">
                    {visibilityOptions.map((opt) => (
                      <button key={opt.id} onClick={() => setVisibility(opt.id)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left ${
                          visibility === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                        }`}>
                        <div className={`h-10 w-10 rounded-xl ${visibility === opt.id ? "bg-primary/10" : "bg-muted"} flex items-center justify-center shrink-0`}>
                          <opt.icon className={`h-5 w-5 ${visibility === opt.id ? "text-primary" : opt.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.description}</p>
                        </div>
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          visibility === opt.id ? "border-primary bg-primary" : "border-border"
                        }`}>
                          {visibility === opt.id && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  <button onClick={handleComplete}
                    className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    Get Started <ChevronRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

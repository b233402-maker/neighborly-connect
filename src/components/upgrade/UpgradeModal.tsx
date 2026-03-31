import { X, Crown, Eye, FileText, Shield, MapPin, Lock, Zap, Star, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PLANS = {
  monthly: {
    priceId: "price_1TH8WJ7EdjrkCDlX12o740Mi",
    label: "Monthly",
    price: "$4.99/mo",
  },
  annual: {
    priceId: "price_1TH8Wx7EdjrkCDlXmrGAoW4E",
    label: "Annual",
    price: "$2.99/mo ($35.88/yr)",
    badge: "Save 40%",
  },
};

const benefits = [
  { icon: Eye, text: "See exact live locations (if permitted)" },
  { icon: FileText, text: "Unlimited help requests" },
  { icon: Crown, text: "Priority post pinning in local feed" },
  { icon: Shield, text: "Pro Neighbor badge on profile" },
  { icon: MapPin, text: "Advanced map features & analytics" },
  { icon: Lock, text: "Private messaging with anyone" },
  { icon: Zap, text: "Boosted visibility in searches" },
  { icon: Star, text: "Exclusive community events" },
];

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { profile } = useAuth();

  if (!open) return null;

  const handleSubscribe = async (plan: keyof typeof PLANS) => {
    setLoading(plan);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: PLANS[plan].priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading("manage");
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to open subscription management");
    } finally {
      setLoading(null);
    }
  };

  const isPro = profile?.is_pro;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-border shadow-xl" onClick={(e) => e.stopPropagation()}>

          <div className="relative p-6 text-center bg-gradient-to-br from-accent/20 to-accent/5 rounded-t-2xl">
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
            <div className="h-16 w-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-3">
              <Crown className="h-8 w-8 text-accent" />
            </div>
            <h2 className="font-display font-bold text-2xl text-foreground">Pro Neighbor</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isPro ? "You're a Pro Neighbor! 🎉" : "Unlock the full power of your community"}
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <div className="h-7 w-7 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                    <b.icon className="h-3.5 w-3.5 text-success" />
                  </div>
                  <span className="text-sm text-foreground">{b.text}</span>
                </div>
              ))}
            </div>

            {isPro ? (
              <div className="space-y-2 pt-2">
                <div className="text-center text-sm text-success font-semibold mb-2">✅ Your Pro subscription is active</div>
                <button onClick={handleManageSubscription} disabled={!!loading}
                  className="w-full py-3.5 rounded-xl bg-muted text-foreground font-semibold text-sm hover:bg-muted/80 transition-colors flex items-center justify-center gap-2">
                  {loading === "manage" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Manage Subscription
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <button onClick={() => handleSubscribe("monthly")} disabled={!!loading}
                  className="w-full py-3.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
                  {loading === "monthly" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Monthly — {PLANS.monthly.price}
                </button>
                <button onClick={() => handleSubscribe("annual")} disabled={!!loading}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors relative overflow-hidden flex items-center justify-center gap-2">
                  <span className="absolute top-0 right-4 bg-success text-success-foreground text-[10px] font-bold px-2 py-0.5 rounded-b-lg">{PLANS.annual.badge}</span>
                  {loading === "annual" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Annual — {PLANS.annual.price}
                </button>
              </div>
            )}

            <p className="text-center text-[10px] text-muted-foreground">Cancel anytime · Secure payment via Stripe</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

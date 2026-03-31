import { useState } from "react";
import { X, Camera, MapPin, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreatePost } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const categories = [
  { value: "borrow", label: "Borrow", emoji: "🔄" },
  { value: "service", label: "Service", emoji: "🛠️" },
  { value: "urgent", label: "Urgent", emoji: "🚨" },
  { value: "offering", label: "Offering", emoji: "🎁" },
];

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onPost: (post: any) => void;
}

export function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const [type, setType] = useState<"need" | "offer">("need");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("service");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const { profile } = useAuth();
  const createPost = useCreatePost();

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5) {
      const tag = tagInput.trim().startsWith("#") ? tagInput.trim() : `#${tagInput.trim()}`;
      if (!tags.includes(tag)) setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) { toast.error("Please add a title"); return; }
    createPost.mutate({ title: title.trim(), description: description.trim(), category, type, tags, lat: profile?.lat || 40.7128, lng: profile?.lng || -74.006 }, {
      onSuccess: () => { setTitle(""); setDescription(""); setCategory("service"); setTags([]); setType("need"); onClose(); },
    });
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-border shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-display font-bold text-foreground">Create Post</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex gap-2">
              {(["need", "offer"] as const).map((t) => (
                <button key={t} onClick={() => setType(t)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${type === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                  {t === "need" ? "🙏 I Need" : "🎁 I'm Offering"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <img src={profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} alt="" className="h-10 w-10 rounded-xl bg-muted" />
              <div>
                <p className="text-sm font-semibold text-foreground">{profile?.display_name || 'User'}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Location blurred for privacy</p>
              </div>
            </div>
            <input type="text" placeholder="What do you need?" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-lg font-semibold text-foreground placeholder:text-muted-foreground/50 bg-transparent border-none outline-none" />
            <textarea placeholder="Add details..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full text-sm text-foreground placeholder:text-muted-foreground/50 bg-muted rounded-xl p-3 border-none outline-none resize-none" />
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button key={c.value} onClick={() => setCategory(c.value)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${category === c.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-3">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  <input type="text" placeholder="Add tags..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())} className="flex-1 py-2 text-sm bg-transparent outline-none" />
                </div>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                      {tag} <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-destructive">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-border">
            <div className="flex gap-2">
              <button className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"><Camera className="h-5 w-5" /></button>
              <button className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"><MapPin className="h-5 w-5" /></button>
            </div>
            <button onClick={handleSubmit} disabled={!title.trim() || createPost.isPending} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors">
              {createPost.isPending ? "Posting..." : "Post"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

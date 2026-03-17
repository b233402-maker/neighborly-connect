import { useState } from "react";
import { X, MapPin, Image, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { currentUser, type Post } from "@/data/mockData";
import { toast } from "sonner";

const categories = [
  { value: "borrow", label: "Borrow", emoji: "📦" },
  { value: "service", label: "Service", emoji: "🔧" },
  { value: "urgent", label: "Urgent", emoji: "⚡" },
  { value: "offering", label: "Offering", emoji: "🎁" },
] as const;

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onPost: (post: Post) => void;
}

export function CreatePostModal({ open, onClose, onPost }: CreatePostModalProps) {
  const [type, setType] = useState<"need" | "offer">("need");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("service");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5) {
      const tag = tagInput.startsWith("#") ? tagInput : `#${tagInput}`;
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in title and description");
      return;
    }
    const newPost: Post = {
      id: `p-${Date.now()}`,
      author: currentUser,
      title,
      description,
      category: category as Post["category"],
      tags: tags.length > 0 ? tags : [`#${categories.find(c => c.value === category)?.label || "Help"}`],
      status: "open",
      likes: 0,
      comments: [],
      lat: currentUser.lat + (Math.random() - 0.5) * 0.005,
      lng: currentUser.lng + (Math.random() - 0.5) * 0.005,
      createdAt: "Just now",
      type,
    };
    onPost(newPost);
    toast.success("Post published! 🎉", { description: "Your neighbors will see it now." });
    setTitle("");
    setDescription("");
    setTags([]);
    setCategory("service");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="relative bg-card rounded-2xl shadow-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-display font-semibold text-lg text-foreground">Create Post</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Type Toggle */}
              <div className="flex rounded-full bg-muted p-1">
                <button onClick={() => setType("need")}
                  className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${type === "need" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  🆘 Need Help
                </button>
                <button onClick={() => setType("offer")}
                  className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${type === "offer" ? "bg-success text-success-foreground" : "text-muted-foreground"}`}>
                  🤝 Offering Help
                </button>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img src={currentUser.avatar} alt={currentUser.name} className="h-10 w-10 rounded-full bg-muted" />
                <div>
                  <span className="font-semibold text-sm text-foreground">{currentUser.name}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> Your blurred location will be shared
                  </div>
                </div>
              </div>

              {/* Title */}
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What do you need help with?"
                className="w-full text-lg font-display font-semibold bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />

              {/* Description */}
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add more details..." rows={4}
                className="w-full text-sm bg-transparent outline-none resize-none text-foreground placeholder:text-muted-foreground leading-relaxed" />

              {/* Category */}
              <div>
                <span className="text-xs font-medium text-muted-foreground mb-2 block">Category</span>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((cat) => (
                    <button key={cat.value} onClick={() => setCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                        category === cat.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                      }`}>
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <span className="text-xs font-medium text-muted-foreground mb-2 block">Tags</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center bg-muted rounded-full px-3 py-2">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                    <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                      placeholder="Add a tag..." className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground" />
                  </div>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((tag) => (
                      <span key={tag} className="help-tag help-tag-borrow cursor-pointer"
                        onClick={() => setTags(tags.filter(t => t !== tag))}>
                        {tag} ×
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors">
                  <Image className="h-4 w-4" /> Photo
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors">
                  <MapPin className="h-4 w-4" /> Location
                </button>
                <button onClick={handleSubmit}
                  className="ml-auto px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                  Post
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

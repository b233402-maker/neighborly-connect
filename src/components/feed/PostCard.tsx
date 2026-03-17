import { useState } from "react";
import { Heart, MessageCircle, Share2, HandHelping, CheckCircle2, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Post } from "@/data/mockData";

const categoryStyles: Record<string, string> = {
  borrow: "help-tag help-tag-borrow",
  service: "help-tag help-tag-service",
  urgent: "help-tag help-tag-urgent",
  offering: "help-tag help-tag-service",
};

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [helped, setHelped] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleHelp = () => {
    setHelped(true);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="feed-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="h-10 w-10 rounded-full bg-muted"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-foreground">{post.author.name}</span>
              {post.author.verified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary fill-primary" />
              )}
              {post.author.isPro && <span className="pro-badge">PRO</span>}
            </div>
            <span className="text-xs text-muted-foreground">{post.createdAt}</span>
          </div>
        </div>
        <button className="p-1 rounded-full hover:bg-muted transition-colors">
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 mb-2">
        <span className={categoryStyles[post.category] || "help-tag help-tag-borrow"}>
          {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
        </span>
        {post.status === "fulfilled" && (
          <span className="help-tag bg-success/10 text-success">✓ Fulfilled</span>
        )}
        <span className="text-xs text-muted-foreground">
          {post.type === "need" ? "Needs help" : "Offering help"}
        </span>
      </div>

      {/* Content */}
      <h3 className="font-display font-semibold text-foreground mb-1">{post.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{post.description}</p>

      {/* Tags row */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {post.tags.map((tag) => (
          <span key={tag} className="text-xs text-primary font-medium">{tag}</span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
              liked ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-primary" : ""}`} />
            <span>{likeCount}</span>
          </motion.button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:bg-muted transition-colors">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments}</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:bg-muted transition-colors">
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {post.status === "open" && !helped && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleHelp}
            className="btn-help"
          >
            <HandHelping className="h-4 w-4" />
            I can help
          </motion.button>
        )}

        <AnimatePresence>
          {helped && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex items-center gap-1.5 text-sm font-semibold text-success"
            >
              <CheckCircle2 className="h-4 w-4" />
              Offered!
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

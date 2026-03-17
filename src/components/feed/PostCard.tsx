import { useState } from "react";
import { Heart, MessageCircle, Share2, HandHelping, CheckCircle2, MoreHorizontal, Send, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Post, Comment } from "@/data/mockData";
import { currentUser } from "@/data/mockData";
import { toast } from "sonner";

const categoryStyles: Record<string, string> = {
  borrow: "help-tag help-tag-borrow",
  service: "help-tag help-tag-service",
  urgent: "help-tag help-tag-urgent",
  offering: "help-tag help-tag-service",
};

function CommentItem({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(comment.likes);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState(comment.replies || []);
  const [showReplies, setShowReplies] = useState(true);

  const handleReply = () => {
    if (!replyText.trim()) return;
    const newReply: Comment = {
      id: `reply-${Date.now()}`,
      author: currentUser,
      text: replyText,
      createdAt: "Just now",
      likes: 0,
    };
    setReplies([...replies, newReply]);
    setReplyText("");
    setShowReplyInput(false);
  };

  return (
    <div className={`${depth > 0 ? "ml-8 border-l-2 border-border pl-3" : ""}`}>
      <div className="flex gap-2.5 py-2">
        <img src={comment.author.avatar} alt={comment.author.name} className="h-7 w-7 rounded-full bg-muted shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="bg-muted rounded-xl px-3 py-2">
            <span className="text-xs font-semibold text-foreground">{comment.author.name}</span>
            <p className="text-sm text-foreground/80">{comment.text}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 px-1">
            <span className="text-[10px] text-muted-foreground">{comment.createdAt}</span>
            <button
              onClick={() => { setLiked(!liked); setLikes(l => liked ? l - 1 : l + 1); }}
              className={`text-[10px] font-semibold ${liked ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Like{likes > 0 && ` (${likes})`}
            </button>
            {depth < 1 && (
              <button onClick={() => setShowReplyInput(!showReplyInput)} className="text-[10px] font-semibold text-muted-foreground hover:text-foreground">
                Reply
              </button>
            )}
          </div>

          <AnimatePresence>
            {showReplyInput && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="flex items-center gap-2 mt-2">
                  <img src={currentUser.avatar} alt="You" className="h-6 w-6 rounded-full bg-muted" />
                  <div className="flex-1 flex items-center bg-muted rounded-full px-3 py-1.5">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleReply()}
                      placeholder="Write a reply..."
                      className="flex-1 bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground"
                    />
                    <button onClick={handleReply} className="text-primary ml-1"><Send className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {replies.length > 0 && (
            <div className="mt-1">
              {replies.length > 1 && (
                <button onClick={() => setShowReplies(!showReplies)} className="flex items-center gap-1 text-[10px] text-primary font-medium px-1 mb-1">
                  {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {showReplies ? "Hide" : "View"} {replies.length} replies
                </button>
              )}
              <AnimatePresence>
                {showReplies && replies.map((reply) => (
                  <motion.div key={reply.id} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                    <CommentItem comment={reply} depth={depth + 1} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PostCard({ post, onUpdate }: { post: Post; onUpdate?: (post: Post) => void }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [helped, setHelped] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments);
  const [newComment, setNewComment] = useState("");
  const [shared, setShared] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleHelp = () => {
    setHelped(true);
    toast.success("You offered to help! 🎉 +5 Karma", { description: `${post.author.name} will be notified.` });
  };

  const handleComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `new-${Date.now()}`,
      author: currentUser,
      text: newComment,
      createdAt: "Just now",
      likes: 0,
    };
    setComments([...comments, comment]);
    setNewComment("");
  };

  const handleShare = () => {
    setShared(true);
    toast.success("Post shared! 📤", { description: "Link copied to clipboard." });
    setTimeout(() => setShared(false), 2000);
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
          <img src={post.author.avatar} alt={post.author.name} className="h-10 w-10 rounded-full bg-muted" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-foreground">{post.author.name}</span>
              {post.author.verified && <CheckCircle2 className="h-3.5 w-3.5 text-primary fill-primary" />}
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
        {post.status === "fulfilled" && <span className="help-tag bg-success/10 text-success">✓ Fulfilled</span>}
        <span className="text-xs text-muted-foreground">{post.type === "need" ? "Needs help" : "Offering help"}</span>
      </div>

      {/* Content */}
      <h3 className="font-display font-semibold text-foreground mb-1">{post.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{post.description}</p>

      {post.image && <img src={post.image} alt="" className="w-full rounded-xl mb-3 bg-muted" />}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {post.tags.map((tag) => (
          <span key={tag} className="text-xs text-primary font-medium">{tag}</span>
        ))}
      </div>

      {/* Counts */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 px-1">
        <span>{likeCount} likes</span>
        <span>{comments.length} comments</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1">
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${liked ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}>
            <Heart className={`h-4 w-4 ${liked ? "fill-primary" : ""}`} />
            <span>Like</span>
          </motion.button>

          <button onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${showComments ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}>
            <MessageCircle className="h-4 w-4" />
            <span>Comment</span>
          </button>

          <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${shared ? "text-success" : "text-muted-foreground hover:bg-muted"}`}>
            <Share2 className="h-4 w-4" />
            <span>{shared ? "Shared!" : "Share"}</span>
          </motion.button>
        </div>

        {post.status === "open" && !helped && (
          <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }} onClick={handleHelp} className="btn-help">
            <HandHelping className="h-4 w-4" /> I can help
          </motion.button>
        )}
        <AnimatePresence>
          {helped && (
            <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex items-center gap-1.5 text-sm font-semibold text-success">
              <CheckCircle2 className="h-4 w-4" /> Offered!
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-3 border-t border-border pt-3">
              {/* Comment input */}
              <div className="flex items-center gap-2 mb-3">
                <img src={currentUser.avatar} alt="You" className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 flex items-center bg-muted rounded-full px-3 py-2">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                    placeholder="Write a comment..."
                    className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                  />
                  <button onClick={handleComment} disabled={!newComment.trim()} className="text-primary disabled:text-muted-foreground ml-2">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Comments list */}
              <div className="space-y-0.5 max-h-80 overflow-y-auto">
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

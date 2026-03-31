import { useState } from "react";
import { Heart, MessageCircle, Share2, HandHelping, Send, MoreHorizontal, CornerDownRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useToggleLike, useComments, useCreateComment, useToggleCommentLike, type PostWithAuthor, type CommentWithAuthor } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { PostLikesDialog } from "@/components/social/PostLikesDialog";

const categoryStyles: Record<string, string> = {
  borrow: "bg-primary/10 text-primary",
  service: "bg-success/10 text-success",
  urgent: "bg-destructive/10 text-destructive",
  offering: "bg-accent/10 text-accent",
};

function CommentItem({
  comment,
  postId,
  depth = 0,
}: {
  comment: CommentWithAuthor;
  postId: string;
  depth?: number;
}) {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const createComment = useCreateComment();
  const toggleCommentLike = useToggleCommentLike();

  const handleReply = () => {
    if (!replyText.trim() || !user) return;
    createComment.mutate({ postId, text: replyText.trim(), parentId: comment.id });
    setReplyText("");
    setShowReplyInput(false);
  };

  const handleCommentLike = () => {
    if (!user) return;
    toggleCommentLike.mutate({ commentId: comment.id, postId, hasLiked: comment.user_has_liked });
  };

  return (
    <div className={depth > 0 ? "ml-6 border-l-2 border-border/30 pl-3" : ""}>
      <div className="flex gap-2">
        <img
          src={comment.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author_id}`}
          alt=""
          className="h-7 w-7 rounded-lg bg-muted flex-shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="bg-muted rounded-xl px-3 py-2">
            <p className="text-xs font-semibold text-foreground">{comment.author?.display_name || 'User'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{comment.text}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 ml-1">
            <p className="text-[10px] text-muted-foreground">{getTimeAgo(comment.created_at)}</p>
            <button
              onClick={handleCommentLike}
              className={`text-[10px] font-semibold transition-colors ${
                comment.user_has_liked ? "text-destructive" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {comment.user_has_liked ? "❤️" : "Like"}{comment.likes_count > 0 && ` · ${comment.likes_count}`}
            </button>
            {depth < 2 && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Reply
              </button>
            )}
          </div>

          <AnimatePresence>
            {showReplyInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 mt-2">
                  <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-2.5" />
                  <Input
                    placeholder={`Reply to ${comment.author?.display_name || 'User'}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleReply()}
                    className="flex-1 h-8 text-xs rounded-xl"
                    autoFocus
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || createComment.isPending}
                    className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
                  >
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {comment.replies.length > 0 && (
            <div className="mt-2 space-y-2">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PostCard({ post }: { post: PostWithAuthor }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [shared, setShared] = useState(false);
  const [helped, setHelped] = useState(false);
  const [likesDialogOpen, setLikesDialogOpen] = useState(false);

  const toggleLike = useToggleLike();
  const { data: comments } = useComments(showComments ? post.id : '');
  const createComment = useCreateComment();

  const handleLike = () => {
    if (!user) return;
    toggleLike.mutate({ postId: post.id, hasLiked: post.user_has_liked });
  };

  const handleComment = () => {
    if (!commentText.trim() || !user) return;
    createComment.mutate({ postId: post.id, text: commentText.trim() });
    setCommentText("");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    setShared(true);
    toast.success("Link copied!");
  };

  const handleHelp = () => {
    setHelped(true);
    toast.success("Thanks! The poster will be notified.");
  };

  const goToProfile = () => {
    if (post.author_id === user?.id) {
      navigate("/profile");
    } else {
      navigate(`/user/${post.author_id}`);
    }
  };

  const author = post.author;
  const timeAgo = getTimeAgo(post.created_at);

  return (
    <div className="feed-card">
      <div className="flex items-start gap-3 mb-3">
        <img onClick={goToProfile} src={author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_id}`} alt="" className="h-10 w-10 rounded-xl bg-muted flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span onClick={goToProfile} className="font-display font-semibold text-sm text-foreground cursor-pointer hover:text-primary transition-colors">{author?.display_name || 'User'}</span>
            {author?.verified && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/10 text-success font-medium">✓</span>}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryStyles[post.category] || categoryStyles.service}`}>{post.category}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">{timeAgo}</p>
        </div>
        <button className="text-muted-foreground hover:text-foreground p-1"><MoreHorizontal className="h-4 w-4" /></button>
      </div>

      <h3 className="font-display font-semibold text-foreground mb-1">{post.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{post.description}</p>

      {post.image_url && <img src={post.image_url} alt="" className="w-full rounded-xl mb-3 max-h-64 object-cover" />}

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((tag) => (<span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>))}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 pt-2 border-t border-border/50">
        <span>{post.likes_count} likes</span>
        <span>{post.comments_count} comments</span>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={handleLike} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors ${post.user_has_liked ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:bg-muted"}`}>
          <Heart className={`h-4 w-4 ${post.user_has_liked ? "fill-current" : ""}`} /> Like
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
          <MessageCircle className="h-4 w-4" /> Comment
        </button>
        <button onClick={handleShare} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors ${shared ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}>
          <Share2 className="h-4 w-4" /> {shared ? "Shared" : "Share"}
        </button>
        {post.type === "need" && (
          <button onClick={handleHelp} disabled={helped} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors ${helped ? "text-success bg-success/10" : "text-success hover:bg-success/10"}`}>
            <HandHelping className="h-4 w-4" /> {helped ? "Offered!" : "Help"}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pt-3 mt-3 border-t border-border/50 space-y-3">
              {(comments || []).map((comment) => (
                <CommentItem key={comment.id} comment={comment} postId={post.id} />
              ))}
              <div className="flex gap-2">
                <Input placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleComment()} className="flex-1 h-9 text-xs rounded-xl" />
                <button onClick={handleComment} disabled={!commentText.trim() || createComment.isPending} className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

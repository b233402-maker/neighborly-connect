import { useState, memo } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { PostCard } from "./PostCard";
import { CreatePostModal } from "./CreatePostModal";
import { usePosts } from "@/hooks/usePosts";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeedStore } from "@/stores/feedStore";

const tabs = ["All", "Nearby", "Urgent", "Offering"];
const filterMap: Record<number, string | undefined> = {
  0: undefined,
  1: undefined,
  2: 'urgent',
  3: 'offering',
};

// Cap animation delay so large feeds don't wait forever
const MAX_ANIMATED = 8;

export function FeedColumn() {
  const [showCreate, setShowCreate] = useState(false);
  const { activeTab, setActiveTab } = useFeedStore();

  const { data: posts, isLoading } = usePosts(filterMap[activeTab]);

  return (
    <>
      <div className="flex flex-col gap-4 pb-24 lg:pb-4">
        {/* Create Post Prompt */}
        <button onClick={() => setShowCreate(true)} className="feed-card flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <span className="flex-1 text-left text-sm text-muted-foreground bg-muted rounded-full px-4 py-2.5">
            What do you need help with?
          </span>
        </button>

        {/* Feed Tabs */}
        <div className="flex items-center gap-1 bg-card rounded-full p-1 border border-border">
          {tabs.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className={`flex-1 text-sm font-medium py-2 rounded-full transition-colors ${
                i === activeTab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Posts */}
        {!isLoading && (posts || []).map((post, i) => (
          <motion.div
            key={post.id}
            initial={i < MAX_ANIMATED ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={i < MAX_ANIMATED ? { delay: i * 0.06, duration: 0.3 } : { duration: 0 }}
          >
            <MemoizedPostCard post={post} />
          </motion.div>
        ))}

        {!isLoading && (!posts || posts.length === 0) && (
          <div className="feed-card text-center py-12">
            <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
          </div>
        )}
      </div>

      <CreatePostModal open={showCreate} onClose={() => setShowCreate(false)} onPost={() => {}} />
    </>
  );
}

const MemoizedPostCard = memo(PostCard, (prev, next) => prev.post.id === next.post.id && prev.post.likes_count === next.post.likes_count && prev.post.user_has_liked === next.post.user_has_liked && prev.post.comments_count === next.post.comments_count);

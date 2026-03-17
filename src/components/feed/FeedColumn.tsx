import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { PostCard } from "./PostCard";
import { mockPosts } from "@/data/mockData";

export function FeedColumn() {
  return (
    <div className="flex flex-col gap-4 pb-24 lg:pb-4">
      {/* Create Post Prompt */}
      <div className="feed-card flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Plus className="h-5 w-5 text-primary" />
        </div>
        <button className="flex-1 text-left text-sm text-muted-foreground bg-muted rounded-full px-4 py-2.5 hover:bg-muted/80 transition-colors">
          What do you need help with?
        </button>
      </div>

      {/* Feed Tabs */}
      <div className="flex items-center gap-1 bg-card rounded-full p-1 border border-border">
        {["All", "Nearby", "Urgent", "Offering"].map((tab, i) => (
          <button
            key={tab}
            className={`flex-1 text-sm font-medium py-2 rounded-full transition-colors ${
              i === 0
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts */}
      {mockPosts.map((post, i) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
        >
          <PostCard post={post} />
        </motion.div>
      ))}
    </div>
  );
}

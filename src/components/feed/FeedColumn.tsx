import { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { PostCard } from "./PostCard";
import { CreatePostModal } from "./CreatePostModal";
import { mockPosts, type Post } from "@/data/mockData";

const tabs = ["All", "Nearby", "Urgent", "Offering"];

export function FeedColumn() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleNewPost = (post: Post) => {
    setPosts([post, ...posts]);
  };

  const filtered = activeTab === 0 ? posts
    : activeTab === 1 ? posts
    : activeTab === 2 ? posts.filter(p => p.category === "urgent")
    : posts.filter(p => p.type === "offer");

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

        {/* Posts */}
        {filtered.map((post, i) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.3 }}>
            <PostCard post={post} />
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="feed-card text-center py-12">
            <p className="text-muted-foreground">No posts in this category yet.</p>
          </div>
        )}
      </div>

      <CreatePostModal open={showCreate} onClose={() => setShowCreate(false)} onPost={handleNewPost} />
    </>
  );
}

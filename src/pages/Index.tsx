import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { LeftSidebar } from "@/components/sidebar/LeftSidebar";
import { FeedColumn } from "@/components/feed/FeedColumn";
import { MiniMap } from "@/components/map/MiniMap";
import { CreatePostModal } from "@/components/feed/CreatePostModal";
import { mockPosts, type Post } from "@/data/mockData";

const Index = () => {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_320px] gap-6">
          <LeftSidebar />
          <FeedColumn />
          <MiniMap />
        </div>
      </main>
      <MobileNav onCreatePost={() => setShowCreate(true)} />
      <CreatePostModal open={showCreate} onClose={() => setShowCreate(false)} onPost={() => {}} />
    </div>
  );
};

export default Index;

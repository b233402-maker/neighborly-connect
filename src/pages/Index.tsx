import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FeedColumn } from "@/components/feed/FeedColumn";
import { MiniMap } from "@/components/map/MiniMap";

const Index = () => {
  return (
    <AppLayout>
      <FeedColumn />
      <div className="hidden xl:block">
        <MiniMap />
      </div>
    </AppLayout>
  );
};

export default Index;

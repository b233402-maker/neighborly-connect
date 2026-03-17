import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Shield, Crown, MapPin, Calendar, Edit3, Settings, Users, HandHelping, Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { currentUser, mockPosts } from "@/data/mockData";

const stats = [
  { label: "Helped", value: 28, icon: HandHelping, color: "text-success" },
  { label: "Posts", value: 14, icon: MessageCircle, color: "text-primary" },
  { label: "Likes", value: 156, icon: Heart, color: "text-primary" },
  { label: "Neighbors", value: 42, icon: Users, color: "text-accent" },
];

const tabs = ["Posts", "Helped", "About"];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const userPosts = mockPosts.filter(p => p.author.id === currentUser.id);

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate("/")} className="p-1 rounded-full hover:bg-muted/50 lg:hidden"><ArrowLeft className="h-5 w-5" /></button>
          <div className="flex-1" />
          <button onClick={() => navigate("/settings")} className="p-2 rounded-full hover:bg-muted/50"><Settings className="h-5 w-5 text-foreground" /></button>
        </div>

        <div className="flex flex-col items-center px-4 pb-6">
          <div className="relative mb-3">
            <img src={currentUser.avatar} alt={currentUser.name} className="h-24 w-24 rounded-full bg-muted border-4 border-card" />
            {currentUser.isPro && (
              <span className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-accent flex items-center justify-center border-2 border-card">
                <Crown className="h-4 w-4 text-accent-foreground" />
              </span>
            )}
          </div>
          <h1 className="font-display font-bold text-xl text-foreground">{currentUser.name}</h1>
          <p className="text-sm text-muted-foreground mb-3">{currentUser.bio}</p>

          <div className="flex items-center gap-3 mb-4">
            <div className="karma-badge">
              <Star className="h-4 w-4 fill-karma" /> {currentUser.karma} Karma
            </div>
            {currentUser.verified && (
              <span className="flex items-center gap-1 text-xs font-medium text-success">
                <Shield className="h-3.5 w-3.5" /> Verified
              </span>
            )}
            {currentUser.isPro && <span className="pro-badge"><Crown className="h-3 w-3" /> PRO</span>}
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
            <MapPin className="h-3 w-3" /> Downtown, NYC
            <span className="mx-1">·</span>
            <Calendar className="h-3 w-3" /> Joined Jan 2024
          </div>

          <button className="flex items-center gap-2 px-5 py-2 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
            <Edit3 className="h-3.5 w-3.5" /> Edit Profile
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 border-y border-border bg-card">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center py-4">
            <stat.icon className={`h-5 w-5 ${stat.color} mb-1`} />
            <span className="font-display font-bold text-lg text-foreground">{stat.value}</span>
            <span className="text-[10px] text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              i === activeTab ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 0 && (
          <div className="space-y-3">
            {userPosts.length > 0 ? userPosts.map((post) => (
              <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="feed-card">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`help-tag ${post.category === "urgent" ? "help-tag-urgent" : post.category === "service" ? "help-tag-service" : "help-tag-borrow"}`}>
                    {post.category}
                  </span>
                  {post.status === "fulfilled" && <span className="help-tag bg-success/10 text-success">✓ Fulfilled</span>}
                </div>
                <h3 className="font-display font-semibold text-sm text-foreground">{post.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{post.createdAt} · {post.likes} likes · {post.comments.length} comments</p>
              </motion.div>
            )) : <p className="text-center text-muted-foreground py-8">No posts yet</p>}
          </div>
        )}
        {activeTab === 1 && (
          <div className="space-y-3">
            {["Helped Mia walk her dog Biscuit 🐕", "Lent a snow shovel to neighbor ❄️", "Fixed WiFi for Sofia's apartment 📶"].map((item, i) => (
              <div key={i} className="feed-card flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center"><HandHelping className="h-4 w-4 text-success" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item}</p>
                  <span className="text-xs text-muted-foreground">{i + 1} week ago · +10 Karma</span>
                </div>
                <span className="karma-badge text-xs"><Star className="h-3 w-3 fill-karma" />+10</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === 2 && (
          <div className="feed-card space-y-4">
            <div><span className="text-xs font-medium text-muted-foreground">About</span><p className="text-sm text-foreground mt-1">{currentUser.bio} I love being part of this community and helping out whenever I can. Originally from San Francisco, now loving life in NYC.</p></div>
            <div><span className="text-xs font-medium text-muted-foreground">Skills</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {["Cooking", "Dog Walking", "Handyman", "Tech Support", "Gardening"].map(s => (
                  <span key={s} className="help-tag help-tag-borrow">{s}</span>
                ))}
              </div>
            </div>
            <div><span className="text-xs font-medium text-muted-foreground">Availability</span><p className="text-sm text-foreground mt-1">Weekdays after 5pm, Weekends anytime</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Star, Shield, Crown, MapPin, Calendar, Edit3, Camera, Users, HandHelping, Heart, MessageCircle, Award, TrendingUp, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { currentUser, mockPosts } from "@/data/mockData";
import { AppLayout } from "@/components/layout/AppLayout";

const stats = [
  { label: "People Helped", value: 28, icon: HandHelping, color: "text-success", bg: "bg-success/10" },
  { label: "Posts Created", value: 14, icon: MessageCircle, color: "text-primary", bg: "bg-primary/10" },
  { label: "Likes Received", value: 156, icon: Heart, color: "text-primary", bg: "bg-primary/10" },
  { label: "Connections", value: 42, icon: Users, color: "text-accent", bg: "bg-accent/10" },
];

const badges = [
  { label: "Early Adopter", emoji: "🌟", desc: "Joined in the first month" },
  { label: "Super Helper", emoji: "🦸", desc: "Helped 25+ neighbors" },
  { label: "Trusted Voice", emoji: "🎙️", desc: "50+ comments with likes" },
  { label: "Tool Lender", emoji: "🔧", desc: "Shared tools 10+ times" },
];

const helpHistory = [
  { text: "Helped Mia walk her dog Biscuit 🐕", time: "1 week ago", karma: 10 },
  { text: "Lent a snow shovel to neighbor ❄️", time: "2 weeks ago", karma: 10 },
  { text: "Fixed WiFi for Sofia's apartment 📶", time: "3 weeks ago", karma: 15 },
  { text: "Delivered groceries for elderly neighbor 🛒", time: "1 month ago", karma: 20 },
  { text: "Helped move furniture for new neighbor 🏠", time: "1 month ago", karma: 15 },
];

const tabs = ["Activity", "Helped", "Badges", "About"];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState(0);
  const userPosts = mockPosts.filter(p => p.author.id === currentUser.id);

  return (
    <AppLayout>
      <div className="lg:col-span-1 xl:col-span-2 space-y-4 pb-20 lg:pb-0">
        {/* Profile Header Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Cover */}
          <div className="h-32 sm:h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyNTYzRUIiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <button className="absolute top-3 right-3 h-8 w-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center hover:bg-card transition-colors">
              <Camera className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="px-4 sm:px-6 pb-6 -mt-12 sm:-mt-14 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <img src={currentUser.avatar} alt={currentUser.name}
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-muted border-4 border-card shadow-lg" />
                {currentUser.isPro && (
                  <span className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-accent flex items-center justify-center border-2 border-card shadow-sm">
                    <Crown className="h-4 w-4 text-accent-foreground" />
                  </span>
                )}
                <button className="absolute bottom-1 left-1 h-7 w-7 rounded-lg bg-card/90 backdrop-blur flex items-center justify-center">
                  <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* Name & Info */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display font-bold text-xl sm:text-2xl text-foreground">{currentUser.name}</h1>
                  {currentUser.verified && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <Shield className="h-3 w-3" /> Verified
                    </div>
                  )}
                  {currentUser.isPro && <span className="pro-badge"><Crown className="h-3 w-3" /> PRO</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{currentUser.bio}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Downtown, NYC</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined Jan 2024</span>
                  <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-success" /> Top 5% helper</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="karma-badge text-sm">
                  <Star className="h-4 w-4 fill-karma" /> {currentUser.karma}
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl border border-border p-4 text-center hover:shadow-md transition-shadow">
              <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="font-display font-bold text-2xl text-foreground block">{stat.value}</span>
              <span className="text-[11px] text-muted-foreground">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex border-b border-border">
            {tabs.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)}
                className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
                  i === activeTab ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}>
                {tab}
                {i === activeTab && <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* Activity Tab */}
            {activeTab === 0 && (
              <div className="space-y-3">
                {userPosts.length > 0 ? userPosts.map((post) => (
                  <div key={post.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className={`h-10 w-10 rounded-xl ${post.category === "urgent" ? "bg-accent/10" : post.type === "offer" ? "bg-success/10" : "bg-primary/10"} flex items-center justify-center shrink-0`}>
                      {post.type === "offer" ? <HandHelping className="h-5 w-5 text-success" /> : <MessageCircle className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground">{post.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{post.description}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-muted-foreground">{post.createdAt}</span>
                        <span className="text-[10px] text-muted-foreground">{post.likes} likes</span>
                        <span className="text-[10px] text-muted-foreground">{post.comments.length} comments</span>
                      </div>
                    </div>
                    {post.status === "fulfilled" && <span className="help-tag bg-success/10 text-success text-[10px]">✓ Done</span>}
                  </div>
                )) : <p className="text-center text-muted-foreground py-8">No posts yet</p>}
              </div>
            )}

            {/* Helped Tab */}
            {activeTab === 1 && (
              <div className="space-y-2">
                {helpHistory.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="h-9 w-9 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                      <HandHelping className="h-4 w-4 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.text}</p>
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                    </div>
                    <motion.span whileHover={{ scale: 1.1 }} className="karma-badge text-xs shrink-0">
                      <Star className="h-3 w-3 fill-karma" />+{item.karma}
                    </motion.span>
                  </motion.div>
                ))}
                <div className="text-center pt-2">
                  <span className="text-sm font-display font-bold text-accent">Total: +70 Karma earned helping others!</span>
                </div>
              </div>
            )}

            {/* Badges Tab */}
            {activeTab === 2 && (
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge, i) => (
                  <motion.div key={badge.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                    className="flex flex-col items-center p-4 rounded-2xl border border-border hover:border-accent/30 hover:bg-accent/5 transition-all text-center">
                    <span className="text-3xl mb-2">{badge.emoji}</span>
                    <span className="text-sm font-semibold text-foreground">{badge.label}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{badge.desc}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* About Tab */}
            {activeTab === 3 && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">About</h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {currentUser.bio} I love being part of this community and helping out whenever I can. Originally from San Francisco, now loving life in NYC. 
                    Always up for a coffee chat or lending a hand with anything!
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Skills & Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Cooking 🍳", "Dog Walking 🐕", "Handyman 🔧", "Tech Support 💻", "Gardening 🌱", "Photography 📷", "Moving Help 📦"].map(s => (
                      <span key={s} className="px-3 py-1.5 rounded-xl bg-muted text-sm font-medium text-foreground">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Availability</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {["Mon-Fri: After 5pm", "Weekends: Anytime", "Emergencies: Always", "Holidays: Flexible"].map(a => (
                      <div key={a} className="flex items-center gap-2 text-sm text-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-success" /> {a}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Trust & Safety</h4>
                  <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-1.5 text-sm text-foreground"><Shield className="h-4 w-4 text-primary" /> Identity Verified</span>
                    <span className="flex items-center gap-1.5 text-sm text-foreground"><Award className="h-4 w-4 text-accent" /> Background Checked</span>
                    <span className="flex items-center gap-1.5 text-sm text-foreground"><Star className="h-4 w-4 text-karma fill-karma" /> 4.9 Rating</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

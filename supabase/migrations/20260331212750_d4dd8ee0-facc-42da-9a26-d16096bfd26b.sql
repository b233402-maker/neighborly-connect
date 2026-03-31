
-- Performance indexes for high-traffic queries

-- Posts: filter by category, type, author
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts (author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts (category);
CREATE INDEX IF NOT EXISTS idx_posts_type ON public.posts (type);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts (created_at DESC);

-- Comments: lookup by post
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments (author_id);

-- Likes: user+post and user+comment compound indexes
CREATE INDEX IF NOT EXISTS idx_likes_user_post ON public.likes (user_id, post_id) WHERE post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_likes_user_comment ON public.likes (user_id, comment_id) WHERE comment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes (post_id) WHERE post_id IS NOT NULL;

-- Follows: bidirectional lookups
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows (following_id);
CREATE INDEX IF NOT EXISTS idx_follows_pair ON public.follows (follower_id, following_id);

-- Notifications: user lookup + unread filter
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications (user_id) WHERE read = false;

-- Messages: conversation lookup
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages (sender_id);

-- Conversation participants
CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON public.conversation_participants (user_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_conv ON public.conversation_participants (conversation_id);

-- Help offers
CREATE INDEX IF NOT EXISTS idx_help_offers_post ON public.help_offers (post_id);
CREATE INDEX IF NOT EXISTS idx_help_offers_user_post ON public.help_offers (user_id, post_id);

-- Reports: status filter
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports (status);

-- Profiles: user_id lookup
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_pro ON public.profiles (is_pro) WHERE is_pro = true;

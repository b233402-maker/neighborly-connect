# Neighborly — Local Community Platform

A hyperlocal social platform that connects neighbors for help, sharing, and community engagement. Built with React, TypeScript, and Lovable Cloud.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Database Schema](#-database-schema)
- [Edge Functions](#-edge-functions)
- [Deployment](#-deployment)

---

## ✨ Features

- **Feed** — Create, like, and comment on neighborhood posts (requests, offers, events)
- **Interactive Map** — View nearby posts and users on a Leaflet-powered map
- **Real-time Messaging** — 1:1 conversations with typing indicators, file/image attachments, and online presence
- **Notifications** — Real-time alerts for likes, comments, follows, and help offers
- **User Profiles** — Public profiles with karma, verification badges, and follow system
- **Help Offers** — Respond to neighbor requests with help offers
- **Admin Dashboard** — User management, reports, analytics, and moderation tools
- **Pro Subscriptions** — Stripe-powered premium subscriptions
- **Pull-to-Refresh** — Mobile-optimized feed refresh
- **Dark Mode** — Full light/dark theme support
- **Responsive Design** — Mobile-first with desktop sidebar layout

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **TypeScript 5** | Type safety |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **shadcn/ui** (Radix UI) | Accessible component library |
| **Framer Motion** | Animations & gestures |
| **React Router 6** | Client-side routing |
| **TanStack React Query 5** | Server state & caching |
| **Zustand** | Client state management |
| **React Hook Form + Zod** | Form handling & validation |
| **Leaflet + React Leaflet** | Interactive maps |
| **Recharts** | Charts & analytics |
| **Lucide React** | Icons |
| **date-fns** | Date formatting |
| **Sonner** | Toast notifications |

### Backend (Lovable Cloud)

| Technology | Purpose |
|---|---|
| **Authentication** | Email & Google OAuth sign-in |
| **Database** (PostgreSQL) | Data storage with Row-Level Security |
| **Realtime** | Live updates & presence tracking |
| **Storage** | File & image uploads (chat attachments) |
| **Edge Functions** (Deno) | Serverless backend logic |
| **Stripe** | Payment processing for Pro subscriptions |

### Dev Tools

| Technology | Purpose |
|---|---|
| **Vitest** | Unit testing |
| **Playwright** | E2E testing |
| **ESLint** | Code linting |
| **PostCSS + Autoprefixer** | CSS processing |

---

## 📁 Project Structure

```
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── admin/             # Admin dashboard components
│   │   ├── feed/              # Feed, post card, create post, pull-to-refresh
│   │   ├── layout/            # AppLayout, TopBar, MobileNav
│   │   ├── map/               # Mini map component
│   │   ├── onboarding/        # Location onboarding flow
│   │   ├── sidebar/           # Left sidebar navigation
│   │   ├── skeletons/         # Loading skeleton placeholders
│   │   ├── social/            # Follow list, post likes dialogs
│   │   ├── ui/                # shadcn/ui primitives (40+ components)
│   │   └── upgrade/           # Pro upgrade modal
│   ├── contexts/
│   │   └── AuthContext.tsx     # Authentication provider & session management
│   ├── data/
│   │   └── mockData.ts        # Sample/seed data
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAdmin.ts        # Admin role verification
│   │   ├── useFollows.ts      # Follow/unfollow logic
│   │   ├── useHelpOffers.ts   # Help offer management
│   │   ├── useLocation.ts     # Browser geolocation
│   │   ├── useMessages.ts     # Conversations, messages, attachments
│   │   ├── useNearbyUsers.ts  # Location-based user queries
│   │   ├── useNotifications.ts# Notification queries & unread count
│   │   ├── usePosts.ts        # Post CRUD & feed queries
│   │   ├── usePresence.ts     # Online presence & typing indicators
│   │   ├── useProfile.ts      # Profile CRUD
│   │   └── useRealtime.ts     # Realtime subscriptions & cache invalidation
│   ├── integrations/
│   │   └── supabase/          # Auto-generated client & types (DO NOT EDIT)
│   ├── lib/
│   │   └── utils.ts           # Utility functions (cn, etc.)
│   ├── pages/                 # Route pages
│   │   ├── AuthPage.tsx       # Login / Register
│   │   ├── Index.tsx          # Home feed
│   │   ├── MapPage.tsx        # Interactive map view
│   │   ├── MessagesPage.tsx   # Real-time messaging
│   │   ├── NotificationsPage.tsx
│   │   ├── ProfilePage.tsx    # Own profile
│   │   ├── UserProfilePage.tsx# Other user's profile
│   │   ├── SettingsPage.tsx   # User settings
│   │   └── AdminPage.tsx      # Admin dashboard
│   ├── stores/
│   │   ├── authStore.ts       # Auth state (Zustand)
│   │   └── feedStore.ts       # Feed filters & state (Zustand)
│   ├── App.tsx                # Root component, providers & route definitions
│   ├── main.tsx               # App entry point
│   └── index.css              # Global styles, CSS variables & design tokens
├── supabase/
│   ├── config.toml            # Project config (auto-managed)
│   ├── migrations/            # SQL migrations (auto-managed)
│   └── functions/             # Deno Edge Functions
│       ├── admin-ban-user/    # Ban/unban users (admin only)
│       ├── admin-login/       # Admin authentication
│       ├── check-subscription/# Verify pro subscription status
│       ├── create-checkout/   # Create Stripe checkout session
│       └── customer-portal/   # Stripe customer portal redirect
├── tailwind.config.ts         # Tailwind theme (fonts, colors, animations)
├── vite.config.ts             # Vite build configuration
├── tsconfig.json              # TypeScript configuration
└── vitest.config.ts           # Test runner configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm**, **bun**, or **pnpm**

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd neighborly

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

> **Note:** This project uses **Lovable Cloud** for all backend services. The `.env` file is auto-configured — you do NOT need to set up any external services to get started.

---

## 🔐 Environment Variables

The `.env` file is **auto-generated** by Lovable Cloud and should **never be edited manually**.

| Variable | Description | Auto-provided? |
|---|---|---|
| `VITE_SUPABASE_URL` | Backend API URL | ✅ Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public API key | ✅ Yes |
| `VITE_SUPABASE_PROJECT_ID` | Project reference ID | ✅ Yes |

### Edge Function Secrets

These are stored securely in Lovable Cloud and are only accessible by Edge Functions at runtime:

| Secret | Required For | Where to Get |
|---|---|---|
| `STRIPE_SECRET_KEY` | Payment processing | [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification | Stripe Dashboard → Webhooks |
| `STRIPE_PRICE_ID` | Pro subscription price | Stripe Dashboard → Products |

> **Managing Secrets:** Go to **Lovable Cloud → Secrets** in the Lovable dashboard to add or update these values.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with HMR (port 5173) |
| `npm run build` | Create optimized production build |
| `npm run build:dev` | Create development build (with source maps) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across all files |
| `npm run test` | Run unit tests once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

---

## 🗄 Database Schema

### Tables

| Table | Description |
|---|---|
| `profiles` | User profiles — display name, bio, avatar, karma, lat/lng, pro status, ban status |
| `posts` | Community posts — title, description, category, type, image, geolocation, tags |
| `comments` | Nested comments on posts (supports `parent_id` for threading) |
| `likes` | Likes on posts and/or comments (polymorphic) |
| `follows` | Follow relationships with status (pending/accepted) |
| `help_offers` | Help offers on request-type posts |
| `conversations` | Chat conversation containers |
| `conversation_participants` | Maps users to conversations (many-to-many) |
| `messages` | Individual chat messages with optional file attachments |
| `notifications` | Push-style notifications (likes, comments, follows, help offers) |
| `reports` | User/content reports for admin moderation |
| `user_roles` | Role assignments — `admin`, `moderator`, `user` (enum) |

### Views

| View | Description |
|---|---|
| `profiles_public` | Public profile data (excludes email, ban status, sensitive fields) |

### Database Functions (RPC)

| Function | Purpose |
|---|---|
| `create_conversation_with_participant(other_user_id)` | Atomically creates conversation + adds both participants (SECURITY DEFINER) |
| `has_role(_user_id, _role)` | Role check without RLS recursion (SECURITY DEFINER) |
| `are_friends(_user1, _user2)` | Checks if two users mutually follow each other |
| `get_friend_ids(_user_id)` | Returns all mutual friend user IDs |
| `is_conversation_member(_conversation_id, _user_id)` | Verifies a user belongs to a conversation |

### Row-Level Security (RLS)

All tables have RLS enabled:
- **Profiles**: Users can read public profiles; only own profile is editable
- **Posts/Comments/Likes**: Authenticated users can read; authors can write
- **Messages**: Only conversation participants can read/write
- **Notifications**: Users can only see their own
- **Reports**: Users can create; only admins can manage
- **User Roles**: Checked via `has_role()` SECURITY DEFINER function to prevent recursion

---

## ⚡ Edge Functions

| Function | Method | Auth Required | Description |
|---|---|---|---|
| `admin-ban-user` | POST | Admin role | Ban or unban a user account |
| `admin-login` | POST | Admin role | Verify admin credentials |
| `check-subscription` | POST | Authenticated | Check if user has active Stripe subscription |
| `create-checkout` | POST | Authenticated | Generate a Stripe checkout session URL |
| `customer-portal` | POST | Authenticated | Generate a Stripe customer portal URL |

---

## 🌐 Deployment

This project deploys automatically via **Lovable**:

1. Make changes in the Lovable editor
2. Click **Publish** to deploy
3. Live URL: [https://local-bonds.lovable.app](https://local-bonds.lovable.app)

Custom domains can be configured in **Lovable → Settings → Domains**.

---

## 📄 License

Private project. All rights reserved.

# ConnectMeIndia — Freelance Marketplace Frontend
## Complete Project Documentation & Handover Package

**Project:** ConnectMeIndia Freelance Marketplace (Frontend)
**Version:** 1.0
**Date:** August 2026
**Status:** Production-ready (Vercel deployment, PWA, Capacitor Android)

---

# Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product / Business Overview](#2-product--business-overview)
3. [System Architecture](#3-system-architecture)
4. [Repository / Codebase Structure](#4-repository--codebase-structure)
5. [Technology Stack](#5-technology-stack)
6. [Application Flow](#6-application-flow)
7. [Frontend Documentation](#7-frontend-documentation)
8. [Routing & Navigation](#8-routing--navigation)
9. [State Management](#9-state-management)
10. [API Communication](#10-api-communication)
11. [Authentication & Security](#11-authentication--security)
12. [Environment Variables & Configuration](#12-environment-variables--configuration)
13. [Local Development Setup](#13-local-development-setup)
14. [Deployment & Production Setup](#14-deployment--production-setup)
15. [API / Integration Documentation](#15-api--integration-documentation)
16. [Error Handling & Troubleshooting](#16-error-handling--troubleshooting)
17. [Testing](#17-testing)
18. [Maintenance & Support Guide](#18-maintenance--support-guide)
19. [How to Modify the System](#19-how-to-modify-the-system)
20. [Known Issues, Technical Debt & Risks](#20-known-issues-technical-debt--risks)
21. [Project Handover Checklist](#21-project-handover-checklist)
22. [Non-Technical Client Guide](#22-non-technical-client-guide)
23. [Technical Developer Handover](#23-technical-developer-handover)
24. [Final Project Summary](#24-final-project-summary)
25. [Developer Quick Reference](#25-developer-quick-reference)

---

# 1. Executive Summary

## What the Project Is

ConnectMeIndia is the **frontend web application** for a freelance marketplace platform designed for the Indian market. It provides the user interface for clients, freelancers, and administrators to interact with the marketplace — posting projects, finding work, messaging, making payments, and managing accounts.

## What It Does

- Provides a **responsive web application** that works on desktop, tablet, and mobile
- Offers a **Progressive Web App (PWA)** that can be installed on phones like a native app
- Includes a **Capacitor Android wrapper** for publishing to the Google Play Store
- Handles **real-time messaging** between clients and freelancers
- Supports **Razorpay payments** for Pro subscription upgrades
- Implements **role-based dashboards** for clients, freelancers, and admins
- Provides **SEO-optimized public pages** for marketing and discovery

## Who Uses It

| User Type | What They See |
|-----------|--------------|
| **Visitors** | Public marketing pages, freelancer directory, project listings, pricing |
| **Clients** | Dashboard, project management, freelancer search, messaging, payments |
| **Freelancers** | Dashboard, job search, applications, profile/portfolio management, subscription |
| **Admins** | Full admin panel with user/project/payment management and analytics |

## Major Features

- **Authentication** — Email/password + Google OAuth with Supabase
- **Role-Based Dashboards** — Separate layouts for client, freelancer, and admin
- **Real-Time Chat** — Live messaging with typing indicators, read receipts, emoji picker
- **Payment Integration** — Razorpay checkout for Pro subscriptions
- **Feature Gating** — Trial periods, usage limits, upgrade modals
- **Push Notifications** — Browser push notifications via VAPID
- **PWA Support** — Installable web app with offline capabilities
- **Mobile App** — Capacitor Android wrapper
- **Dark Mode** — Light/dark theme toggle
- **SEO** — React Helmet for meta tags, prerendering for public pages
- **Analytics** — Google Analytics 4, Microsoft Clarity, Google AdSense

---

# 2. Product / Business Overview

## Business Purpose

The frontend is the user-facing layer of ConnectMeIndia. It translates the backend API capabilities into an intuitive, performant, and accessible user experience. Revenue is generated through Pro subscription upgrades (via Razorpay) and Google AdSense ads on public pages.

## Main User Types/roles

### Visitor (Unauthenticated)
- Browses public pages (home, about, how it works, pricing)
- Searches freelancers and projects
- Views freelancer profiles and project details
- Registers as client or freelancer

### Client (Authenticated)
- Posts projects with descriptions, skills, deadlines
- Reviews freelancer applications
- Hires freelancers and communicates via real-time chat
- Manages projects through completion
- Leaves reviews for freelancers

### Freelancer (Authenticated)
- Creates detailed profile with skills, portfolio, experience
- Browses and applies to open projects
- Manages applications and subscriptions
- Communicates with clients via chat
- Upgrades to Pro plan for unlimited applications

### Admin (Authenticated)
- Full platform management via admin panel
- User management (verify, suspend, grant Pro)
- Content moderation (projects, reviews, reports)
- Payment and subscription oversight
- Analytics and audit logs

## Key Features

| Feature | Description |
|---------|-------------|
| **Dual Auth** | Supabase (client SDK) + backend JWT verification |
| **Code Splitting** | All pages lazy-loaded for fast initial load |
| **Real-Time Chat** | Socket.IO with typing indicators and read receipts |
| **Feature Gating** | Automatic upgrade modals on plan limits (402 handling) |
| **PWA** | Installable web app with push notifications |
| **Mobile App** | Capacitor Android build |
| **Dark Mode** | Theme toggle with system preference detection |
| **SEO** | Meta tags, Open Graph, JSON-LD, prerendering |
| **Analytics** | GA4, Microsoft Clarity, AdSense |

---

# 3. System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER'S BROWSER                         │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React Application (Vite + TypeScript)                │  │
│  │                                                       │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │  Zustand    │  │ React Query  │  │  React     │  │  │
│  │  │  (Client    │  │ (Server      │  │  Router    │  │  │
│  │  │   State)    │  │  State)      │  │  (Routes)  │  │  │
│  │  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘  │  │
│  │         │                │                 │          │  │
│  │  ┌──────┴────────────────┴─────────────────┴──────┐  │  │
│  │  │              Axios HTTP Client                  │  │  │
│  │  │     (Auth injection, 401 refresh, 402 modal)    │  │  │
│  │  └──────────────────────┬─────────────────────────┘  │  │
│  │                         │                             │  │
│  │  ┌──────────────────────┴─────────────────────────┐  │  │
│  │  │              Socket.IO Client                   │  │  │
│  │  │        (Real-time messaging & presence)         │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Supabase Client SDK (PKCE auth, session management) │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Service Worker (Workbox + Push notifications)        │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
┌──────────────────┐ ┌────────────────┐ ┌─────────────────┐
│  Backend API     │ │   Supabase     │ │   Razorpay      │
│  (Express.js)    │ │   (Auth +      │ │   (Payments)    │
│  /api/v1/*       │ │    JWT)        │ │                 │
└──────────────────┘ └────────────────┘ └─────────────────┘
              │              │
              ▼              ▼
┌──────────────────┐ ┌─────────────────────┐
│  MongoDB Atlas   │ │  Cloudflare         │
│  (Database)      │ │  Turnstile (CAPTCHA)│
└──────────────────┘ └─────────────────────┘
```

## Component Communication

### Authentication Flow
```
User → React Form → Supabase SDK → Supabase Auth → JWT Token
  → Axios (Authorization header) → Backend API → MongoDB
  → Response → Zustand Store → UI Update
```

### Real-Time Messaging Flow
```
User types message → useSocket hook → Socket.IO emit → Backend Socket.IO
  → MongoDB → Broadcast to room → Other user's Socket.IO → React state update → UI render
```

### Payment Flow
```
User clicks "Upgrade" → Razorpay script loaded → Checkout opens
  → User pays → Razorpay callback → verify-payment API → Backend
  → Subscription activated → UI update → Success modal
```

### Feature Gating Flow
```
User action (e.g., apply) → Axios request → Backend checks plan limits
  → If limit exceeded: 402 PLAN_LIMIT_EXCEEDED → Axios interceptor
  → Zustand upgrade-modal store → UpgradeModal renders → User sees upgrade prompt
```

---

# 4. Repository / Codebase Structure

## Directory Overview

```
frontend/
├── src/                          # Source code (TypeScript/React)
│   ├── main.tsx                  # App entry point (providers)
│   ├── App.tsx                   # Route definitions (704 lines)
│   ├── components/               # Reusable UI components
│   ├── hooks/                    # Custom hooks + React Query hooks
│   ├── layouts/                  # Dashboard layout wrappers
│   ├── lib/                      # Core infrastructure (API, auth, socket)
│   ├── pages/                    # Page components (50+ pages)
│   ├── services/                 # API service layer (16 services)
│   ├── stores/                   # Zustand state stores
│   ├── styles/                   # Global CSS (Tailwind + admin CSS)
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Utility functions
├── public/                       # Static assets (icons, manifest, robots.txt)
├── scripts/                      # Build scripts (prerender)
├── android/                      # Capacitor Android native project
├── __tests__/                    # Test suite (51 test files)
├── index.html                    # HTML entry point
├── package.json                  # Dependencies and scripts
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS theme
├── postcss.config.js             # PostCSS (Tailwind + Autoprefixer)
├── eslint.config.js              # ESLint flat config
├── capacitor.config.ts           # Capacitor mobile config
├── components.json               # shadcn/ui configuration
├── vercel.json                   # Vercel deployment config
└── .env                          # Environment variables
```

## Important Directories

### `src/pages/` — Page Components (50+)

| Directory | Pages | Purpose |
|-----------|-------|---------|
| `public/` | Home, About, HowItWorks, Pricing, FreelancerDirectory, FreelancerProfile, Categories, Contact, FindWork, Launch, LegalPage, NotFound | Marketing & public content |
| `auth/` | Login, Register, ForgotPassword, OAuthCallback, VerifyEmail, VerifyEmailSent | Authentication flows |
| `client/` | Dashboard, PostProject, Projects, ProjectDetails, ClientFreelancers, FreelancerProfileView, Messages, Payments, Reviews, Settings | Client dashboard |
| `freelancer/` | Dashboard, ProfileEdit, FindWork, ProjectDetails, Applications, Portfolio, Earnings, Subscription, Messages, Reviews, Settings, ClientProfileView | Freelancer dashboard |
| `admin/` | Dashboard, UserManagement, ProjectManagement, ApplicationsManagement, ReviewsManagement, SubscriptionManagement, PaymentsManagement, CategoriesManagement, ConversationsManagement, AdminMessages, SendNotifications, ReportsManagement, AuditLogs, RazorpaySettings, MyProjects, PostProject | Admin panel |

### `src/components/` — Reusable Components

| Directory | Components | Purpose |
|-----------|-----------|---------|
| `ui/` | Button, Input, Textarea, Label, Form, Card, Dialog, Tooltip, Toast, TagsInput, FileUpload, SearchInput | shadcn/ui primitives |
| `cards/` | FreelancerCard, ProjectCard, StatsCard, PricingCard, TestimonialCard | Domain card components |
| `shared/` | Logo, RatingStars, StatusBadge, SkillTag, VerificationBadge, ProPlanBadge, NotificationBell, NotificationListener, PageLoader, Skeleton, PushNotificationSettings/Banner/Modal, AdUnit, AnalyticsTracker, ClarityTracker | Shared UI components |
| `auth/` | AuthInitializer, ProtectedRoute, AuthPageShell, AuthBrandingPanel, AuthFormPanel, AccessDenied | Auth components |
| `modals/` | ConfirmationModal, SuccessModal, LoadingModal, ImagePreviewModal, TermsModal, ProjectApplicationModal, ReviewProjectModal, ProfileCompletionModal, AddPortfolioModal, InstallAppModal | Modal dialogs |
| `feature-gate/` | FeatureGate, TrialBanner, UpgradeModal, UsageIndicator, PlanLimitWarning, UpgradeModalHost, DashboardWelcomeModal | Subscription gating |
| `chat/` | ChatArea, ConversationList, MessageBubble, DraggableChatWidget, ChatBubbleButton, ChatTermsOverlay, ChatAvatar | Real-time chat |
| `layout/` | ClientSidebar, FreelancerSidebar, BottomNav | Dashboard navigation |
| `layouts/` | AdminLayout, AdminSidebar, DashboardHeader, Footer, PublicNavbar, DashboardSidebar | Layout wrappers |
| `common/` | ScrollToTop, Breadcrumb, PullToRefresh, ReportModal, SkipLink, TurnstileWidget, CustomDatePicker | Shared utilities |
| `theme/` | ThemeToggle, ThemeInitializer | Dark/light mode |
| `SEO/` | SEO | Meta tag management |
| `pwa/` | AppInstallPrompt | PWA install prompt |

### `src/lib/` — Core Infrastructure

| File | Purpose |
|------|---------|
| `api.ts` | Typed HTTP client wrapper (GET/POST/PUT/PATCH/DELETE) |
| `api-config.ts` | API base URL resolution (`VITE_API_URL` or localhost fallback) |
| `axios-client.ts` | Axios instance with auth injection, token refresh queue, 402 upgrade modal, NProgress |
| `supabase.ts` | Supabase client initialization, session helpers |
| `socket.ts` | Socket.IO singleton with typed events |
| `oauth.ts` | OAuth flow helpers (role persistence, PKCE, backend sync with retries) |
| `auth-request-errors.ts` | Error formatting for user-friendly messages |
| `domain-normalizer.ts` | www → non-www redirect |
| `loadRazorpay.ts` | Lazy Razorpay script loader |
| `category-styles.ts` | Category color/icon mapping |
| `utils.ts` | `cn()` utility (clsx + tailwind-merge) |

### `src/services/` — API Service Layer

| Service | Purpose |
|---------|---------|
| `auth.service.ts` | Login, register, logout, password reset, email verification |
| `user.service.ts` | User CRUD, profile updates |
| `project.service.ts` | Project CRUD, search, lifecycle actions |
| `freelancer.service.ts` | Freelancer profiles, portfolio, experience, education |
| `client.service.ts` | Client profile management |
| `application.service.ts` | Job applications (apply, withdraw, accept/reject) |
| `conversation.service.ts` | Chat REST endpoints |
| `subscription.service.ts` | Subscription management |
| `payment.service.ts` | Razorpay order creation, payment verification |
| `notification.service.ts` | In-app notifications |
| `review.service.ts` | Review CRUD |
| `settings.service.ts` | User notification/privacy settings |
| `admin.service.ts` | All admin API endpoints |
| `feature-gate.service.ts` | Feature flags, usage, context |
| `public.service.ts` | Public data (categories, legal, subscriptions) |
| `report.service.ts` | User reports |

### `src/stores/` — Zustand State Stores

| Store | Persistence | Purpose |
|-------|-------------|---------|
| `auth.store.ts` | User in localStorage (tokens in memory only) | Authentication state |
| `notification.store.ts` | In-memory | Notification list + unread count |
| `unread.store.ts` | In-memory | Chat unread counts, online users |
| `theme.store.ts` | localStorage | Dark/light mode preference |
| `upgrade-modal.store.ts` | In-memory | Upgrade modal trigger (402 responses) |
| `pwa.store.ts` | In-memory | PWA install prompt state |

### `src/hooks/` — Custom Hooks

| Hook | Purpose |
|------|---------|
| `useAuth.ts` | Auth actions (login, register, logout, OAuth, password reset) |
| `useSocket.ts` | Socket.IO connection lifecycle, message handling |
| `useFeatureGate.ts` | Subscription/plan gate logic with derived state |
| `useWebPush.ts` | Browser push notification subscription |
| `useMediaQuery.ts` | Responsive breakpoints |
| `useHideOnScroll.ts` | Bottom nav auto-hide on scroll |
| `useDraggable.ts` | Draggable chat widget logic |
| `queries/useProjects.ts` | Project data fetching (React Query) |
| `queries/useClientDashboardQueries.ts` | Client dashboard data |
| `queries/useFreelancerDashboardQueries.ts` | Freelancer dashboard data |
| `queries/useAdminQueries.ts` | Admin panel data |
| `queries/useAdminStats.ts` | Admin statistics |
| `queries/useCategories.ts` | Category data |
| `queries/useAdminCategories.ts` | Admin category CRUD |

---

# 5. Technology Stack

## Core Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | ^18.3.1 | UI library |
| **TypeScript** | ^5.0.0 | Type-safe JavaScript |
| **Vite** | ^5.0.0 | Build tool and dev server |
| **React Router DOM** | ^6.28.0 | Client-side routing |

## Styling & UI

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Tailwind CSS** | ^3.4.1 | Utility-first CSS framework |
| **shadcn/ui** | Multiple | Pre-built UI components (Radix primitives) |
| **Framer Motion** | ^12.40.0 | Animations and transitions |
| **Lucide React** | ^0.300.0 | Icon library |
| **class-variance-authority** | — | Variant-based component styling |
| **clsx** | — | Conditional class names |
| **tailwind-merge** | — | Tailwind class deduplication |

## State Management

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Zustand** | ^4.5.0 | Client-side state management |
| **TanStack React Query** | ^5.0.0 | Server-state caching and fetching |

## Forms & Validation

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React Hook Form** | ^7.71.1 | Form state management |
| **Zod** | ^3.25.76 | Schema validation |
| **@hookform/resolvers** | — | Zod ↔ React Hook Form bridge |

## Authentication & Security

| Technology | Version | Purpose |
|-----------|---------|---------|
| **@supabase/supabase-js** | ^2.108.2 | Supabase Auth client (PKCE, sessions) |
| **@react-oauth/google** | ^0.13.5 | Google OAuth popup sign-in |
| **@marsidev/react-turnstile** | ^1.5.2 | Cloudflare Turnstile CAPTCHA |

## Real-Time & Communication

| Technology | Version | Purpose |
|-----------|---------|---------|
| **socket.io-client** | ^4.8.3 | WebSocket real-time messaging |
| **Axios** | ^1.13.5 | HTTP client with interceptors |

## Payments & Notifications

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Razorpay** | External script | Payment checkout (lazy-loaded) |
| **Web Push (VAPID)** | Custom service worker | Browser push notifications |

## Mobile & PWA

| Technology | Version | Purpose |
|-----------|---------|---------|
| **@capacitor/core** | ^8.5.0 | Capacitor Android wrapper |
| **vite-plugin-pwa** | ^1.3.0 | PWA service worker + manifest |

## Analytics & Ads

| Technology | Version | Purpose |
|-----------|---------|---------|
| **react-ga4** | ^3.0.1 | Google Analytics 4 |
| **@microsoft/clarity** | ^1.0.2 | Session recordings/heatmaps |
| **Google AdSense** | External script | Ad monetization |

## SEO & Performance

| Technology | Version | Purpose |
|-----------|---------|---------|
| **react-helmet-async** | ^3.0.0 | Document head management |
| **date-fns** | ^4.4.0 | Date formatting |
| **nprogress** | — | Page loading progress bar |
| **Puppeteer** | ^25.1.0 | Post-build prerendering |

## Testing & Development

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Vitest** | ^4.0.18 | Test runner |
| **@testing-library/react** | — | React testing utilities |
| **jsdom** | — | DOM simulation for tests |
| **ESLint** | ^9.0.0 | Code linting |

---

# 6. Application Flow

## 6.1 App Boot Sequence

```
1. index.html loads → Fonts (Inter, Outfit) + AdScript + PWA event capture
2. main.tsx mounts → Provider hierarchy:
   HelmetProvider → GoogleOAuthProvider → QueryClientProvider → BrowserRouter
     → AuthInitializer → App
3. AuthInitializer:
   a. enforceCanonicalDomain() — redirect www → non-www
   b. Check Supabase session from storage
   c. If expired → refresh via supabase.auth.refreshSession()
   d. Verify with backend GET /auth/me
   e. Update Zustand auth store
   f. Set up onAuthStateChange listener
   g. Render <App /> after 10s safety timeout
4. App.tsx renders route tree + global components
```

## 6.2 Login Flow

```
User → /login page
  → Enter email + password + solve Turnstile CAPTCHA
  → useAuth.login():
    1. supabase.auth.signInWithPassword() (Supabase-first)
    2. If success → POST /auth/login/verify with Supabase tokens
    3. If Supabase fails → POST /auth/login (backend fallback)
    4. Backend returns JWT tokens + user data
    5. Zustand auth store updated
    6. Navigate to role-based dashboard
  → If email not verified → Show "Resend Verification" option
  → If session expired → Show session expired banner
  → If in-app browser → Show warning about potential issues
```

## 6.3 Registration Flow

```
User → /register page
  → Select role (Client or Freelancer)
  → Fill form (email, password, name, phone) + solve Turnstile
  → Password validated client-side (8+ chars, upper, lower, digit, special)
  → POST /auth/register
    → Backend creates Supabase user (unconfirmed)
    → Backend creates MongoDB user + profile
    → Backend sends verification email
    → Response: 201 Created
  → Navigate to /verify-email-sent
  → User clicks email link → /verify-email?token=xxx
    → GET /auth/verify-email?token=xxx
    → Email confirmed
  → Navigate to /login
```

## 6.4 OAuth Login Flow (Google)

```
User → Click "Continue with Google"
  → @react-oauth/google opens Google popup
  → User selects Google account
  → Google returns ID token
  → useAuth.signInWithGoogleIdToken():
    1. supabase.auth.signInWithIdToken({ provider: "google", token })
    2. POST /auth/oauth/verify with Supabase tokens
    3. Backend syncs/creates user
    4. Response: user + tokens
    5. Zustand updated
    6. Navigate to dashboard
```

## 6.5 Project Posting Flow (Client)

```
Client → /client/post-project
  → Fill form: title, description, categories, skills, deadline, experience level, location
  → POST /projects
    → Backend validates + creates project (status: draft)
    → Response: 201 Created
  → POST /projects/:id/publish
    → Backend changes status to "open"
    → Backend emits PROJECT_CREATED event
    → Backend notifies matching freelancers
  → Navigate to /client/projects
```

## 6.6 Application Flow (Freelancer)

```
Freelancer → /freelancer/projects (browse open projects)
  → Click project → /freelancer/project/:id
  → Click "Apply" → ProjectApplicationModal opens
    → Pre-flight check: GET /feature-gate/usage (check application limit)
    → If limit reached → Show PlanLimitWarning + UpgradeModal
    → If allowed → Fill: cover letter, proposed rate, estimated completion date
    → POST /applications
      → Backend validates plan/trial gate
      → Backend creates application (status: pending)
      → Backend auto-creates conversation
      → Backend sends intro message
      → Response includes usage stats for counter refresh
    → Success modal → Navigate to /freelancer/applications
```

## 6.7 Real-Time Messaging Flow

```
Connection:
  → Socket.IO connects with Supabase JWT in auth payload
  → Backend verifies JWT, joins personal room (user:${userId})
  → Online status broadcast to all connected users

Sending message:
  → User types in ChatArea component
  → useSocket.sendMessage({conversationId, content})
  → Socket.IO emit('message:send', {conversationId, content})
  → Backend creates Message document
  → Backend updates Conversation (lastMessage, unreadCount)
  → Broadcast to conversation room
  → Other user receives 'message:new' event
  → UI updates in real-time

Read receipts:
  → User opens conversation
  → useSocket.markAsRead(conversationId)
  → Socket.IO emit('message:read', {conversationId})
  → Backend updates messages isRead + readAt
  → Broadcast 'message:read' to conversation room
```

## 6.8 Payment Flow (Pro Upgrade)

```
Freelancer → /freelancer/subscription
  → Click "Upgrade to Pro"
  → GET /subscriptions/upgrade-preview (get proration info)
  → Modal shows plan comparison + proration
  → User clicks "Pay ₹499"
  → loadRazorpay() — lazy-loads checkout.razorpay.com script
  → POST /subscriptions/create-order
    → Backend creates Razorpay order
    → Response: orderId, amount, currency
  → window.Razorpay checkout opens (UPI/Card/Netbanking)
  → User completes payment
  → Razorpay callback fires
  → POST /subscriptions/verify-payment
    → Backend verifies HMAC signature
    → Backend activates subscription
    → Response: subscription data
  → Success modal → Subscription badge updates
```

## 6.9 Feature Gating Flow

```
1. App loads → useFeatureGate() fetches /feature-gate/context
2. Returns: plan tier, quotas, trial info
3. Components check canApply, inTrial, isLimited
4. TrialBanner shows trial countdown
5. UsageIndicator shows "X of N applications used"
6. When user hits limit:
   → Backend returns 402 PLAN_LIMIT_EXCEEDED
   → Axios interceptor catches 402
   → Sets upgrade-modal.store (isOpen: true, reason, meta)
   → UpgradeModalHost renders UpgradeModal
   → User sees plan comparison + upgrade CTA
7. After upgrade:
   → Subscription activated
   → Feature gate context refreshed
   → Usage limits updated
```

## 6.10 Push Notification Flow

```
User → Enable push notifications
  → useWebPush.subscribe():
    1. Register service worker (/push-sw.js)
    2. Request notification permission
    3. Create PushSubscription with VAPID key
    4. POST /notifications/push/subscribe
    5. Backend stores subscription in MongoDB
  → On notification:
    Service worker receives push event
    → Shows system notification
    → Clicking opens the app

User → Disable push notifications
  → useWebPush.unsubscribe():
    1. Unregister push subscription
    2. POST /notifications/push/unsubscribe
```

---

# 7. Frontend Documentation

## Pages/Screens

### Public Pages (12)
| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Landing page with hero, features, testimonials |
| About | `/about` | Company information |
| How It Works | `/how-it-works` | Platform explanation |
| Pricing | `/pricing` | Subscription plans comparison |
| Freelancer Directory | `/freelancers` | Browse freelancers |
| Freelancer Profile | `/freelancer/:id` | Public freelancer profile |
| Categories | `/categories` | Browse skill categories |
| Contact | `/contact` | Contact form |
| Find Work | `/projects` | Public project listings |
| Launch | `/launch` | Launch announcement |
| Legal Pages | `/terms-and-conditions`, `/privacy-policy`, `/legal/:slug` | Legal content |
| NotFound | `*` | 404 page |

### Auth Pages (6)
| Page | Route | Purpose |
|------|-------|---------|
| Login | `/login` | Email/password + Google OAuth |
| Register | `/register` | New account creation |
| Forgot Password | `/forgot-password` | Password reset request |
| OAuth Callback | `/auth/callback` | OAuth redirect handler |
| Verify Email Sent | `/verify-email-sent` | Post-registration prompt |
| Verify Email | `/verify-email` | Email verification confirmation |

### Client Dashboard Pages (12)
| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/client/dashboard` | Client home |
| Post Project | `/client/post-project` | Create new project |
| Projects | `/client/projects` | List my projects |
| Project Details | `/client/project/:id` | View project + applications |
| Find Freelancers | `/client/freelancers` | Browse freelancers |
| Freelancer Profile | `/client/freelancer/:id` | View freelancer profile |
| Messages | `/client/messages` | Chat interface |
| Payments | `/client/payments` | Payment history |
| Reviews | `/client/reviews` | My reviews |
| Settings | `/client/settings` | Account settings |

### Freelancer Dashboard Pages (12)
| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/freelancer/dashboard` | Freelancer home |
| Profile | `/freelancer/profile` | Edit profile |
| Portfolio | `/freelancer/portfolio` | Manage portfolio |
| Find Work | `/freelancer/projects` | Browse open projects |
| Project Details | `/freelancer/project/:id` | View project details |
| Applications | `/freelancer/applications` | My applications |
| Earnings | `/freelancer/earnings` | Earnings tracking |
| Subscription | `/freelancer/subscription` | Plan management |
| Messages | `/freelancer/messages` | Chat interface |
| Reviews | `/freelancer/reviews` | My reviews |
| Client Profile | `/freelancer/client/:id` | View client profile |
| Settings | `/freelancer/settings` | Account settings |

### Admin Dashboard Pages (16)
| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/admin/dashboard` | Analytics overview |
| Users | `/admin/users` | User management |
| Projects | `/admin/projects` | Project management |
| Post Project | `/admin/post-project` | Admin creates project |
| Applications | `/admin/applications` | Application management |
| Reviews | `/admin/reviews` | Review moderation |
| Subscriptions | `/admin/subscriptions` | Subscription management |
| Payments | `/admin/payments` | Payment records |
| Categories | `/admin/categories` | Category CRUD |
| Conversations | `/admin/conversations` | Monitor chats |
| Messages | `/admin/messages` | Admin messaging |
| Notifications | `/admin/notifications` | Send push notifications |
| Reports | `/admin/reports` | User reports |
| Audit Logs | `/admin/audit-logs` | System audit trail |
| Razorpay | `/admin/payment-gateway` | Payment gateway config |
| My Projects | `/admin/my-projects` | Admin's own projects |

## Components

### shadcn/ui Primitives (`src/components/ui/`)
Foundation building blocks based on Radix UI:
- `button.tsx` — Multi-variant button (default, destructive, outline, navy, teal)
- `input.tsx` — Styled text input
- `textarea.tsx` — Multi-line text input
- `label.tsx` — Form label
- `form.tsx` — React Hook Form integration (FormField, FormControl, FormItem, FormLabel, FormMessage)
- `card.tsx` — Card container (Card, CardHeader, CardTitle, CardContent, CardFooter)
- `dialog.tsx` — Modal dialog
- `tooltip.tsx` — Tooltip
- `toast.tsx` / `toaster.tsx` / `use-toast.ts` — Toast notifications
- `tags-input.tsx` — Tag/chip input
- `file-upload.tsx` — File upload
- `search-input.tsx` — Search input with icon

### Domain Card Components (`src/components/cards/`)
- `FreelancerCard.tsx` — Freelancer profile card with avatar, rating, skills, badges
- `ProjectCard.tsx` — Project listing with status badge, skill tags, deadline
- `StatsCard.tsx` — Dashboard statistic with icon and trend indicator
- `PricingCard.tsx` — Subscription plan card with features checklist
- `TestimonialCard.tsx` — User testimonial with quote and rating

### Shared Components (`src/components/shared/`)
- `Logo.tsx` — Brand logo (light/dark variants, configurable size)
- `RatingStars.tsx` — Star rating display (0-5 with half stars)
- `StatusBadge.tsx` — Status pill (project, application, user statuses)
- `SkillTag.tsx` — Teal skill chip with optional remove
- `VerificationBadge.tsx` — Verified/Pro badge with tooltip
- `ProPlanBadge.tsx` — Small "PRO" badge with gradient
- `NotificationBell.tsx` — Bell icon with unread count + dropdown
- `NotificationListener.tsx` — Real-time notification handler (Socket.IO)
- `PageLoader.tsx` — Full-page loading skeleton (dashboard-aware)
- `PublicMain.tsx` — Accessible `<main>` landmark
- `PushNotificationSettings/Banner/Modal` — Push notification UI
- `AdUnit.tsx` — Google AdSense ad unit

### Modal Components (`src/components/modals/`)
- `ConfirmationModal.tsx` — Confirm/cancel dialog (danger/info/warning)
- `SuccessModal.tsx` — Success confirmation
- `LoadingModal.tsx` — Non-dismissable loading spinner
- `ImagePreviewModal.tsx` — Full-screen image gallery
- `TermsModal.tsx` — Terms acceptance dialog
- `ProjectApplicationModal.tsx` — Application form with feature gate integration
- `ReviewProjectModal.tsx` — Star rating + comment review
- `ProfileCompletionModal.tsx` — Freelancer onboarding (2-step)
- `AddPortfolioModal.tsx` — Portfolio add/edit
- `InstallAppModal.tsx` — PWA install prompt

### Feature Gate Components (`src/components/feature-gate/`)
- `FeatureGate.tsx` — Declarative gate wrapper (checks tier, usage, trial)
- `TrialBanner.tsx` — Trial countdown (active/expiring/expired)
- `UpgradeModal.tsx` — Plan comparison + upgrade CTA
- `UsageIndicator.tsx` — "X of N applications used" gauge
- `PlanLimitWarning.tsx` — Inline limit warning
- `UpgradeModalHost.tsx` — Global singleton (driven by 402 interceptor)
- `DashboardWelcomeModal.tsx` — One-time welcome modal

### Chat Components (`src/components/chat/`)
- `ChatArea.tsx` — Full chat interface with messages, typing indicator, emoji picker
- `ConversationList.tsx` — Searchable list with unread badges, online status
- `MessageBubble.tsx` — Individual message display
- `DraggableChatWidget.tsx` — Floating draggable chat bubble
- `ChatTermsOverlay.tsx` — Terms acceptance overlay

---

# 8. Routing & Navigation

## Route Protection

| Guard | Allowed Roles | Redirect on Fail |
|-------|--------------|-----------------|
| `ProtectedRoute` | Configurable | `/login` (default) |
| `ClientRoute` | `["client"]` | `/login` → `/client/dashboard` |
| `FreelancerRoute` | `["freelancer"]` | `/login` → `/freelancer/dashboard` |
| `AdminRoute` | `["admin"]` | `/login?role=admin` → AccessDenied |

## Navigation Structure

### Client Sidebar
1. Dashboard → `/client/dashboard`
2. My Projects → `/client/projects`
3. Post Project → `/client/post-project`
4. Find Freelancers → `/client/freelancers`
5. Messages → `/client/messages` (with unread badge)
6. Reviews → `/client/reviews`
7. Settings → `/client/settings`

### Freelancer Sidebar
1. Dashboard → `/freelancer/dashboard`
2. My Profile → `/freelancer/profile`
3. Portfolio → `/freelancer/portfolio`
4. Find Work → `/freelancer/projects`
5. My Applications → `/freelancer/applications`
6. Messages → `/freelancer/messages` (with unread badge)
7. Subscription → `/freelancer/subscription`
8. Reviews → `/freelancer/reviews`
9. Settings → `/freelancer/settings`

### Admin Sidebar (Sectioned)
- **MAIN:** Dashboard
- **MANAGEMENT:** Users, Projects, Post Project, Applications, Reviews, Subscriptions
- **MARKETPLACE:** Categories
- **COMMUNICATION:** All Conversations, Direct Messages
- **ADMIN PROJECTS:** My Projects
- **SYSTEM:** Reports, Audit Logs

## Code Splitting

All page components are lazy-loaded via `React.lazy()` + dynamic `import()`. Within each layout, child pages use an inline Suspense wrapper so the sidebar/header stays mounted during navigation.

```
Route change → React.lazy loads component → Suspense shows PageSkeleton → Component renders
```

---

# 9. State Management

## Zustand Stores

### Auth Store (`src/stores/auth.store.ts`)
```typescript
{
  user: User | null           // Persisted to localStorage
  accessToken: string | null  // In memory only (XSS protection)
  refreshToken: string | null // In memory only
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  lastSupabaseUrl: string | null  // For project switch detection
}
```

### Theme Store (`src/stores/theme.store.ts`)
```typescript
{
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme) => void
}
```

### Notification Store (`src/stores/notification.store.ts`)
```typescript
{
  notifications: Notification[]
  unreadCount: number
  addNotification: (n) => void
  markAsRead: (id) => void
  markAllAsRead: () => void
}
```

### Unread Store (`src/stores/unread.store.ts`)
```typescript
{
  unreadCounts: Record<string, number>  // conversationId -> count
  onlineUsers: Set<string>
  activeConversation: string | null
  fetchInitialCounts: () => Promise<void>
}
```

### Upgrade Modal Store (`src/stores/upgrade-modal.store.ts`)
```typescript
{
  isOpen: boolean
  reason: string | null
  meta: PlanErrorMeta | null
  openModal: (reason, meta) => void
  closeModal: () => void
}
```

### PWA Store (`src/stores/pwa.store.ts`)
```typescript
{
  deferredPrompt: BeforeInstallPromptEvent | null
  isInstallable: boolean
  isAppInstalled: boolean
}
```

## React Query

Server-state management via TanStack React Query with:
- 5-minute stale time
- No refetch on window focus
- 1 retry on failure
- Query invalidation on mutations

---

# 10. API Communication

## HTTP Client Stack

```
Service (e.g., project.service.ts)
  → api.ts (typed GET/POST/PATCH/PUT/DELETE + ApiError)
    → axios-client.ts (Axios instance)
      → Request interceptor: inject Bearer token, start NProgress
      → Backend API (/api/v1/*)
      → Response interceptor: handle 401 (refresh), 402 (upgrade modal), errors
```

## Axios Interceptors

### Request Interceptor
- Reads `accessToken` from Zustand auth store
- Adds `Authorization: Bearer <token>` header
- Starts NProgress loading bar (250ms delay)

### Response Interceptor
- **401 Unauthorized:**
  - Queue-based token refresh (prevents race conditions)
  - Cross-tab coordination via `BroadcastChannel`
  - On success: retry original request
  - On failure: full logout + redirect to login
- **402 PLAN_LIMIT_EXCEEDED:**
  - Auto-opens UpgradeModal via Zustand store
  - No redirect (modal overlays current page)
- **SESSION_INVALIDATED / SESSION_EXPIRED:**
  - Force logout
  - Clear all stored data
  - Redirect to login

## API Base URL Resolution
```typescript
// src/lib/api-config.ts
VITE_API_URL || (development ? 'http://localhost:3000/api/v1' : throw)
```

---

# 11. Authentication & Security

## Auth Architecture

**Dual-layer system:**
1. **Supabase Auth (client-side)** — Manages identity, JWT issuance, session storage
2. **Backend API (server-side)** — Verifies JWTs, manages MongoDB records, enforces authorization

## Supported Auth Methods

| Method | Flow |
|--------|------|
| Email/Password | Supabase `signInWithPassword` → Backend `/auth/login/verify` |
| Google OAuth (Popup) | `@react-oauth/google` → Supabase `signInWithIdToken` → Backend `/auth/oauth/verify` |
| Google OAuth (Redirect) | Supabase `signInWithOAuth` → PKCE exchange → Backend sync |

## Token Management

- **Storage:** Tokens stored in Zustand (memory only, NOT localStorage)
- **Refresh:** Automatic via Supabase `refreshSession()`
- **Cross-tab:** `BroadcastChannel` prevents competing refreshes
- **Backend sync:** `POST /auth/session/sync` after refresh

## Security Features

| Feature | Implementation |
|---------|---------------|
| **Token security** | In-memory only (not localStorage) |
| **CAPTCHA** | Cloudflare Turnstile on all auth forms |
| **Single-device login** | Backend session tracking |
| **In-app browser detection** | Warns about Facebook/Instagram/WhatsApp browsers |
| **Domain normalization** | www → non-www redirect |
| **CORS** | Backend-configured origin allowlist |
| **XSS protection** | React auto-escaping + CSP headers (backend) |
| **CSRF** | SameSite cookies + CORS |

---

# 12. Environment Variables & Configuration

## Complete Reference

| Variable | Required | Description | Used In |
|----------|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL | `src/lib/supabase.ts` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key | `src/lib/supabase.ts` |
| `VITE_API_URL` | Yes (prod) | Backend API base URL | `src/lib/api-config.ts` |
| `VITE_RAZORPAY_KEY_ID` | Yes | Razorpay API key | `src/services/payment.service.ts` |
| `VITE_TURNSTILE_SITE_KEY` | Yes | Cloudflare Turnstile site key | `src/components/common/TurnstileWidget.tsx` |
| `VITE_OAUTH_REDIRECT_URL` | Yes | OAuth callback URL | `src/lib/oauth.ts` |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID | `src/main.tsx` |
| `VITE_GA_MEASUREMENT_ID` | No | Google Analytics 4 ID | `src/components/shared/AnalyticsTracker.tsx` |
| `VITE_CLARITY_PROJECT_ID` | No | Microsoft Clarity ID | `src/components/shared/ClarityTracker.tsx` |
| `VITE_ADSENSE_PUB_ID` | No | Google AdSense publisher ID | `src/components/shared/AdSenseInitializer.tsx` |
| `VITE_VAPID_PUBLIC_KEY` | Yes | Web Push VAPID public key | `src/hooks/useWebPush.ts` |
| `CAPACITOR_BUILD` | No | Skip PWA when building for Capacitor | `vite.config.ts` |

## Development vs Production

| Variable | Development | Production |
|----------|-------------|------------|
| `VITE_API_URL` | `http://localhost:3000/api/v1` (default) | Must be set (https://...) |
| `VITE_OAUTH_REDIRECT_URL` | `http://localhost:5173/auth/callback` | `https://connectmeindia.com/auth/callback` |
| All others | Same | Same |

---

# 13. Local Development Setup

## Prerequisites

- **Node.js** ≥ 18.0.0 (recommended: 20.x LTS)
- **npm** ≥ 9.0.0
- **Git**

## Step-by-Step Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd FreelanceMarketPlace/frontend
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env  # If .env.example exists, otherwise edit .env directly
```

Ensure `.env` contains:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3000/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
VITE_TURNSTILE_SITE_KEY=your-turnstile-site-key
VITE_OAUTH_REDIRECT_URL=http://localhost:5173/auth/callback
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
```

### 3. Start Backend (Required)
The frontend requires the backend API to be running. See backend documentation for setup.

### 4. Start Development Server
```bash
npm run dev
```

The app starts at `http://localhost:5173` with HMR (Hot Module Replacement).

### 5. Verify
Open `http://localhost:5173` in your browser. You should see the ConnectMeIndia homepage.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production (TypeScript + Vite) |
| `npm run build:capacitor` | Build for Capacitor Android |
| `npm run build:static` | Build + prerender public pages |
| `npm run preview` | Preview production build |
| `npm run test` | Run Vitest tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run sync:android` | Build + sync to Capacitor Android |

## Common Setup Issues

| Issue | Solution |
|-------|----------|
| Blank page on load | Check browser console for env var errors |
| "API URL not configured" | Set `VITE_API_URL` in `.env` |
| Auth not working | Verify Supabase URL and anon key |
| CORS errors | Ensure backend `CORS_ORIGIN` includes `http://localhost:5173` |
| 404 on refresh | Vite dev server should handle SPA routing automatically |
| Build fails | Run `npm install` to ensure all dependencies are installed |

---

# 14. Deployment & Production Setup

## Hosting Platforms

| Platform | Purpose | Config |
|----------|---------|--------|
| **Vercel** | Primary web hosting | `vercel.json` (SPA rewrites + redirects) |
| **Netlify** | Redirect handling | `public/_redirects` (HTTPS, non-www canonical) |
| **Capacitor** | Android native app | `capacitor.config.ts` |

## Build Process

```bash
# Standard web build
npm run build

# Capacitor Android build
npm run build:capacitor

# Static prerendered build
npm run build:static

# Deploy to Vercel
vercel --prod
```

## Vercel Configuration (`vercel.json`)
- `/find-work` → `/projects` (301 permanent redirect)
- `/(.*)` → `/index.html` (SPA fallback)

## PWA Configuration

- Service worker via `vite-plugin-pwa` (Workbox)
- Auto-update registration
- Custom push service worker (`public/push-sw.js`)
- PWA manifest with icons (192x192, 512x512)
- **Skipped for Capacitor builds** (`CAPACITOR_BUILD=true`)

## Prerendering

Public routes are prerendered to static HTML via Puppeteer:
```
/, /about, /how-it-works, /pricing, /freelancers, /projects, 
/categories, /contact, /terms-and-conditions, /privacy-policy, 
/login, /register, /forgot-password, /verify-email-sent, /launch
```

## Domain Configuration

- **Production domain:** connectmeindia.com
- **www redirect:** www.connectmeindia.com → connectmeindia.com (enforced at app boot)
- **SSL:** Managed by Vercel (automatic)
- **Non-www canonical:** Enforced via `domain-normalizer.ts`

---

# 15. API / Integration Documentation

## Backend API

- **Base URL:** `VITE_API_URL` (defaults to `http://localhost:3000/api/v1`)
- **Auth:** Bearer token in Authorization header
- **Response format:** `{ data: T, meta: { requestId, timestamp } }`
- **Error format:** `{ error: { code, message, details } }`

## Supabase Auth

- **Purpose:** User identity management, JWT issuance
- **Client SDK:** `@supabase/supabase-js`
- **Config:** `src/lib/supabase.ts`
- **Features:** Email/password, Google OAuth, PKCE, session persistence
- **Storage key:** `cmi-auth-token`

## Razorpay

- **Purpose:** Payment processing for Pro subscriptions
- **Loading:** Lazy-loaded via `src/lib/loadRazorpay.ts`
- **Checkout:** Opens `window.Razorpay` modal
- **Flow:** create-order → checkout → verify-payment
- **Type definitions:** `src/types/razorpay.d.ts`

## Socket.IO

- **Purpose:** Real-time messaging and presence
- **Singleton:** `src/lib/socket.ts`
- **Auth:** Bearer token in socket auth payload
- **Reconnection:** 10 attempts, 1s-5s backoff

### Events (Client → Server)
| Event | Payload | Purpose |
|-------|---------|---------|
| `message:send` | `{conversationId, content}` | Send message |
| `message:read` | `{conversationId}` | Mark as read |
| `typing:start` | `{conversationId}` | Typing indicator |
| `typing:stop` | `{conversationId}` | Stop typing |
| `conversation:join` | `{conversationId}` | Join room |
| `conversation:leave` | `{conversationId}` | Leave room |

### Events (Server → Client)
| Event | Payload | Purpose |
|-------|---------|---------|
| `message:new` | Message object | New message received |
| `message:read` | `{conversationId, userId}` | Messages read |
| `user:typing` | `{conversationId, userId}` | User typing |
| `user:online` | `{userId}` | User came online |
| `user:offline` | `{userId}` | User went offline |
| `users:online` | `string[]` | All online users |
| `conversation:created` | Conversation object | New conversation |
| `application:new` | Application object | New application |
| `notification:new` | Notification object | New notification |

## Cloudflare Turnstile

- **Purpose:** Bot protection (CAPTCHA)
- **Component:** `src/components/common/TurnstileWidget.tsx`
- **Usage:** Login, register, forgot password forms
- **Token sent as:** `x-turnstile-token` header

## Web Push (VAPID)

- **Purpose:** Browser push notifications
- **Hook:** `src/hooks/useWebPush.ts`
- **Service worker:** `public/push-sw.js`
- **VAPID key:** `VITE_VAPID_PUBLIC_KEY`

## Google Analytics 4

- **Purpose:** Pageview and event tracking
- **Component:** `src/components/shared/AnalyticsTracker.tsx`
- **Tracking:** Route changes via `react-ga4`

## Microsoft Clarity

- **Purpose:** Session recordings and heatmaps
- **Component:** `src/components/shared/ClarityTracker.tsx`
- **User identification:** Authenticated users identified by ID

## Google AdSense

- **Purpose:** Ad monetization on public pages
- **Component:** `src/components/shared/AdUnit.tsx`
- **Initializer:** `src/components/shared/AdSenseInitializer.tsx`

---

# 16. Error Handling & Troubleshooting

## Error Types

### HTTP Errors
| Code | Meaning | Frontend Action |
|------|---------|----------------|
| 401 | Unauthorized | Token refresh → retry → logout |
| 402 | Plan limit exceeded | Auto-open UpgradeModal |
| 403 | Forbidden | Show AccessDenied component |
| 404 | Not found | Show NotFound page |
| 409 | Conflict | Show error toast |
| 429 | Rate limited | Show rate limit message |
| 500 | Server error | Show generic error |

### Auth Errors
| Error | Meaning | Action |
|-------|---------|--------|
| `SESSION_INVALIDATED` | New login on another device | Force logout |
| `SESSION_EXPIRED` | Token expired and refresh failed | Force logout |
| `EMAIL_NOT_VERIFIED` | Email not confirmed | Show resend verification option |
| `INVALID_CREDENTIALS` | Wrong email/password | Show error message |

### Feature Gate Errors
| Error | Meaning | Action |
|-------|---------|--------|
| `PLAN_LIMIT_EXCEEDED` | Hit application limit | Show UpgradeModal |
| `TRIAL_EXPIRED` | Trial period ended | Show UpgradeModal |
| `FEATURE_NOT_AVAILABLE` | Feature requires Pro | Show UpgradeModal |
| `UPGRADE_REQUIRED` | Upgrade needed | Show UpgradeModal |

## Common Issues

### App Won't Load

**Symptoms:** Blank page or loading spinner forever
**Possible Causes:**
- Missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`
- JavaScript error in console
- Backend API unreachable

**Diagnosis:** Open browser console (F12)
**Solution:** Verify `.env` file, check backend is running

### Auth Loop / Redirect Loop

**Symptoms:** Page keeps redirecting to login
**Possible Causes:**
- Supabase session mismatch
- Backend rejecting tokens
- `www` vs non-www domain mismatch

**Diagnosis:** Check Zustand auth store in DevTools
**Solution:** Clear localStorage, verify domain normalization

### Real-Time Chat Not Working

**Symptoms:** Messages not appearing, no online status
**Possible Causes:**
- Socket.IO connection failing
- JWT verification failing
- CORS misconfiguration

**Diagnosis:** Check Network tab for WebSocket connection
**Solution:** Verify backend Socket.IO is running, check CORS

### Payments Not Working

**Symptoms:** Razorpay checkout doesn't open
**Possible Causes:**
- Razorpay script not loading
- Invalid `VITE_RAZORPAY_KEY_ID`
- Ad blocker blocking script

**Diagnosis:** Check console for script load errors
**Solution:** Verify key, try in incognito (disable ad blocker)

### PWA Install Prompt Not Showing

**Symptoms:** No install prompt appears
**Possible Causes:**
- Service worker not registered
- Already installed
- iOS Safari (doesn't support standard install)

**Diagnosis:** Check Application tab in DevTools
**Solution:** Wait for trigger conditions (3 navigations, 7-day cooldown)

---

# 17. Testing

## Framework

- **Test Runner:** Vitest (v4.0.18)
- **DOM Simulation:** jsdom
- **React Testing:** @testing-library/react + user-event + jest-dom
- **Coverage:** V8 provider (text, JSON, HTML reports)

## Test Structure

```
src/__tests__/
├── setup.ts                    # Mocks (IntersectionObserver, matchMedia)
├── test-utils.tsx              # Custom render utilities (renderWithRouter)
├── stores/                     # Store tests
├── lib/                        # Utility tests
├── components/
│   ├── cards/                  # Card component tests
│   ├── common/                 # Breadcrumb tests
│   ├── forms/                  # LoginForm tests
│   ├── layouts/                # Layout component tests
│   ├── modals/                 # Modal component tests
│   ├── shared/                 # Shared component tests
│   └── ui/                     # shadcn/ui component tests
└── pages/
    ├── auth/                   # Auth page tests
    ├── client/                 # Client page tests
    ├── freelancer/             # Freelancer page tests
    └── public/                 # Public page tests
```

## Test Files (51 total)

### Auth Tests
- Login.test.tsx, Register.test.tsx, ForgotPassword.test.tsx

### Freelancer Page Tests
- Earnings, Applications, ProfileEdit, Messages, Portfolio, Dashboard, BrowseProjects, Settings

### Client Page Tests
- PostProject, ProjectDetails, Projects, Messages, Dashboard

### Public Page Tests
- Contact, FreelancerDirectory, HowItWorks, Pricing, About, Home

### Component Tests
- Layouts: Footer, PublicNavbar, DashboardSidebar, DashboardHeader
- Shared: RatingStars, NotificationBadge, StatusBadge, VerificationBadge, ProPlanBadge, SkillTag
- Modals: TermsModal, LoadingModal, ImagePreviewModal, ConfirmationModal, SuccessModal
- Forms: LoginForm (Zod validation)
- UI: label, textarea, card, input, dialog, button
- Cards: StatsCard, FreelancerCard, PricingCard, TestimonialCard, ProjectCard

### Store Tests
- useStore.test.ts

### Utility Tests
- utils.test.ts

## Running Tests

```bash
npm run test              # Run all tests
npm run test:coverage     # Run with coverage report
npx vitest --watch        # Watch mode
```

## What Is Covered

- Component rendering and interaction
- Form validation (Zod schemas)
- Store logic (Zustand)
- Utility functions
- Route protection
- Modal behavior

## What Is Not Covered

- API integration tests (no MSW setup)
- E2E tests (no Playwright/Cypress)
- Socket.IO integration tests
- Payment flow tests
- PWA tests

---

# 18. Maintenance & Support Guide

## What Should Be Monitored

| Metric | Tool | Threshold |
|--------|------|-----------|
| Core Web Vitals | Vercel Analytics | LCP > 2.5s, FID > 100ms, CLS > 0.1 |
| JavaScript errors | Browser console / Sentry (not configured) | Any uncaught errors |
| Bundle size | Vite build output | > 500KB gzipped |
| API response times | Backend monitoring | > 2s |
| Socket.IO connections | Backend monitoring | Connection failures |
| PWA install rate | Google Analytics | Declining installs |
| Ad revenue | AdSense dashboard | Declining revenue |

## Regular Maintenance Tasks

| Task | Frequency | How |
|------|-----------|-----|
| Update dependencies | Monthly | `npm update`, `npm audit` |
| Review security advisories | Monthly | `npm audit` |
| Check bundle size | Monthly | `npm run build` and review output |
| Update Google Analytics | As needed | Update `VITE_GA_MEASUREMENT_ID` |
| Update AdSense | As needed | Update `VITE_ADSENSE_PUB_ID` |
| Review analytics tracking | Quarterly | Verify GA4, Clarity, AdSense working |
| Test on mobile devices | Monthly | Physical device testing |
| Check PWA manifest | Quarterly | Verify icons, name, start_url |

## Dependency Updates

Key dependencies to monitor:
- `react` / `react-dom` — Major version upgrades require careful migration
- `@supabase/supabase-js` — Auth SDK changes may affect login flows
- `socket.io-client` — Must match backend Socket.IO version
- `vite` — Build tool updates may affect config
- `@radix-ui/*` — UI primitive updates may affect shadcn/ui components

---

# 19. How to Modify the System

## Adding a New Page

1. Create page component in `src/pages/<section>/NewPage.tsx`
2. Add lazy import in `src/App.tsx`
3. Add route in the appropriate route group (public, client, freelancer, admin)
4. If dashboard page: add navigation item in `src/config/navigation.ts`
5. Add to prerender list in `scripts/prerender-public.mjs` (if public)
6. Add SEO component with meta tags

## Adding a New Component

1. Create component in appropriate `src/components/<category>/`
2. For UI primitives: use shadcn/ui conventions (Radix + Tailwind + CVA)
3. For domain components: follow existing card/component patterns
4. Export from index file if reusable
5. Add tests in `src/__tests__/components/`

## Adding a New API Service

1. Create service file in `src/services/new.service.ts`
2. Import `api` from `@/lib/api`
3. Define typed methods (get, post, patch, delete)
4. Export from `src/services/index.ts`
5. Create React Query hooks in `src/hooks/queries/` if needed

## Adding a New Zustand Store

1. Create store file in `src/stores/new.store.ts`
2. Use `create` from zustand
3. Add `persist` middleware if persistence needed
4. Add devtools middleware for debugging (optional)

## Adding a New Modal

1. Create modal component in `src/components/modals/`
2. Use shadcn/ui `Dialog` as base
3. Follow existing modal patterns (ConfirmationModal, SuccessModal)
4. Trigger via state or Zustand store

## Adding a New Feature Gate

1. Add feature flag to backend `featureFlags.ts`
2. Add flag type to `src/types/feature-gate.types.ts`
3. Update `useFeatureGate` hook with new derived state
4. Use `FeatureGate` component to wrap gated UI
5. Handle 402 responses (already automatic via interceptor)

---

# 20. Known Issues, Technical Debt & Risks

## High

| Issue | Description |
|-------|-------------|
| **No E2E tests** | No Playwright or Cypress for full user flow testing |
| **No error tracking** | No Sentry or similar for production error monitoring |
| **API URL hardcoded fallback** | `VITE_API_URL` defaults to localhost in dev, throws in prod |

## Medium

| Issue | Description |
|-------|-------------|
| **Duplicate utils.ts** | `src/utils/utils.ts` duplicates `src/lib/utils.ts` |
| **Legacy DashboardSidebar** | Unused `DashboardSidebar.tsx` component |
| **LoginForm component** | Demo/test component not used in actual auth flow |
| **No .env.example** | No template file for new developers |
| **Admin CSS separate** | ~2000 lines of admin CSS could be better organized |
| **In-memory lockout warning** | Backend account lockout not shared across instances |

## Low

| Issue | Description |
|-------|-------------|
| **Default Vite README** | No project-specific README |
| **Large bundle warning** | 1000KB chunk size warning threshold |
| **PWA iOS limitations** | iOS Safari doesn't support standard install prompt |
| **Ad blocker impact** | Razorpay and AdSense blocked by some ad blockers |

---

# 21. Project Handover Checklist

## Source Code
- [x] Frontend repository accessible
- [ ] Backend repository (separate, required for full functionality)

## Repository Access
- [ ] Git repository URL and credentials
- [ ] Branch protection rules
- [ ] Collaborator/team access

## Hosting
- [x] Vercel deployment config (`vercel.json`)
- [ ] Vercel account access
- [ ] Custom domain configuration

## Environment Variables
- [x] `.env` file (actual values)
- [ ] Supabase project credentials
- [ ] Razorpay key ID
- [ ] Cloudflare Turnstile site key
- [ ] Google OAuth client ID
- [ ] VAPID public key
- [ ] Google Analytics measurement ID
- [ ] Microsoft Clarity project ID
- [ ] AdSense publisher ID
- [ ] `VITE_API_URL` for production

## Third-Party Services
- [ ] Supabase project access
- [ ] Razorpay dashboard access
- [ ] Google Cloud Console (OAuth, Analytics)
- [ ] Cloudflare account (Turnstile)
- [ ] Microsoft Clarity dashboard
- [ ] Google AdSense dashboard
- [ ] Vercel dashboard

## Build & Deploy
- [x] `vercel.json` configured
- [x] PWA manifest and icons
- [ ] Capacitor Android project access
- [ ] Google Play Store listing (if published)

## Documentation
- [x] This documentation file
- [ ] Project-specific README (currently default Vite template)

## Testing
- [x] Test suite (51 test files)
- [ ] Test coverage report
- [ ] E2E test setup (missing)

---

# 22. Non-Technical Client Guide

## What the Frontend Does

The frontend is the **website and mobile app** that users see and interact with. It's the visual layer that makes the marketplace usable — all the buttons, forms, pages, and interactions.

## How Users Interact With It

### On a Computer (Desktop/Laptop)
- Visit connectmeindia.com in any modern browser (Chrome, Firefox, Safari, Edge)
- Full sidebar navigation on dashboard pages
- Responsive design adapts to screen size

### On a Phone
- Visit connectmeindia.com — the site works like a mobile app
- Bottom navigation bar for easy thumb access
- Can be "installed" as a home screen app (PWA)
- Real-time chat works smoothly on mobile

### As an Android App
- Available via Capacitor (Google Play Store)
- Same features as the web version
- Native app feel

## What Requires Maintenance

- **Content updates** — Homepage text, pricing page, legal pages
- **Images and logos** — Replace in `public/` directory
- **Analytics** — Monitor Google Analytics, Clarity, AdSense dashboards
- **SEO** — Update meta tags, sitemap, prerender routes
- **Dependencies** — Monthly security updates

## What Can Go Wrong

- **Slow loading** — Usually network issues or large bundle
- **Login problems** — Usually Supabase or backend issues
- **Payment failures** — Razorpay downtime or card issues
- **Chat not working** — Backend Socket.IO server down
- **App not installing** — Browser doesn't support PWA

## Who to Contact

| Issue | Contact |
|-------|---------|
| Website is down | Hosting provider (Vercel) + backend developer |
| Login not working | Backend developer (auth issues) |
| Payment issues | Razorpay support + backend developer |
| Design changes | Frontend developer |
| Content changes | Content manager (can edit text in code) |
| Analytics issues | Marketing team |

---

# 23. Technical Developer Handover

## Architecture Summary

```
React 18 + TypeScript + Vite
├── Zustand (client state: auth, theme, notifications, unread, upgrade-modal)
├── React Query (server state: feature gates, dashboards, categories)
├── Axios (HTTP: auth injection, 401 refresh, 402 upgrade modal)
├── Socket.IO (real-time: chat, presence, notifications)
├── Supabase Auth (identity: PKCE, sessions, OAuth)
├── React Router (routing: lazy loading, role-based guards)
├── shadcn/ui + Tailwind (UI: Radix primitives, utility CSS)
├── PWA (service worker, push notifications, install prompt)
└── Capacitor (Android native wrapper)
```

## Important Directories

| Directory | Purpose |
|-----------|---------|
| `src/pages/` | All 50+ page components |
| `src/components/` | Reusable UI components (ui, cards, shared, modals, chat, feature-gate) |
| `src/lib/` | Core infrastructure (api, axios, supabase, socket, oauth) |
| `src/services/` | API service layer (16 services) |
| `src/stores/` | Zustand state stores (6 stores) |
| `src/hooks/` | Custom hooks + React Query hooks |
| `src/layouts/` | Dashboard layout wrappers |
| `src/config/` | Navigation configuration |
| `src/types/` | TypeScript type definitions |

## Important Files

| File | Purpose |
|------|---------|
| `src/main.tsx` | App entry point (provider hierarchy) |
| `src/App.tsx` | Route definitions (704 lines, all lazy-loaded) |
| `src/lib/axios-client.ts` | HTTP client with auth, refresh, 402 handling |
| `src/lib/supabase.ts` | Supabase client initialization |
| `src/lib/socket.ts` | Socket.IO singleton |
| `src/lib/oauth.ts` | OAuth flow helpers |
| `src/hooks/useAuth.ts` | Auth actions (login, register, OAuth) |
| `src/hooks/useSocket.ts` | Socket.IO lifecycle |
| `src/hooks/useFeatureGate.ts` | Feature gate logic |
| `src/stores/auth.store.ts` | Auth state (tokens in memory) |
| `src/components/auth/AuthInitializer.tsx` | App boot auth logic |
| `src/components/auth/ProtectedRoute.tsx` | Route guards |

## Critical Workflows

1. **Boot:** main.tsx → providers → AuthInitializer → Supabase session restore → App
2. **Login:** Supabase SDK → Backend verify → Zustand update → Navigate to dashboard
3. **Token refresh:** 401 → Queue-based refresh → Cross-tab BroadcastChannel → Retry
4. **Real-time:** Socket.IO connect → JWT auth → Room join → Message events
5. **Feature gate:** 402 response → UpgradeModal → Subscription upgrade

## Environment Variables

See [Section 12](#12-environment-variables--configuration) for complete reference. Minimum required:
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`, `VITE_RAZORPAY_KEY_ID`
- `VITE_TURNSTILE_SITE_KEY`, `VITE_GOOGLE_CLIENT_ID`
- `VITE_OAUTH_REDIRECT_URL`, `VITE_VAPID_PUBLIC_KEY`

## Deployment Process

1. Push to GitHub
2. Vercel auto-deploys from main branch
3. Ensure environment variables are set in Vercel dashboard
4. Verify production URL works
5. Test login, payments, real-time chat

## External Dependencies

| Dependency | Purpose | Failure Impact |
|-----------|---------|---------------|
| Supabase | Authentication | No login/registration |
| Backend API | All data | Complete outage |
| Razorpay | Payments | No Pro upgrades |
| Socket.IO (backend) | Real-time chat | No messaging |
| Cloudflare Turnstile | CAPTCHA | Bot vulnerability |
| Vercel | Hosting | Site inaccessible |

## Recommended First Steps for New Developer

1. Read this documentation
2. Set up local development (Section 13)
3. Start backend (required for frontend to work)
4. Explore the route tree in `App.tsx`
5. Understand the auth flow (useAuth.ts + AuthInitializer)
6. Check the Axios interceptors (axios-client.ts)
7. Review the Zustand stores
8. Run the test suite (`npm run test`)

---

# 24. Final Project Summary

## What Is Working

- Complete responsive web application (desktop + mobile)
- Authentication (email/password + Google OAuth)
- Role-based dashboards (client, freelancer, admin)
- Real-time messaging via Socket.IO
- Payment integration (Razorpay)
- Feature gating with trial periods
- Push notifications (browser)
- PWA support (installable)
- Dark mode
- SEO (meta tags, prerendering)
- Analytics (GA4, Clarity, AdSense)
- Test suite (51 test files)

## What Is Incomplete

- No E2E tests (Playwright/Cypress)
- No error tracking (Sentry)
- No project-specific README
- No `.env.example` file
- Legacy unused components (DashboardSidebar, LoginForm)
- Duplicate utils file

## What Requires External Setup

- Supabase project (authentication)
- Backend API server
- Razorpay merchant account
- Cloudflare Turnstile site
- Google OAuth client ID
- VAPID key pair (web push)
- Vercel deployment
- Google Analytics property
- Microsoft Clarity project
- Google AdSense account

## Major Risks

1. **No E2E tests** — Regression risk for user flows
2. **No error tracking** — Production issues may go unnoticed
3. **Backend dependency** — Frontend is non-functional without backend
4. **Ad blockers** — Can block Razorpay and AdSense

## Recommended Improvements

1. Add E2E tests (Playwright)
2. Integrate error tracking (Sentry)
3. Create comprehensive README
4. Add `.env.example` with all variables
5. Remove legacy components
6. Consolidate duplicate utilities
7. Add bundle analysis
8. Set up performance monitoring
9. Add i18n support (Hindi + English)

## Overall Project Health Assessment

**Score: 7.5/10**

The frontend is well-architected with modern tooling, clean code, and comprehensive features. The auth system is robust with cross-tab coordination and graceful degradation. The main weaknesses are the lack of E2E tests, error tracking, and some legacy code. The codebase is production-ready for a small-to-medium scale application.

---

# 25. Developer Quick Reference

## Essential Commands

```bash
# Development
npm run dev                    # Start Vite dev server (port 5173)
npm run build                  # Build for production
npm run build:capacitor        # Build for Android
npm run build:static           # Build + prerender public pages

# Testing
npm run test                   # Run Vitest tests
npm run test:coverage          # Run with coverage

# Code Quality
npm run lint                   # Run ESLint

# Mobile
npm run sync:android           # Build + sync to Capacitor Android
```

## Key Directories

```
src/pages/          → All page components (50+)
src/components/     → Reusable UI components
src/lib/            → Core infrastructure (API, auth, socket)
src/services/       → API service layer (16 services)
src/stores/         → Zustand state stores (6 stores)
src/hooks/          → Custom hooks + React Query hooks
src/layouts/        → Dashboard layout wrappers
```

## Key Files

```
src/main.tsx                          → App entry point
src/App.tsx                           → Route definitions (704 lines)
src/lib/axios-client.ts               → HTTP client with interceptors
src/lib/supabase.ts                   → Supabase client
src/lib/socket.ts                     → Socket.IO singleton
src/hooks/useAuth.ts                  → Auth actions
src/stores/auth.store.ts             → Auth state
src/components/auth/AuthInitializer.tsx → Boot auth logic
src/components/auth/ProtectedRoute.tsx → Route guards
```

## Environment Variables (Minimum Required)

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_API_URL=http://localhost:3000/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_xxx
VITE_TURNSTILE_SITE_KEY=xxx
VITE_GOOGLE_CLIENT_ID=xxx
VITE_OAUTH_REDIRECT_URL=http://localhost:5173/auth/callback
VITE_VAPID_PUBLIC_KEY=xxx
```

## Debugging

```bash
# Check build output
npm run build 2>&1 | head -20

# Run tests
npm run test

# Check for TypeScript errors
npx tsc --noEmit

# Check bundle size
npm run build && ls -lh dist/assets/
```

## Troubleshooting Entry Points

1. **App won't load** → Check browser console, verify `.env` file
2. **Auth failing** → Check Supabase credentials, clear localStorage
3. **API errors** → Check `VITE_API_URL`, verify backend is running
4. **Real-time not working** → Check Socket.IO connection in Network tab
5. **Payments failing** → Check Razorpay key, try incognito mode
6. **Build fails** → Run `npm install`, check TypeScript errors

---

**End of Documentation**

*This document was generated on August 15, 2026, by analyzing the complete frontend repository at `/Users/vvssgowtham/Documents/FreelanceMarketPlace/frontend`.*

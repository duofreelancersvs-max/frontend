import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  ClientRoute,
  FreelancerRoute,
  AdminRoute,
} from "@/components/auth/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import ClientLayout from "@/layouts/ClientLayout";
import FreelancerLayout from "@/layouts/FreelancerLayout";
import AdminLayout from "@/components/layouts/AdminLayout";
import { UnreadListener } from "@/components/chat/UnreadListener";
import PageLoader from "@/components/shared/PageLoader";
import { ThemeInitializer } from "@/components/theme/ThemeInitializer";

// Public
const Home = lazy(() => import("@/pages/public/Home"));

const About = lazy(() => import("@/pages/public/About"));
const HowItWorks = lazy(() => import("@/pages/public/HowItWorks"));
const Pricing = lazy(() => import("@/pages/public/Pricing"));
const FreelancerDirectory = lazy(
  () => import("@/pages/public/FreelancerDirectory"),
);
const FreelancerProfile = lazy(
  () => import("@/pages/public/FreelancerProfile"),
);
const Categories = lazy(() => import("@/pages/public/Categories"));
const Contact = lazy(() => import("@/pages/public/Contact"));
const FindWorkPublic = lazy(() => import("@/pages/public/FindWork"));
const LegalPage = lazy(() => import("@/pages/public/LegalPage"));
const NotFound = lazy(() => import("@/pages/public/NotFound"));

// Auth
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const OAuthCallback = lazy(() => import("@/pages/auth/OAuthCallback"));
const VerifyEmailSent = lazy(() => import("@/pages/auth/VerifyEmailSent"));
const VerifyEmail = lazy(() => import("@/pages/auth/VerifyEmail"));

// Client
const ClientDashboard = lazy(() => import("@/pages/client/Dashboard"));
const ClientFreelancers = lazy(
  () => import("@/pages/client/ClientFreelancers"),
);
const FreelancerProfileView = lazy(
  () => import("@/pages/client/FreelancerProfileView"),
);
const PostProject = lazy(() => import("@/pages/client/PostProject"));
const ClientProjects = lazy(() => import("@/pages/client/Projects"));
const ProjectDetails = lazy(() => import("@/pages/client/ProjectDetails"));
const ClientMessages = lazy(() => import("@/pages/client/Messages"));
const ClientReviews = lazy(() => import("@/pages/client/Reviews"));
const ClientSettings = lazy(() => import("@/pages/client/Settings"));

// Freelancer
const FreelancerDashboard = lazy(() => import("@/pages/freelancer/Dashboard"));
const FreelancerProfileEdit = lazy(
  () => import("@/pages/freelancer/ProfileEdit"),
);
const FindWork = lazy(() => import("@/pages/freelancer/FindWork"));
const FreelancerMessages = lazy(() => import("@/pages/freelancer/Messages"));
const FreelancerSubscription = lazy(
  () => import("@/pages/freelancer/Subscription"),
);
const FreelancerEarnings = lazy(() => import("@/pages/freelancer/Earnings"));
const FreelancerPortfolio = lazy(() => import("@/pages/freelancer/Portfolio"));
const FreelancerApplications = lazy(
  () => import("@/pages/freelancer/Applications"),
);
const FreelancerReviews = lazy(() => import("@/pages/freelancer/Reviews"));
const FreelancerSettings = lazy(() => import("@/pages/freelancer/Settings"));

// Admin
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const SubscriptionManagement = lazy(
  () => import("@/pages/admin/SubscriptionManagement"),
);
const RazorpaySettings = lazy(() => import("@/pages/admin/RazorpaySettings"));
const SendNotifications = lazy(() => import("@/pages/admin/SendNotifications"));
const ProjectManagement = lazy(() => import("@/pages/admin/ProjectManagement"));
const ReviewsManagement = lazy(() => import("@/pages/admin/ReviewsManagement"));
const ApplicationsManagement = lazy(() => import("@/pages/admin/ApplicationsManagement"));
const ConversationsManagement = lazy(() => import("@/pages/admin/ConversationsManagement"));
const CategoriesManagement = lazy(() => import("@/pages/admin/CategoriesManagement"));
const PaymentsManagement = lazy(() => import("@/pages/admin/PaymentsManagement"));
const AuditLogs = lazy(() => import("@/pages/admin/AuditLogs"));

import { PageSkeleton } from "@/components/shared/Skeleton";

/**
 * Inline Suspense wrapper for lazy-loaded pages inside layouts.
 * This prevents the entire layout (sidebar, header) from unmounting
 * during navigation — only the content area shows a brief loader.
 */
const ContentLoader = () => <PageSkeleton />;

function SP({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<ContentLoader />}>{children}</Suspense>;
}

function App() {
  return (
    <>
      <ThemeInitializer />
      <UnreadListener />
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Pages (full-page Suspense is fine here — no persistent layout) */}
        <Route
          path="/"
          element={
            <Suspense fallback={<PageLoader />}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path="/about"
          element={
            <Suspense fallback={<PageLoader />}>
              <About />
            </Suspense>
          }
        />
        <Route
          path="/how-it-works"
          element={
            <Suspense fallback={<PageLoader />}>
              <HowItWorks />
            </Suspense>
          }
        />
        <Route
          path="/pricing"
          element={
            <Suspense fallback={<PageLoader />}>
              <Pricing />
            </Suspense>
          }
        />
        <Route
          path="/freelancers"
          element={
            <Suspense fallback={<PageLoader />}>
              <FreelancerDirectory />
            </Suspense>
          }
        />
        <Route
          path="/freelancer/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <FreelancerProfile />
            </Suspense>
          }
        />
        <Route
          path="/contact"
          element={
            <Suspense fallback={<PageLoader />}>
              <Contact />
            </Suspense>
          }
        />
        <Route
          path="/projects"
          element={
            <Suspense fallback={<PageLoader />}>
              <FindWorkPublic />
            </Suspense>
          }
        />
        <Route
          path="/categories"
          element={
            <Suspense fallback={<PageLoader />}>
              <Categories />
            </Suspense>
          }
        />
        <Route
          path="/terms-and-conditions"
          element={
            <Suspense fallback={<PageLoader />}>
              <LegalPage defaultSlug="terms-and-conditions" />
            </Suspense>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <Suspense fallback={<PageLoader />}>
              <LegalPage defaultSlug="privacy-policy" />
            </Suspense>
          }
        />
        <Route
          path="/legal/:slug"
          element={
            <Suspense fallback={<PageLoader />}>
              <LegalPage />
            </Suspense>
          }
        />

        {/* Auth Pages */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<PageLoader />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<PageLoader />}>
              <Register />
            </Suspense>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<PageLoader />}>
              <ForgotPassword />
            </Suspense>
          }
        />
        <Route
          path="/auth/callback"
          element={
            <Suspense fallback={<PageLoader />}>
              <OAuthCallback />
            </Suspense>
          }
        />
        <Route
          path="/verify-email-sent"
          element={
            <Suspense fallback={<PageLoader />}>
              <VerifyEmailSent />
            </Suspense>
          }
        />
        <Route
          path="/verify-email"
          element={
            <Suspense fallback={<PageLoader />}>
              <VerifyEmail />
            </Suspense>
          }
        />

        {/* Authenticated Home Page redirected to Root */}
        <Route
          path="/home"
          element={<Navigate to="/" replace />}
        />

        {/* Client Dashboard Pages — Suspense per-page keeps sidebar stable */}
        <Route
          path="/client"
          element={
            <ClientRoute>
              <ClientLayout />
            </ClientRoute>
          }
        >
          <Route
            path="dashboard"
            element={
              <SP>
                <ClientDashboard />
              </SP>
            }
          />
          <Route
            path="post-project"
            element={
              <SP>
                <PostProject />
              </SP>
            }
          />
          <Route
            path="projects"
            element={
              <SP>
                <ClientProjects />
              </SP>
            }
          />
          <Route
            path="project/:id"
            element={
              <SP>
                <ProjectDetails />
              </SP>
            }
          />
          <Route
            path="project/:id/applications"
            element={
              <SP>
                <ProjectDetails />
              </SP>
            }
          />
          <Route
            path="project/:id/edit"
            element={
              <SP>
                <PostProject />
              </SP>
            }
          />
          <Route
            path="freelancers"
            element={
              <SP>
                <ClientFreelancers />
              </SP>
            }
          />
          <Route
            path="freelancer/:id"
            element={
              <SP>
                <FreelancerProfileView />
              </SP>
            }
          />
          <Route
            path="messages"
            element={
              <SP>
                <ClientMessages />
              </SP>
            }
          />
          <Route
            path="reviews"
            element={
              <SP>
                <ClientReviews />
              </SP>
            }
          />
          <Route
            path="settings"
            element={
              <SP>
                <ClientSettings />
              </SP>
            }
          />
          <Route
            path="profile"
            element={
              <SP>
                <ClientSettings />
              </SP>
            }
          />
        </Route>

        {/* Freelancer Dashboard Pages — Suspense per-page keeps sidebar stable */}
        <Route
          element={
            <FreelancerRoute>
              <FreelancerLayout />
            </FreelancerRoute>
          }
        >
          <Route
            path="/freelancer/dashboard"
            element={
              <SP>
                <FreelancerDashboard />
              </SP>
            }
          />
          <Route
            path="/freelancer/profile"
            element={
              <SP>
                <FreelancerProfileEdit />
              </SP>
            }
          />
          <Route
            path="/freelancer/messages"
            element={
              <SP>
                <FreelancerMessages />
              </SP>
            }
          />
          <Route
            path="/freelancer/subscription"
            element={
              <SP>
                <FreelancerSubscription />
              </SP>
            }
          />
          <Route
            path="/freelancer/earnings"
            element={
              <SP>
                <FreelancerEarnings />
              </SP>
            }
          />
          <Route
            path="/freelancer/portfolio"
            element={
              <SP>
                <FreelancerPortfolio />
              </SP>
            }
          />
          <Route
            path="/freelancer/applications"
            element={
              <SP>
                <FreelancerApplications />
              </SP>
            }
          />
          <Route
            path="/freelancer/reviews"
            element={
              <SP>
                <FreelancerReviews />
              </SP>
            }
          />
          <Route
            path="/freelancer/settings"
            element={
              <SP>
                <FreelancerSettings />
              </SP>
            }
          />
          <Route
            path="/freelancer/projects"
            element={
              <SP>
                <FindWork />
              </SP>
            }
          />
        </Route>

        {/* Admin Dashboard Pages */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Suspense fallback={<PageLoader />}>
                <AdminLayout />
              </Suspense>
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <SP>
                <AdminDashboard />
              </SP>
            }
          />
          <Route
            path="users"
            element={
              <SP>
                <UserManagement />
              </SP>
            }
          />

          <Route
            path="subscriptions"
            element={
              <SP>
                <SubscriptionManagement />
              </SP>
            }
          />
          <Route
            path="payments"
            element={
              <SP>
                <PaymentsManagement />
              </SP>
            }
          />
          <Route
            path="projects"
            element={
              <SP>
                <ProjectManagement />
              </SP>
            }
          />
          <Route
            path="post-project"
            element={
              <SP>
                <PostProject />
              </SP>
            }
          />
          <Route
            path="notifications"
            element={
              <SP>
                <SendNotifications />
              </SP>
            }
          />
          <Route
            path="reviews"
            element={
              <SP>
                <ReviewsManagement />
              </SP>
            }
          />
          <Route
            path="applications"
            element={
              <SP>
                <ApplicationsManagement />
              </SP>
            }
          />
          <Route
            path="conversations"
            element={
              <SP>
                <ConversationsManagement />
              </SP>
            }
          />
          <Route
            path="categories"
            element={
              <SP>
                <CategoriesManagement />
              </SP>
            }
          />

          <Route
            path="audit-logs"
            element={
              <SP>
                <AuditLogs />
              </SP>
            }
          />
          <Route
            path="payment-gateway"
            element={
              <SP>
                <RazorpaySettings />
              </SP>
            }
          />
        </Route>

        <Route
          path="*"
          element={
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
}

export default App;

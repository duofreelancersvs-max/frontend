import { Routes, Route } from "react-router-dom";
import Home from "@/pages/public/Home";
import About from "@/pages/public/About";
import HowItWorks from "@/pages/public/HowItWorks";
import Pricing from "@/pages/public/Pricing";
import FreelancerDirectory from "@/pages/public/FreelancerDirectory";
import FreelancerProfile from "@/pages/public/FreelancerProfile";
import Contact from "@/pages/public/Contact";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import OAuthCallback from "@/pages/auth/OAuthCallback";
import ClientDashboard from "@/pages/client/Dashboard";
import ClientFreelancers from "@/pages/client/ClientFreelancers";
import PostProject from "@/pages/client/PostProject";
import ClientProjects from "@/pages/client/Projects";
import ProjectDetails from "@/pages/client/ProjectDetails";
import ClientMessages from "@/pages/client/Messages";
import FreelancerDashboard from "@/pages/freelancer/Dashboard";
import FreelancerProfileEdit from "@/pages/freelancer/ProfileEdit";
import BrowseProjects from "@/pages/freelancer/BrowseProjects";
import FreelancerMessages from "@/pages/freelancer/Messages";
import FreelancerSubscription from "@/pages/freelancer/Subscription";
import FreelancerEarnings from "@/pages/freelancer/Earnings";
import FreelancerPortfolio from "@/pages/freelancer/Portfolio";
import FreelancerApplications from "@/pages/freelancer/Applications";
import FreelancerReviews from "@/pages/freelancer/Reviews";
import FreelancerSettings from "@/pages/freelancer/Settings";
import ClientPayments from "@/pages/client/Payments";
import ClientReviews from "@/pages/client/Reviews";
import ClientSettings from "@/pages/client/Settings";
import AdminDashboard from "@/pages/admin/Dashboard";
import UserManagement from "@/pages/admin/UserManagement";
import VerificationQueue from "@/pages/admin/VerificationQueue";
import SubscriptionManagement from "@/pages/admin/SubscriptionManagement";
import RazorpaySettings from "@/pages/admin/RazorpaySettings";
import SendNotifications from "@/pages/admin/SendNotifications";
import {
  ClientRoute,
  FreelancerRoute,
  AdminRoute,
} from "@/components/auth/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import ClientLayout from "@/layouts/ClientLayout";

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/freelancers" element={<FreelancerDirectory />} />
        <Route path="/freelancer/:id" element={<FreelancerProfile />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* Client Dashboard Pages */}
        <Route
          path="/client"
          element={
            <ClientRoute>
              <ClientLayout />
            </ClientRoute>
          }
        >
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="post-project" element={<PostProject />} />
          <Route path="projects" element={<ClientProjects />} />
          <Route path="project/:id" element={<ProjectDetails />} />
          <Route path="project/:id/edit" element={<PostProject />} />
          <Route path="freelancers" element={<ClientFreelancers />} />
          <Route path="messages" element={<ClientMessages />} />
          <Route path="payments" element={<ClientPayments />} />
          <Route path="reviews" element={<ClientReviews />} />
          <Route path="settings" element={<ClientSettings />} />
        </Route>

        {/* Freelancer Dashboard Pages */}
        <Route
          path="/freelancer/dashboard"
          element={
            <FreelancerRoute>
              <FreelancerDashboard />
            </FreelancerRoute>
          }
        />
        <Route
          path="/freelancer/profile"
          element={
            <FreelancerRoute>
              <FreelancerProfileEdit />
            </FreelancerRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <FreelancerRoute>
              <BrowseProjects />
            </FreelancerRoute>
          }
        />
        <Route
          path="/freelancer/messages"
          element={
            <FreelancerRoute>
              <FreelancerMessages />
            </FreelancerRoute>
          }
        />
        <Route
          path="/freelancer/subscription"
          element={
            <FreelancerRoute>
              <FreelancerSubscription />
            </FreelancerRoute>
          }
        />
        <Route
          path="/freelancer/earnings"
          element={
            <FreelancerRoute>
              <FreelancerEarnings />
            </FreelancerRoute>
          }
        />
        <Route
          path="/freelancer/portfolio"
          element={
            <FreelancerRoute>
              <FreelancerPortfolio />
            </FreelancerRoute>
          }
        />
        <Route
          path="/freelancer/applications"
          element={
            <FreelancerRoute>
              <FreelancerApplications />
            </FreelancerRoute>
          }
        />
        <Route
          path="/freelancer/reviews"
          element={
            <FreelancerRoute>
              <FreelancerReviews />
            </FreelancerRoute>
          }
        />
        <Route
          path="/freelancer/settings"
          element={
            <FreelancerRoute>
              <FreelancerSettings />
            </FreelancerRoute>
          }
        />

        {/* Admin Dashboard Pages */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/verifications"
          element={
            <AdminRoute>
              <VerificationQueue />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/subscriptions"
          element={
            <AdminRoute>
              <SubscriptionManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <AdminRoute>
              <RazorpaySettings />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <AdminRoute>
              <SendNotifications />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;

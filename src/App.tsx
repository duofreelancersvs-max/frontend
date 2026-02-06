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
import VerifyOTP from "@/pages/auth/VerifyOTP";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ClientDashboard from "@/pages/client/Dashboard";
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

function App() {
  return (
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
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Client Dashboard Pages */}
      <Route path="/client/dashboard" element={<ClientDashboard />} />
      <Route path="/client/post-project" element={<PostProject />} />
      <Route path="/client/projects" element={<ClientProjects />} />
      <Route path="/client/project/:id" element={<ProjectDetails />} />
      <Route path="/client/messages" element={<ClientMessages />} />

      {/* Freelancer Dashboard Pages */}
      <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
      <Route path="/freelancer/profile" element={<FreelancerProfileEdit />} />
      <Route path="/projects" element={<BrowseProjects />} />
      <Route path="/freelancer/messages" element={<FreelancerMessages />} />
      <Route
        path="/freelancer/subscription"
        element={<FreelancerSubscription />}
      />
      <Route path="/freelancer/earnings" element={<FreelancerEarnings />} />

      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;

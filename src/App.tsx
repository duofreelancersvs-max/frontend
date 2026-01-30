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

      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;

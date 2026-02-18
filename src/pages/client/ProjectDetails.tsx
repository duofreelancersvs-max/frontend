import { useState } from "react";
import { Link, useParams, useOutletContext } from "react-router-dom";
import type { ClientLayoutContext } from "@/layouts/ClientLayout";
import {
  PlusCircle,
  CreditCard,
  Star,
  Settings,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Menu,
  ChevronRight,
  Edit2,
  Share2,
  XCircle,
  Download,
  FileText,
  Clock,
  Calendar,
  MapPin,
  Briefcase,
  Users,
  MessageSquare,
  Heart,
  CheckCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Send,
  Award,
  TrendingUp,
  Verified,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock Project Data
const projectData = {
  id: 1,
  title: "E-commerce Product Video",
  category: "Video Editing",
  status: "open", // open, in-progress, completed
  description: `Looking for a skilled video editor to create a professional product video for our new e-commerce store. The video should showcase our products in a compelling way with smooth transitions, engaging visuals, and a modern aesthetic.

**Requirements:**
- 60-90 second video length
- High-quality product shots with dynamic camera movements
- Lifestyle scenes showing product in use
- Professional color grading
- Royalty-free background music
- Text overlays for key features
- Optimized for social media (Instagram, Facebook, YouTube)

**Deliverables:**
- Main video in 4K resolution
- Square format version for Instagram
- Vertical format for Stories/Reels
- Source project files`,
  budget: { min: 15000, max: 25000 },
  duration: "1-4 weeks",
  experienceLevel: "Intermediate",
  location: "Remote",
  deadline: "December 31, 2024",
  postedAt: "3 days ago",
  applications: 12,
  skills: [
    "Adobe Premiere Pro",
    "After Effects",
    "Color Grading",
    "Motion Graphics",
    "DaVinci Resolve",
  ],
  attachments: [
    { name: "Brand_Guidelines.pdf", size: "2.4 MB", type: "pdf" },
    { name: "Product_Photos.zip", size: "45 MB", type: "zip" },
    { name: "Reference_Video.mp4", size: "18 MB", type: "video" },
  ],
  visibility: "public",
};

// Mock Applications Data
const applicationsData = [
  {
    id: 1,
    freelancer: {
      name: "Arun Kumar",
      avatar: "AK",
      title: "Senior Video Editor",
      rating: 4.9,
      reviews: 47,
      verified: true,
      location: "Mumbai, India",
    },
    coverLetter:
      "Hi! I've been a professional video editor for over 6 years with expertise in e-commerce product videos. I've worked with brands like Nykaa, Myntra, and several D2C startups. I can deliver high-quality cinematic product videos that convert viewers into customers...",
    skills: ["Adobe Premiere Pro", "After Effects", "Color Grading"],
    appliedAt: "2 hours ago",
    status: "new",
  },
  {
    id: 2,
    freelancer: {
      name: "Priya Sharma",
      avatar: "PS",
      title: "Motion Graphics Artist",
      rating: 4.8,
      reviews: 32,
      verified: true,
      location: "Delhi, India",
    },
    coverLetter:
      "Hello! I specialize in creating stunning product videos with beautiful motion graphics and animations. My work has been featured on major e-commerce platforms and social media campaigns. I use After Effects and Cinema 4D for creating eye-catching visuals...",
    skills: ["After Effects", "Cinema 4D", "Motion Graphics"],
    appliedAt: "5 hours ago",
    status: "shortlisted",
  },
  {
    id: 3,
    freelancer: {
      name: "Vikram Reddy",
      avatar: "VR",
      title: "Video Producer",
      rating: 4.7,
      reviews: 28,
      verified: false,
      location: "Bangalore, India",
    },
    coverLetter:
      "I'm a passionate video producer with a keen eye for detail. I've created product videos for startups and established brands alike. My approach combines creative storytelling with professional editing techniques to create videos that engage and convert...",
    skills: ["Premiere Pro", "DaVinci Resolve", "Color Grading"],
    appliedAt: "1 day ago",
    status: "new",
  },
  {
    id: 4,
    freelancer: {
      name: "Meera Nair",
      avatar: "MN",
      title: "Creative Video Editor",
      rating: 5.0,
      reviews: 15,
      verified: true,
      location: "Chennai, India",
    },
    coverLetter:
      "As a creative video editor with a background in advertising, I understand how to create product videos that not only look beautiful but also drive sales. I pay attention to pacing, music selection, and visual storytelling to create impactful videos...",
    skills: ["Adobe Premiere Pro", "After Effects", "Motion Graphics"],
    appliedAt: "2 days ago",
    status: "new",
  },
];

// Mock Activity Log
const activityLog = [
  {
    id: 1,
    type: "posted",
    message: "Project was posted",
    time: "3 days ago",
    icon: PlusCircle,
  },
  {
    id: 2,
    type: "application",
    message: "Arun Kumar submitted an application",
    time: "2 hours ago",
    icon: Send,
  },
  {
    id: 3,
    type: "shortlist",
    message: "You shortlisted Priya Sharma",
    time: "1 hour ago",
    icon: Heart,
  },
  {
    id: 4,
    type: "view",
    message: "12 freelancers viewed your project",
    time: "30 minutes ago",
    icon: Eye,
  },
];

// Mock Similar Freelancers
const similarFreelancers = [
  {
    id: 1,
    name: "Rahul Verma",
    avatar: "RV",
    title: "Video Editor",
    rating: 4.8,
    skills: ["Premiere Pro", "After Effects"],
  },
  {
    id: 2,
    name: "Ananya Singh",
    avatar: "AS",
    title: "Motion Designer",
    rating: 4.9,
    skills: ["After Effects", "Cinema 4D"],
  },
  {
    id: 3,
    name: "Karthik M",
    avatar: "KM",
    title: "VFX Artist",
    rating: 4.7,
    skills: ["Nuke", "After Effects"],
  },
];

const ProjectDetails = () => {
  const { id } = useParams();
  const { setSidebarOpen } = useOutletContext<ClientLayoutContext>();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [applicationFilter, setApplicationFilter] = useState("all");
  const [applicationSort, setApplicationSort] = useState("recent");

  // Filter applications
  const filteredApplications = applicationsData.filter((app) => {
    if (applicationFilter === "all") return true;
    if (applicationFilter === "shortlisted")
      return app.status === "shortlisted";
    if (applicationFilter === "new") return app.status === "new";
    return true;
  });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "open":
        return "bg-teal/10 text-teal border-teal/20";
      case "in-progress":
        return "bg-royal-blue/10 text-royal-blue border-royal-blue/20";
      case "completed":
        return "bg-green-100 text-green-600 border-green-200";
      default:
        return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Open for Applications";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 font-sans">
      {/* Header Bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            {/* Breadcrumb */}
            <nav className="hidden sm:flex items-center gap-2 text-sm">
              <Link
                to="/client/dashboard"
                className="text-slate-500 hover:text-teal"
              >
                Dashboard
              </Link>
              <ChevronRight size={14} className="text-slate-400" />
              <Link
                to="/client/projects"
                className="text-slate-500 hover:text-teal"
              >
                My Projects
              </Link>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="text-navy font-medium">{projectData.title}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                  RK
                </div>
                <ChevronDown
                  size={16}
                  className="text-slate-500 hidden sm:block"
                />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-semibold text-navy">Rajesh Kumar</p>
                    <p className="text-sm text-slate-500">rajesh@company.com</p>
                  </div>
                  <Link
                    to="/client/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <User size={16} />
                    My Profile
                  </Link>
                  <Link
                    to="/client/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <hr className="my-2 border-slate-100" />
                  <button className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 lg:p-8 space-y-6">
        {/* PROJECT HEADER CARD */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-semibold border",
                    getStatusStyles(projectData.status),
                  )}
                >
                  {getStatusLabel(projectData.status)}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                  {projectData.category}
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-navy">
                {projectData.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  Posted {projectData.postedAt}
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  {projectData.applications} applications
                </div>
                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  56 views
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                className="border-slate-200 text-slate-600"
              >
                <Share2 size={16} className="mr-2" />
                Share
              </Button>
              <Link to={`/client/project/${id}/edit`}>
                <Button
                  variant="outline"
                  className="border-slate-200 text-slate-600"
                >
                  <Edit2 size={16} className="mr-2" />
                  Edit Project
                </Button>
              </Link>
              {projectData.status === "open" && (
                <Button
                  variant="outline"
                  className="border-red-200 text-red-500 hover:bg-red-50"
                >
                  <XCircle size={16} className="mr-2" />
                  Close Project
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* PROJECT DETAILS GRID */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Project Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
              <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
                <FileText size={24} className="text-teal" />
                About the Project
              </h2>

              <div className="space-y-6 text-slate-600 leading-relaxed">
                <p className="text-lg">
                  Looking for a skilled video editor to create a professional
                  product video for our new e-commerce store. The video should
                  showcase our products in a compelling way with smooth
                  transitions, engaging visuals, and a modern aesthetic.
                </p>

                <div>
                  <h3 className="text-navy font-bold text-base mb-3 flex items-center gap-2">
                    <CheckCircle size={18} className="text-teal" />
                    Key Requirements
                  </h3>
                  <ul className="grid sm:grid-cols-2 gap-3 pl-1">
                    {[
                      "60-90 second video length",
                      "High-quality product shots with dynamic camera",
                      "Lifestyle scenes showing product in use",
                      "Professional color grading",
                      "Royalty-free background music",
                      "Text overlays for key features",
                      "Optimized for social media",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-teal mt-1.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-navy font-bold text-base mb-3 flex items-center gap-2">
                    <Briefcase size={18} className="text-teal" />
                    Deliverables
                  </h3>
                  <ul className="space-y-2 pl-1">
                    {[
                      "Main video in 4K resolution",
                      "Square format version for Instagram",
                      "Vertical format for Stories/Reels",
                      "Source project files",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle
                          size={14}
                          className="text-green-500 flex-shrink-0"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
              <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
                <Award size={24} className="text-teal" />
                Skills Required
              </h2>
              <div className="flex flex-wrap gap-2">
                {projectData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
              <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
                <Download size={24} className="text-teal" />
                Attachments
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {projectData.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="group flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-teal/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center text-teal font-bold flex-shrink-0">
                        {file.type === "pdf"
                          ? "PDF"
                          : file.type === "zip"
                            ? "ZIP"
                            : "MP4"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-navy truncate block pr-2">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500">{file.size}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 group-hover:text-teal hover:bg-teal/10 rounded-full"
                    >
                      <Download size={18} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Log - Moved to Left Column */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
              <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
                <TrendingUp size={24} className="text-teal" />
                Activity Log
              </h2>
              <div className="relative pl-2 space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {activityLog.map((activity) => (
                  <div
                    key={activity.id}
                    className="relative flex gap-4 items-start"
                  >
                    <div className="z-10 w-8 h-8 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <activity.icon size={14} className="text-slate-400" />
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-medium text-navy">
                        {activity.message.replace("You ", "You ")}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Info Card (Sticky) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-navy mb-6 border-b border-slate-100 pb-4">
                Project Details
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <CreditCard size={18} />
                    </div>
                    <span className="text-sm font-medium">Budget</span>
                  </div>
                  <span className="font-bold text-navy text-right">
                    ₹
                    {(
                      (projectData.budget as any).minAmount || 0
                    ).toLocaleString()}{" "}
                    -{" "}
                    {(
                      (projectData.budget as any).maxAmount || 0
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Clock size={18} />
                    </div>
                    <span className="text-sm font-medium">Duration</span>
                  </div>
                  <span className="font-semibold text-navy">
                    {projectData.duration}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <Briefcase size={18} />
                    </div>
                    <span className="text-sm font-medium">Experience</span>
                  </div>
                  <span className="font-semibold text-navy">
                    {projectData.experienceLevel}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                      <MapPin size={18} />
                    </div>
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <span className="font-semibold text-navy">
                    {projectData.location}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                      <Calendar size={18} />
                    </div>
                    <span className="text-sm font-medium">Deadline</span>
                  </div>
                  <span className="font-semibold text-navy">
                    {projectData.deadline}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="p-4 bg-teal/5 rounded-xl border border-teal/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-teal font-semibold uppercase tracking-wider mb-1">
                        Total Applications
                      </p>
                      <p className="text-2xl font-bold text-navy">
                        {projectData.applications}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-teal shadow-sm">
                      <Users size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* APPLICATIONS SECTION */}
        {projectData.status === "open" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                  <Users size={24} className="text-teal" />
                  Applications
                  <span className="px-2.5 py-0.5 bg-teal/10 text-teal rounded-full text-sm">
                    {projectData.applications}
                  </span>
                </h2>
                <div className="flex items-center gap-3">
                  {/* Filter */}
                  <div className="flex bg-slate-100 rounded-lg p-1">
                    {["all", "shortlisted", "new"].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setApplicationFilter(filter)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize",
                          applicationFilter === filter
                            ? "bg-white text-navy shadow-sm"
                            : "text-slate-500 hover:text-navy",
                        )}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                  {/* Sort */}
                  <select
                    value={applicationSort}
                    onChange={(e) => setApplicationSort(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-navy bg-white"
                  >
                    <option value="recent">Recent</option>
                    <option value="rating">Rating</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Applications List */}
            <div className="divide-y divide-slate-100">
              {filteredApplications.map((application) => (
                <div
                  key={application.id}
                  className="p-6 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Freelancer Info */}
                    <div className="flex gap-4 flex-1">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {application.freelancer.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-navy">
                            {application.freelancer.name}
                          </h3>
                          {application.freelancer.verified && (
                            <Verified size={16} className="text-teal" />
                          )}
                          {application.status === "shortlisted" && (
                            <span className="px-2 py-0.5 bg-gold/10 text-gold rounded-full text-xs font-semibold">
                              Shortlisted
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mb-2">
                          {application.freelancer.title}
                        </p>
                        <div className="flex items-center gap-4 text-sm mb-3">
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-gold fill-gold" />
                            <span className="font-medium text-navy">
                              {application.freelancer.rating}
                            </span>
                            <span className="text-slate-400">
                              ({application.freelancer.reviews} reviews)
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <MapPin size={14} />
                            {application.freelancer.location}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {application.coverLetter}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {application.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-teal/10 text-teal rounded-lg text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:text-right lg:min-w-[200px] flex lg:flex-col justify-between lg:justify-start gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Applied</p>
                        <p className="text-xs text-slate-400">
                          {application.appliedAt}
                        </p>
                      </div>
                      <div className="flex lg:flex-col gap-2">
                        <Link to={`/freelancer/${application.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-slate-200"
                          >
                            <Eye size={14} className="mr-1" /> View Profile
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-200"
                        >
                          <MessageSquare size={14} className="mr-1" /> Message
                        </Button>
                        <div className="flex gap-2">
                          {application.status !== "shortlisted" && (
                            <Button
                              size="sm"
                              className="flex-1 bg-gold hover:bg-gold/90 text-white"
                            >
                              <Heart size={14} className="mr-1" /> Shortlist
                            </Button>
                          )}
                          <Button
                            size="sm"
                            className="flex-1 bg-teal hover:bg-teal-light text-white"
                          >
                            <CheckCircle size={14} className="mr-1" /> Hire
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                        >
                          <ThumbsDown size={14} className="mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More */}
            {filteredApplications.length < projectData.applications && (
              <div className="p-4 text-center border-t border-slate-100">
                <Button variant="outline" className="border-slate-200">
                  View All {projectData.applications} Applications
                </Button>
              </div>
            )}
          </div>
        )}

        {/* SIMILAR FREELANCERS SECTION */}
        {projectData.status === "open" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <ThumbsUp size={20} className="text-teal" />
                Recommended Freelancers
              </h2>
              <Link
                to="/client/freelancers"
                className="text-sm text-teal hover:underline"
              >
                Browse All →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarFreelancers.map((freelancer) => (
                <div
                  key={freelancer.id}
                  className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-royal-blue flex items-center justify-center text-white font-bold">
                      {freelancer.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy">
                        {freelancer.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {freelancer.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center mb-3">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-gold fill-gold" />
                      <span className="text-sm font-medium">
                        {freelancer.rating}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {freelancer.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-white text-slate-600 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-200"
                  >
                    Invite to Apply
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectDetails;

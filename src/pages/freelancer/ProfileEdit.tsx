import { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Camera,
  Eye,
  Save,
  X,
  Menu,
  Home,
  FolderOpen,
  Search,
  FileText,
  Mail,
  CreditCard,
  DollarSign,
  Star,
  Settings,
  LogOut,
  Award,
  Plus,
  Trash2,
  Edit3,
  GripVertical,
  Upload,
  Briefcase,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  ChevronRight,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Sidebar Navigation Items for Freelancer
const sidebarNavItems = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/freelancer/dashboard",
    active: false,
  },
  {
    icon: User,
    label: "My Profile",
    href: "/freelancer/profile",
    active: true,
  },
  {
    icon: FolderOpen,
    label: "Portfolio",
    href: "/freelancer/portfolio",
    badge: null,
  },
  { icon: Search, label: "Browse Projects", href: "/projects", badge: null },
  {
    icon: FileText,
    label: "My Applications",
    href: "/freelancer/applications",
    badge: "3",
  },
  { icon: Mail, label: "Messages", href: "/freelancer/messages", badge: "5" },
  {
    icon: CreditCard,
    label: "Subscription",
    href: "/freelancer/subscription",
    badge: null,
  },
  {
    icon: DollarSign,
    label: "Earnings",
    href: "/freelancer/earnings",
    badge: null,
  },
  { icon: Star, label: "Reviews", href: "/freelancer/reviews", badge: null },
  {
    icon: Settings,
    label: "Settings",
    href: "/freelancer/settings",
    badge: null,
  },
];

// Tab definitions
const tabs = [
  { id: "basic", label: "Basic Info", icon: User },
  { id: "skills", label: "Skills", icon: Star },
  { id: "portfolio", label: "Portfolio", icon: FolderOpen },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
];

// Mock data
const categories = [
  "Video Editing",
  "Motion Graphics",
  "3D Animation",
  "VFX",
  "Color Grading",
  "Audio Editing",
  "Graphic Design",
];

const availabilityOptions = [
  { value: "full-time", label: "Full-time available" },
  { value: "part-time", label: "Part-time available" },
  { value: "not-available", label: "Not available" },
];

const languages = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Bengali",
  "Gujarati",
];

const suggestedSkills = [
  "Adobe Premiere Pro",
  "After Effects",
  "DaVinci Resolve",
  "Final Cut Pro",
  "Cinema 4D",
  "Blender",
  "Photoshop",
  "Illustrator",
];

// Initial form data
const initialFormData = {
  displayName: "Arun Kumar",
  headline: "Professional Video Editor & Motion Graphics Artist",
  bio: "Passionate video editor with 5+ years of experience in creating compelling visual stories. Specialized in corporate videos, social media content, and motion graphics.",
  hourlyRate: 1200,
  availability: "full-time",
  category: "Video Editing",
  city: "Bangalore",
  state: "Karnataka",
  languages: ["English", "Hindi", "Kannada"],
};

const initialSkills = [
  { name: "Adobe Premiere Pro", proficiency: 5 },
  { name: "After Effects", proficiency: 4 },
  { name: "DaVinci Resolve", proficiency: 4 },
  { name: "Photoshop", proficiency: 3 },
];

const initialPortfolio = [
  {
    id: 1,
    title: "E-commerce Product Video",
    description: "Product showcase video for online store",
    url: "https://vimeo.com/example1",
    thumbnail: null,
    skills: ["Premiere Pro", "After Effects"],
  },
  {
    id: 2,
    title: "Corporate Brand Film",
    description: "Company introduction video",
    url: "https://youtube.com/example2",
    thumbnail: null,
    skills: ["Premiere Pro", "Color Grading"],
  },
];

const initialExperience = [
  {
    id: 1,
    company: "Creative Studios",
    title: "Senior Video Editor",
    startDate: "Jan 2022",
    endDate: "Present",
    description: "Lead editor for commercial and corporate projects",
  },
  {
    id: 2,
    company: "Media House Productions",
    title: "Video Editor",
    startDate: "Mar 2019",
    endDate: "Dec 2021",
    description: "Edited promotional videos and social media content",
  },
];

const initialEducation = [
  {
    id: 1,
    institution: "Film and Television Institute",
    degree: "Diploma",
    field: "Film Editing",
    year: "2019",
  },
  {
    id: 2,
    institution: "Delhi University",
    degree: "Bachelor's",
    field: "Mass Communication",
    year: "2018",
  },
];

const profileCompletionItems = [
  { label: "Profile photo", completed: true },
  { label: "Professional headline", completed: true },
  { label: "Bio description", completed: true },
  { label: "Skills added", completed: true },
  { label: "Portfolio items", completed: true },
  { label: "Work experience", completed: true },
  { label: "Hourly rate set", completed: true },
  { label: "Phone verified", completed: false },
  { label: "ID verified", completed: false },
];

const FreelancerProfileEdit = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState(initialFormData);
  const [skills, setSkills] = useState(initialSkills);
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [experience, setExperience] = useState(initialExperience);
  const [education, setEducation] = useState(initialEducation);
  const [newSkill, setNewSkill] = useState("");
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const subscriptionPlan = "Free";
  const profileCompletion = Math.round(
    (profileCompletionItems.filter((item) => item.completed).length /
      profileCompletionItems.length) *
      100,
  );

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = (skillName: string) => {
    if (skillName && !skills.find((s) => s.name === skillName)) {
      setSkills((prev) => [...prev, { name: skillName, proficiency: 3 }]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillName: string) => {
    setSkills((prev) => prev.filter((s) => s.name !== skillName));
  };

  const updateSkillProficiency = (skillName: string, proficiency: number) => {
    setSkills((prev) =>
      prev.map((s) => (s.name === skillName ? { ...s, proficiency } : s)),
    );
  };

  const deletePortfolioItem = (id: number) => {
    setPortfolio((prev) => prev.filter((item) => item.id !== id));
  };

  const deleteExperienceItem = (id: number) => {
    setExperience((prev) => prev.filter((item) => item.id !== id));
  };

  const deleteEducationItem = (id: number) => {
    setEducation((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-navy transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight">
                ConnectMe
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase -mt-1 text-teal-light">
                India
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  item.active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon size={20} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-teal text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Subscription Badge */}
          <div className="px-4 pb-2">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg",
                subscriptionPlan === "Free" ? "bg-slate-500/20" : "bg-gold/20",
              )}
            >
              <Award
                size={16}
                className={
                  subscriptionPlan === "Free" ? "text-slate-400" : "text-gold"
                }
              />
              <span
                className={cn(
                  "text-xs font-semibold",
                  subscriptionPlan === "Free" ? "text-slate-400" : "text-gold",
                )}
              >
                {subscriptionPlan} Plan
              </span>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                AK
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  Arun Kumar
                </p>
                <p className="text-xs text-white/50">Freelancer</p>
              </div>
              <button className="text-white/50 hover:text-white transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* SIDEBAR OVERLAY (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="lg:ml-64">
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
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-navy">
                  Edit Profile
                </h1>
                <p className="text-sm text-slate-500 hidden sm:block">
                  Update your professional information
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/freelancer/profile">
                <Button
                  variant="outline"
                  className="border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <Eye size={16} className="mr-2" />
                  Preview Profile
                </Button>
              </Link>
              <Button className="bg-teal hover:bg-teal-light text-white">
                <Save size={16} className="mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* LEFT - Main Form */}
            <div className="flex-1 space-y-6">
              {/* PROFILE PREVIEW CARD */}
              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Cover Image */}
                <div className="relative h-32 lg:h-40 bg-gradient-to-r from-navy via-royal-blue to-teal">
                  <button className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-white/90 hover:bg-white rounded-lg text-sm font-medium text-navy transition-colors">
                    <Camera size={14} />
                    Change Cover
                  </button>
                </div>

                {/* Profile Photo */}
                <div className="relative px-6 pb-6">
                  <div className="relative -mt-12 lg:-mt-16 w-24 h-24 lg:w-32 lg:h-32">
                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-3xl lg:text-4xl border-4 border-white shadow-lg">
                      AK
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-teal hover:bg-teal-light rounded-full flex items-center justify-center text-white shadow-lg transition-colors">
                      <Camera size={14} />
                    </button>
                  </div>

                  {/* Verification Status */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success-green/10 text-success-green rounded-full text-sm font-medium">
                      <CheckCircle size={14} />
                      Email Verified
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 text-gold rounded-full text-sm font-medium">
                      <AlertCircle size={14} />
                      Phone Pending
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-sm font-medium">
                      <AlertCircle size={14} />
                      ID Not Verified
                    </span>
                  </div>
                </div>
              </section>

              {/* TABS */}
              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Tab Navigation */}
                <div className="flex overflow-x-auto border-b border-slate-100">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                        activeTab === tab.id
                          ? "border-teal text-teal"
                          : "border-transparent text-slate-500 hover:text-navy",
                      )}
                    >
                      <tab.icon size={16} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-5 lg:p-6">
                  {/* BASIC INFO TAB */}
                  {activeTab === "basic" && (
                    <div className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-5">
                        {/* Display Name */}
                        <div>
                          <label className="block text-sm font-medium text-navy mb-2">
                            Display Name *
                          </label>
                          <input
                            type="text"
                            value={formData.displayName}
                            onChange={(e) =>
                              handleInputChange("displayName", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                            placeholder="Your name"
                          />
                        </div>

                        {/* Hourly Rate */}
                        <div>
                          <label className="block text-sm font-medium text-navy mb-2">
                            Hourly Rate (INR) *
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              ₹
                            </span>
                            <input
                              type="number"
                              value={formData.hourlyRate}
                              onChange={(e) =>
                                handleInputChange("hourlyRate", e.target.value)
                              }
                              className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                              placeholder="1000"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Professional Headline */}
                      <div>
                        <label className="block text-sm font-medium text-navy mb-2">
                          Professional Headline *
                        </label>
                        <input
                          type="text"
                          value={formData.headline}
                          onChange={(e) =>
                            handleInputChange("headline", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                          placeholder="e.g., Professional Video Editor & Motion Graphics Artist"
                        />
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="block text-sm font-medium text-navy mb-2">
                          Bio/About
                        </label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) =>
                            handleInputChange("bio", e.target.value)
                          }
                          rows={4}
                          maxLength={500}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy resize-none"
                          placeholder="Tell clients about yourself..."
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          {formData.bio.length}/500 characters
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        {/* Availability */}
                        <div>
                          <label className="block text-sm font-medium text-navy mb-2">
                            Availability
                          </label>
                          <select
                            value={formData.availability}
                            onChange={(e) =>
                              handleInputChange("availability", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy bg-white"
                          >
                            {availabilityOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-sm font-medium text-navy mb-2">
                            Category
                          </label>
                          <select
                            value={formData.category}
                            onChange={(e) =>
                              handleInputChange("category", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy bg-white"
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        {/* City */}
                        <div>
                          <label className="block text-sm font-medium text-navy mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) =>
                              handleInputChange("city", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                            placeholder="Your city"
                          />
                        </div>

                        {/* State */}
                        <div>
                          <label className="block text-sm font-medium text-navy mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            value={formData.state}
                            onChange={(e) =>
                              handleInputChange("state", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                            placeholder="Your state"
                          />
                        </div>
                      </div>

                      {/* Languages */}
                      <div>
                        <label className="block text-sm font-medium text-navy mb-2">
                          Languages
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {languages.map((lang) => (
                            <button
                              key={lang}
                              onClick={() => {
                                const newLangs = formData.languages.includes(
                                  lang,
                                )
                                  ? formData.languages.filter((l) => l !== lang)
                                  : [...formData.languages, lang];
                                handleInputChange("languages", newLangs);
                              }}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                formData.languages.includes(lang)
                                  ? "bg-teal text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                              )}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SKILLS TAB */}
                  {activeTab === "skills" && (
                    <div className="space-y-6">
                      {/* Search and Add */}
                      <div>
                        <label className="block text-sm font-medium text-navy mb-2">
                          Add Skills
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" && addSkill(newSkill)
                            }
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                            placeholder="Type a skill and press Enter"
                          />
                          <Button
                            onClick={() => addSkill(newSkill)}
                            className="bg-teal hover:bg-teal-light text-white px-6"
                          >
                            <Plus size={16} className="mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>

                      {/* Skills Limit */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          Skills added: {skills.length}/15
                        </span>
                        <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal rounded-full transition-all"
                            style={{ width: `${(skills.length / 15) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Selected Skills */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-navy">
                          Your Skills
                        </h4>
                        {skills.map((skill) => (
                          <div
                            key={skill.name}
                            className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl"
                          >
                            <GripVertical
                              size={16}
                              className="text-slate-400 cursor-grab"
                            />
                            <span className="flex-1 font-medium text-navy">
                              {skill.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 w-16">
                                Level {skill.proficiency}
                              </span>
                              <input
                                type="range"
                                min="1"
                                max="5"
                                value={skill.proficiency}
                                onChange={(e) =>
                                  updateSkillProficiency(
                                    skill.name,
                                    parseInt(e.target.value),
                                  )
                                }
                                className="w-24 accent-teal"
                              />
                            </div>
                            <button
                              onClick={() => removeSkill(skill.name)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Suggested Skills */}
                      <div>
                        <h4 className="text-sm font-medium text-navy mb-3">
                          Suggested Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {suggestedSkills
                            .filter((s) => !skills.find((sk) => sk.name === s))
                            .map((skill) => (
                              <button
                                key={skill}
                                onClick={() => addSkill(skill)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-royal-blue/5 text-royal-blue rounded-lg text-sm font-medium hover:bg-royal-blue/10 transition-colors"
                              >
                                <Plus size={14} />
                                {skill}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PORTFOLIO TAB */}
                  {activeTab === "portfolio" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-navy">
                          Portfolio Items ({portfolio.length})
                        </h4>
                        <Button
                          onClick={() => {
                            setEditingItem(null);
                            setShowPortfolioModal(true);
                          }}
                          className="bg-teal hover:bg-teal-light text-white"
                        >
                          <Plus size={16} className="mr-2" />
                          Add New Project
                        </Button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {portfolio.map((item) => (
                          <div
                            key={item.id}
                            className="group relative rounded-xl border border-slate-200 overflow-hidden hover:border-teal/30 hover:shadow-md transition-all"
                          >
                            {/* Thumbnail */}
                            <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                              <Image size={40} className="text-slate-300" />
                            </div>

                            {/* Content */}
                            <div className="p-4">
                              <h5 className="font-semibold text-navy mb-1">
                                {item.title}
                              </h5>
                              <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                                {item.description}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {item.skills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Actions Overlay */}
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setShowPortfolioModal(true);
                                }}
                                className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 transition-colors"
                              >
                                <Edit3 size={14} className="text-slate-600" />
                              </button>
                              <button
                                onClick={() => deletePortfolioItem(item.id)}
                                className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={14} className="text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EXPERIENCE TAB */}
                  {activeTab === "experience" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-navy">
                          Work Experience
                        </h4>
                        <Button
                          onClick={() => {
                            setEditingItem(null);
                            setShowExperienceModal(true);
                          }}
                          className="bg-teal hover:bg-teal-light text-white"
                        >
                          <Plus size={16} className="mr-2" />
                          Add Experience
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {experience.map((item) => (
                          <div
                            key={item.id}
                            className="relative pl-6 pb-6 border-l-2 border-slate-200 last:pb-0"
                          >
                            {/* Timeline dot */}
                            <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-teal border-2 border-white" />

                            <div className="bg-slate-50 rounded-xl p-4 ml-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h5 className="font-semibold text-navy">
                                    {item.title}
                                  </h5>
                                  <p className="text-sm text-slate-600">
                                    {item.company}
                                  </p>
                                </div>
                                <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded">
                                  {item.startDate} - {item.endDate}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 mb-3">
                                {item.description}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingItem(item);
                                    setShowExperienceModal(true);
                                  }}
                                  className="text-xs text-royal-blue hover:underline"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteExperienceItem(item.id)}
                                  className="text-xs text-red-500 hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EDUCATION TAB */}
                  {activeTab === "education" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-navy">
                          Education
                        </h4>
                        <Button
                          onClick={() => {
                            setEditingItem(null);
                            setShowEducationModal(true);
                          }}
                          className="bg-teal hover:bg-teal-light text-white"
                        >
                          <Plus size={16} className="mr-2" />
                          Add Education
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {education.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl"
                          >
                            <div className="w-12 h-12 rounded-xl bg-royal-blue/10 flex items-center justify-center shrink-0">
                              <GraduationCap
                                size={24}
                                className="text-royal-blue"
                              />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-navy">
                                {item.degree} in {item.field}
                              </h5>
                              <p className="text-sm text-slate-600">
                                {item.institution}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {item.year}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setShowEducationModal(true);
                                }}
                                className="p-2 text-slate-400 hover:text-royal-blue hover:bg-royal-blue/10 rounded-lg transition-colors"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => deleteEducationItem(item.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="lg:w-80 space-y-6">
              {/* Profile Completeness */}
              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="text-lg font-bold text-navy mb-4">
                  Profile Completeness
                </h3>

                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto">
                    <svg
                      className="w-full h-full -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${profileCompletion * 2.83} 283`}
                      />
                      <defs>
                        <linearGradient
                          id="gradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#0D9488" />
                          <stop offset="100%" stopColor="#14B8A6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-navy">
                        {profileCompletion}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {profileCompletionItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {item.completed ? (
                        <CheckCircle size={16} className="text-success-green" />
                      ) : (
                        <AlertCircle size={16} className="text-gold" />
                      )}
                      <span
                        className={
                          item.completed
                            ? "text-slate-500"
                            : "text-navy font-medium"
                        }
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Profile Tips */}
              <section className="bg-gradient-to-br from-royal-blue/5 to-teal/5 rounded-2xl border border-royal-blue/10 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={18} className="text-gold" />
                  <h3 className="font-bold text-navy">Profile Tips</h3>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <ChevronRight
                      size={16}
                      className="text-teal shrink-0 mt-0.5"
                    />
                    Add a professional profile photo to increase trust
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <ChevronRight
                      size={16}
                      className="text-teal shrink-0 mt-0.5"
                    />
                    Complete ID verification to get a verified badge
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <ChevronRight
                      size={16}
                      className="text-teal shrink-0 mt-0.5"
                    />
                    Add more portfolio items to showcase your work
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <ChevronRight
                      size={16}
                      className="text-teal shrink-0 mt-0.5"
                    />
                    Write a compelling bio that highlights your expertise
                  </li>
                </ul>
              </section>

              {/* Preview Link */}
              <Link to="/freelancer/profile">
                <Button
                  variant="outline"
                  className="w-full border-teal text-teal hover:bg-teal hover:text-white"
                >
                  <Eye size={16} className="mr-2" />
                  Preview Public Profile
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* PORTFOLIO MODAL */}
      {showPortfolioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy">
                {editingItem ? "Edit Portfolio Item" : "Add Portfolio Item"}
              </h3>
              <button
                onClick={() => setShowPortfolioModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                  placeholder="Enter project title"
                  defaultValue={editingItem?.title || ""}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy resize-none"
                  rows={3}
                  placeholder="Describe your project"
                  defaultValue={editingItem?.description || ""}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Project URL
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                  placeholder="https://..."
                  defaultValue={editingItem?.url || ""}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Thumbnail
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-teal/50 transition-colors cursor-pointer">
                  <Upload size={32} className="mx-auto mb-2 text-slate-400" />
                  <p className="text-sm text-slate-500">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Skills Used
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                  placeholder="e.g., Premiere Pro, After Effects"
                  defaultValue={editingItem?.skills?.join(", ") || ""}
                />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-slate-100">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPortfolioModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-teal hover:bg-teal-light text-white"
                onClick={() => setShowPortfolioModal(false)}
              >
                {editingItem ? "Save Changes" : "Add Project"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EXPERIENCE MODAL */}
      {showExperienceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy">
                {editingItem ? "Edit Experience" : "Add Experience"}
              </h3>
              <button
                onClick={() => setShowExperienceModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                  placeholder="e.g., Senior Video Editor"
                  defaultValue={editingItem?.title || ""}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                  placeholder="Company name"
                  defaultValue={editingItem?.company || ""}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Start Date
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                    placeholder="e.g., Jan 2022"
                    defaultValue={editingItem?.startDate || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    End Date
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                    placeholder="Present"
                    defaultValue={editingItem?.endDate || ""}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy resize-none"
                  rows={3}
                  placeholder="Describe your role and achievements"
                  defaultValue={editingItem?.description || ""}
                />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-slate-100">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowExperienceModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-teal hover:bg-teal-light text-white"
                onClick={() => setShowExperienceModal(false)}
              >
                {editingItem ? "Save Changes" : "Add Experience"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EDUCATION MODAL */}
      {showEducationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy">
                {editingItem ? "Edit Education" : "Add Education"}
              </h3>
              <button
                onClick={() => setShowEducationModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Institution *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                  placeholder="University/College name"
                  defaultValue={editingItem?.institution || ""}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Degree *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                  placeholder="e.g., Bachelor's, Master's, Diploma"
                  defaultValue={editingItem?.degree || ""}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Field of Study
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                  placeholder="e.g., Film Production, Computer Science"
                  defaultValue={editingItem?.field || ""}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Year of Completion
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                  placeholder="e.g., 2020"
                  defaultValue={editingItem?.year || ""}
                />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-slate-100">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEducationModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-teal hover:bg-teal-light text-white"
                onClick={() => setShowEducationModal(false)}
              >
                {editingItem ? "Save Changes" : "Add Education"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerProfileEdit;

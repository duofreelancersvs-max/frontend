import { useState, useEffect, useRef } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  User,
  Camera,
  Eye,
  Save,
  X,
  Menu,
  FolderOpen,
  Star,
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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import { freelancerService } from "@/services/freelancer.service";
import type {
  FreelancerProfile,
  SkillRef,
  PortfolioItem,
  WorkExperience,
  Education,
} from "@/services/freelancer.service";
import { useAuth } from "@/hooks/useAuth";

// Tab definitions
const tabs = [
  { id: "basic", label: "Basic Info", icon: User },
  { id: "skills", label: "Skills", icon: Star },
  { id: "portfolio", label: "Portfolio", icon: FolderOpen },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
];

const categoryOptions = [
  "Editing",
  "VFX",
  "3D Design",
  "Motion Graphics",
  "Color Grading",
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Content Writing",
  "Digital Marketing",
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

const FreelancerProfileEdit = () => {
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Profile data state
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    headline: "",
    bio: "",
    hourlyRate: 0,
    availability: "full-time",
    category: "Editing",
  });
  const [skills, setSkills] = useState<SkillRef[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [experience, setExperience] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Modal form refs
  const portfolioTitleRef = useRef<HTMLInputElement>(null);
  const portfolioDescRef = useRef<HTMLTextAreaElement>(null);
  const portfolioUrlRef = useRef<HTMLInputElement>(null);
  const portfolioSkillsRef = useRef<HTMLInputElement>(null);
  const expTitleRef = useRef<HTMLInputElement>(null);
  const expCompanyRef = useRef<HTMLInputElement>(null);
  const expStartRef = useRef<HTMLInputElement>(null);
  const expEndRef = useRef<HTMLInputElement>(null);
  const expDescRef = useRef<HTMLTextAreaElement>(null);
  const eduInstRef = useRef<HTMLInputElement>(null);
  const eduDegreeRef = useRef<HTMLInputElement>(null);
  const eduFieldRef = useRef<HTMLInputElement>(null);
  const eduYearRef = useRef<HTMLInputElement>(null);

  // ---------- FETCH PROFILE ----------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await freelancerService.ensureProfile();
        applyProfileToState(data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const applyProfileToState = (data: FreelancerProfile) => {
    setProfile(data);
    setFormData({
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      displayName: data.displayName || "",
      headline: data.headline || "",
      bio: data.bio || "",
      hourlyRate: data.hourlyRate || 0,
      availability: data.availability || "full-time",
      category: data.category || "Editing",
    });
    setSkills(data.skills || []);
    setPortfolio(data.portfolio || []);
    setExperience(data.workExperience || []);
    setEducation(data.education || []);
  };

  // ---------- PROFILE COMPLETENESS ----------
  const profileCompletionItems = [
    { label: "Profile photo", completed: !!profile?.profilePicture },
    { label: "Professional headline", completed: !!formData.headline },
    { label: "Bio description", completed: !!formData.bio },
    { label: "Skills added", completed: skills.length > 0 },
    { label: "Portfolio items", completed: portfolio.length > 0 },
    { label: "Work experience", completed: experience.length > 0 },
    { label: "Hourly rate set", completed: formData.hourlyRate > 0 },
    {
      label: "Phone verified",
      completed: user?.isPhoneVerified || false,
    },
    { label: "ID verified", completed: profile?.isVerified || false },
  ];

  const profileCompletion = Math.round(
    (profileCompletionItems.filter((item) => item.completed).length /
      profileCompletionItems.length) *
      100,
  );

  // ---------- BASIC INFO HANDLERS ----------
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    console.log(
      "[ProfileEdit] Save Changes clicked, sending to backend...",
      formData,
    );
    try {
      setSaving(true);
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.displayName,
        headline: formData.headline,
        bio: formData.bio,
        hourlyRate: Number(formData.hourlyRate),
        availability: formData.availability,
        category: formData.category,
        skills: skills.map((s) => ({
          ...s,
          skillId:
            s.skillId ||
            [...Array(24)]
              .map(() => Math.floor(Math.random() * 16).toString(16))
              .join(""),
        })),
      };
      console.log("[ProfileEdit] Payload:", payload);
      const data = await freelancerService.updateProfile(payload as any);
      console.log("[ProfileEdit] Save success:", data);
      applyProfileToState(data);
      toast.success("Profile saved successfully!");
    } catch (err: any) {
      console.error("[ProfileEdit] Failed to save profile:", err);
      const msg =
        err?.data?.error?.message || err?.message || "Failed to save profile";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ---------- SKILLS HANDLERS ----------
  const addSkill = (skillName: string) => {
    if (skillName && !skills.find((s) => s.name === skillName)) {
      // Generate a dummy valid 24-character hex ObjectId for the backend schema
      const dummyId = [...Array(24)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("");
      setSkills((prev) => [
        ...prev,
        { skillId: dummyId, name: skillName, proficiency: 3 },
      ]);
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

  // ---------- PORTFOLIO HANDLERS ----------
  const handleAddPortfolio = async () => {
    const title = portfolioTitleRef.current?.value?.trim();
    if (!title) {
      toast.error("Project title is required");
      return;
    }
    try {
      setActionLoading("portfolio-add");
      const data = await freelancerService.addPortfolio({
        title,
        description: portfolioDescRef.current?.value?.trim() || undefined,
        projectUrl: portfolioUrlRef.current?.value?.trim() || undefined,
        skills: portfolioSkillsRef.current?.value
          ? portfolioSkillsRef.current.value.split(",").map((s) => s.trim())
          : [],
      });
      applyProfileToState(data);
      setShowPortfolioModal(false);
      toast.success("Portfolio item added!");
    } catch (err) {
      console.error("Failed to add portfolio:", err);
      toast.error("Failed to add portfolio item");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePortfolio = async (itemId: string) => {
    try {
      setActionLoading(`portfolio-del-${itemId}`);
      const data = await freelancerService.removePortfolio(itemId);
      applyProfileToState(data);
      toast.success("Portfolio item removed");
    } catch (err) {
      console.error("Failed to remove portfolio:", err);
      toast.error("Failed to remove portfolio item");
    } finally {
      setActionLoading(null);
    }
  };

  // ---------- EXPERIENCE HANDLERS ----------
  const handleAddExperience = async () => {
    const title = expTitleRef.current?.value?.trim();
    const company = expCompanyRef.current?.value?.trim();
    if (!title || !company) {
      toast.error("Job title and company are required");
      return;
    }
    const startDateVal = expStartRef.current?.value?.trim();
    try {
      setActionLoading("experience-add");
      const data = await freelancerService.addExperience({
        title,
        company,
        startDate: startDateVal || new Date().toISOString(),
        endDate: expEndRef.current?.value?.trim() || undefined,
        description: expDescRef.current?.value?.trim() || undefined,
      });
      applyProfileToState(data);
      setShowExperienceModal(false);
      toast.success("Experience added!");
    } catch (err) {
      console.error("Failed to add experience:", err);
      toast.error("Failed to add experience");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteExperience = async (itemId: string) => {
    try {
      setActionLoading(`experience-del-${itemId}`);
      const data = await freelancerService.removeExperience(itemId);
      applyProfileToState(data);
      toast.success("Experience removed");
    } catch (err) {
      console.error("Failed to remove experience:", err);
      toast.error("Failed to remove experience");
    } finally {
      setActionLoading(null);
    }
  };

  // ---------- EDUCATION HANDLERS ----------
  const handleAddEducation = async () => {
    const institution = eduInstRef.current?.value?.trim();
    if (!institution) {
      toast.error("Institution name is required");
      return;
    }
    try {
      setActionLoading("education-add");
      const data = await freelancerService.addEducation({
        institution,
        degree: eduDegreeRef.current?.value?.trim() || undefined,
        fieldOfStudy: eduFieldRef.current?.value?.trim() || undefined,
        year: eduYearRef.current?.value
          ? parseInt(eduYearRef.current.value)
          : undefined,
      });
      applyProfileToState(data);
      setShowEducationModal(false);
      toast.success("Education added!");
    } catch (err) {
      console.error("Failed to add education:", err);
      toast.error("Failed to add education");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteEducation = async (itemId: string) => {
    try {
      setActionLoading(`education-del-${itemId}`);
      const data = await freelancerService.removeEducation(itemId);
      applyProfileToState(data);
      toast.success("Education removed");
    } catch (err) {
      console.error("Failed to remove education:", err);
      toast.error("Failed to remove education");
    } finally {
      setActionLoading(null);
    }
  };

  // ---------- LOADING STATE ----------
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-teal" />
          <p className="text-slate-500 text-sm">Loading your profile…</p>
        </div>
      </div>
    );
  }

  const initials =
    `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase() ||
    "?";

  return (
    <div className="w-full bg-slate-50">
      <div className="w-full">
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
              <Button
                className="bg-teal hover:bg-teal-light text-white"
                onClick={handleSaveChanges}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                {saving ? "Saving…" : "Save Changes"}
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
                    {profile?.profilePicture ? (
                      <img
                        src={profile.profilePicture}
                        alt="Profile"
                        className="w-full h-full rounded-2xl object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-full h-full rounded-2xl bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-3xl lg:text-4xl border-4 border-white shadow-lg">
                        {initials}
                      </div>
                    )}
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
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                        user?.isPhoneVerified
                          ? "bg-success-green/10 text-success-green"
                          : "bg-gold/10 text-gold",
                      )}
                    >
                      {user?.isPhoneVerified ? (
                        <CheckCircle size={14} />
                      ) : (
                        <AlertCircle size={14} />
                      )}
                      {user?.isPhoneVerified
                        ? "Phone Verified"
                        : "Phone Pending"}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                        profile?.isVerified
                          ? "bg-success-green/10 text-success-green"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {profile?.isVerified ? (
                        <CheckCircle size={14} />
                      ) : (
                        <AlertCircle size={14} />
                      )}
                      {profile?.isVerified ? "ID Verified" : "ID Not Verified"}
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
                        {/* First Name */}
                        <div>
                          <label className="block text-sm font-medium text-navy mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) =>
                              handleInputChange("firstName", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                            placeholder="First name"
                          />
                        </div>

                        {/* Last Name */}
                        <div>
                          <label className="block text-sm font-medium text-navy mb-2">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                            placeholder="Last name"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        {/* Display Name */}
                        <div>
                          <label className="block text-sm font-medium text-navy mb-2">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={formData.displayName}
                            onChange={(e) =>
                              handleInputChange("displayName", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                            placeholder="Public display name"
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
                                handleInputChange(
                                  "hourlyRate",
                                  Number(e.target.value),
                                )
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
                          maxLength={2000}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy resize-none"
                          placeholder="Tell clients about yourself..."
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          {formData.bio.length}/2000 characters
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
                            {categoryOptions.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
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
                            style={{
                              width: `${(skills.length / 15) * 100}%`,
                            }}
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
                        {skills.length === 0 && (
                          <p className="text-sm text-slate-400 py-4 text-center">
                            No skills added yet. Add skills from the suggestions
                            below or type your own.
                          </p>
                        )}
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

                      <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
                        <p className="text-sm text-gold">
                          💡 Remember to click <strong>Save Changes</strong>{" "}
                          after updating your skills.
                        </p>
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
                            key={item._id}
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
                                {(item.skills || []).map((skill) => (
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
                                onClick={() =>
                                  item._id && handleDeletePortfolio(item._id)
                                }
                                disabled={
                                  actionLoading === `portfolio-del-${item._id}`
                                }
                                className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 transition-colors"
                              >
                                {actionLoading ===
                                `portfolio-del-${item._id}` ? (
                                  <Loader2
                                    size={14}
                                    className="animate-spin text-red-500"
                                  />
                                ) : (
                                  <Trash2 size={14} className="text-red-500" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {portfolio.length === 0 && (
                        <div className="text-center py-12">
                          <Image
                            size={40}
                            className="mx-auto text-slate-300 mb-3"
                          />
                          <p className="text-sm text-slate-500">
                            No portfolio items yet. Add your best work!
                          </p>
                        </div>
                      )}
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
                            key={item._id}
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
                                  {item.startDate
                                    ? new Date(
                                        item.startDate,
                                      ).toLocaleDateString("en-IN", {
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "N/A"}{" "}
                                  -{" "}
                                  {item.endDate
                                    ? new Date(item.endDate).toLocaleDateString(
                                        "en-IN",
                                        {
                                          month: "short",
                                          year: "numeric",
                                        },
                                      )
                                    : "Present"}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-sm text-slate-500 mb-3">
                                  {item.description}
                                </p>
                              )}
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    item._id && handleDeleteExperience(item._id)
                                  }
                                  disabled={
                                    actionLoading ===
                                    `experience-del-${item._id}`
                                  }
                                  className="text-xs text-red-500 hover:underline flex items-center gap-1"
                                >
                                  {actionLoading ===
                                  `experience-del-${item._id}` ? (
                                    <Loader2
                                      size={12}
                                      className="animate-spin"
                                    />
                                  ) : null}
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {experience.length === 0 && (
                        <div className="text-center py-12">
                          <Briefcase
                            size={40}
                            className="mx-auto text-slate-300 mb-3"
                          />
                          <p className="text-sm text-slate-500">
                            No experience entries yet.
                          </p>
                        </div>
                      )}
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
                            key={item._id}
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
                                {item.degree && item.fieldOfStudy
                                  ? `${item.degree} in ${item.fieldOfStudy}`
                                  : item.degree ||
                                    item.fieldOfStudy ||
                                    "Education"}
                              </h5>
                              <p className="text-sm text-slate-600">
                                {item.institution}
                              </p>
                              {item.year && (
                                <p className="text-xs text-slate-500 mt-1">
                                  {item.year}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  item._id && handleDeleteEducation(item._id)
                                }
                                disabled={
                                  actionLoading === `education-del-${item._id}`
                                }
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                {actionLoading ===
                                `education-del-${item._id}` ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {education.length === 0 && (
                        <div className="text-center py-12">
                          <GraduationCap
                            size={40}
                            className="mx-auto text-slate-300 mb-3"
                          />
                          <p className="text-sm text-slate-500">
                            No education entries yet.
                          </p>
                        </div>
                      )}
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
                Add Portfolio Item
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
                  ref={portfolioTitleRef}
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                  placeholder="Enter project title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Description
                </label>
                <textarea
                  ref={portfolioDescRef}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy resize-none"
                  rows={3}
                  placeholder="Describe your project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Project URL
                </label>
                <input
                  ref={portfolioUrlRef}
                  type="url"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Skills Used
                </label>
                <input
                  ref={portfolioSkillsRef}
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                  placeholder="e.g., Premiere Pro, After Effects"
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
                onClick={handleAddPortfolio}
                disabled={actionLoading === "portfolio-add"}
              >
                {actionLoading === "portfolio-add" ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : null}
                Add Project
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
              <h3 className="text-lg font-bold text-navy">Add Experience</h3>
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
                  ref={expTitleRef}
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                  placeholder="e.g., Senior Video Editor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Company Name *
                </label>
                <input
                  ref={expCompanyRef}
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                  placeholder="Company name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Start Date
                  </label>
                  <input
                    ref={expStartRef}
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    End Date
                  </label>
                  <input
                    ref={expEndRef}
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                    placeholder="Leave empty for Present"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Description
                </label>
                <textarea
                  ref={expDescRef}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy resize-none"
                  rows={3}
                  placeholder="Describe your role and achievements"
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
                onClick={handleAddExperience}
                disabled={actionLoading === "experience-add"}
              >
                {actionLoading === "experience-add" ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : null}
                Add Experience
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
              <h3 className="text-lg font-bold text-navy">Add Education</h3>
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
                  ref={eduInstRef}
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                  placeholder="University/College name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Degree
                </label>
                <input
                  ref={eduDegreeRef}
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                  placeholder="e.g., Bachelor's, Master's, Diploma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Field of Study
                </label>
                <input
                  ref={eduFieldRef}
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                  placeholder="e.g., Film Production, Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Year of Completion
                </label>
                <input
                  ref={eduYearRef}
                  type="number"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
                  placeholder="e.g., 2020"
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
                onClick={handleAddEducation}
                disabled={actionLoading === "education-add"}
              >
                {actionLoading === "education-add" ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : null}
                Add Education
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerProfileEdit;

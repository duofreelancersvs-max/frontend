import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import {
  User,
  Camera,
  Eye,
  Save,
  X,
  FolderOpen,
  Star,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  Briefcase,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import { freelancerService } from "@/services/freelancer.service";
import { useMyFreelancerProfile } from "@/hooks/queries/useFreelancerDashboardQueries";
import DashboardHeader from "@/components/layouts/DashboardHeader";
import type {
  FreelancerProfile,
  SkillRef,
  PortfolioItem,
  WorkExperience,
  Education,
} from "@/services/freelancer.service";
import { useAuth } from "@/hooks/useAuth";
import { getCategoryStyle } from "@/lib/category-styles";
import { AddPortfolioModal } from "@/components/modals/AddPortfolioModal";

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
  "Admin & support",
  "Design & creative",
  "Marketing",
  "Writing & content",
  "AI & emerging tech",
  "Development & tech",
  "Video, audio & animation",
];

const availabilityOptions = [
  { value: "full-time", label: "Full-time available" },
  { value: "part-time", label: "Part-time available" },
  { value: "not-available", label: "Not available" },
];

const suggestedSkills = [
  "Adobe Premiere Pro",
  "After Effects",
  "DaVinci Resolve",
  "Final Cut Pro",
  "Cinema 4D",
  "Blender",
  "Nuke",
  "Maya",
];

const FreelancerProfileEdit = () => {
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["myFreelancerProfile"] });
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "basic");

  // Sync tab state with URL parameter changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    } else if (!tab && activeTab !== "basic") {
      setActiveTab("basic");
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };
  const { data: profileData, isLoading: loadingProfile } = useMyFreelancerProfile();
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Profile data state
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const loading = loadingProfile || !profile;
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    headline: "",
    bio: "",
    contactInfo: "",

    availability: "full-time",
    categories: ["Editing"],
  });
  const [skills, setSkills] = useState<SkillRef[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [experience, setExperience] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] =
    useState<PortfolioItem | null>(null);
  const [showEducationModal, setShowEducationModal] = useState(false);

  // Custom date states for smooth experience calendar
  const [expStartMonth, setExpStartMonth] = useState("");
  const [expStartYear, setExpStartYear] = useState("");
  const [expEndMonth, setExpEndMonth] = useState("");
  const [expEndYear, setExpEndYear] = useState("");

  // Profile picture upload ref
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Modal form refs
  const expTitleRef = useRef<HTMLInputElement>(null);
  const expCompanyRef = useRef<HTMLInputElement>(null);
  const expDescRef = useRef<HTMLTextAreaElement>(null);
  const eduInstRef = useRef<HTMLInputElement>(null);
  const eduDegreeRef = useRef<HTMLInputElement>(null);
  const eduFieldRef = useRef<HTMLInputElement>(null);
  const eduYearRef = useRef<HTMLInputElement>(null);

  // ---------- FETCH PROFILE ----------
  useEffect(() => {
    if (profileData && !profile) {
      applyProfileToState(profileData);
    }
  }, [profileData, profile]);

  const applyProfileToState = (data: FreelancerProfile) => {
    setProfile(data);
    setFormData({
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      displayName: data.displayName || "",
      headline: data.headline || "",
      bio: data.bio || "",
      contactInfo: data.contactInfo || "",

      availability: data.availability || "full-time",
      categories: data.categories?.length ? data.categories : ["Editing"],
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
        contactInfo: formData.contactInfo,

        availability: formData.availability,
        categories: formData.categories,
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

  // ---------- PROFILE PHOTO HANDLER ----------
  const handleProfilePhotoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }

      try {
        setUploadingPhoto(true);
        // Convert to base64 data URL
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
          try {
            const data = await freelancerService.updateProfile({
              profilePicture: base64,
            } as any);
            applyProfileToState(data);
            toast.success("Profile photo updated!");
          } catch (err) {
            console.error("Failed to upload photo:", err);
            toast.error("Failed to upload photo");
          } finally {
            setUploadingPhoto(false);
          }
        };
        reader.onerror = () => {
          toast.error("Failed to read image file");
          setUploadingPhoto(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        toast.error("Failed to process image");
        setUploadingPhoto(false);
      }
      // Reset input value so same file can be re-selected
      e.target.value = "";
    },
    [],
  );

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
  const handlePortfolioSubmit = async (data: {
    title: string;
    description: string;
    projectUrl: string;
    categories: string[];
    thumbnail: string;
  }) => {
    try {
      if (editingPortfolioItem) {
        setActionLoading(`portfolio-edit-${editingPortfolioItem._id}`);
        const updatedProfile = await freelancerService.updatePortfolio(
          editingPortfolioItem._id as string,
          {
            title: data.title,
            description: data.description,
            projectUrl: data.projectUrl,
            skills: data.categories,
            thumbnail: data.thumbnail,
          },
        );
        applyProfileToState(updatedProfile);
        toast.success("Project updated!");
      } else {
        setActionLoading("portfolio-add");
        const updatedProfile = await freelancerService.addPortfolio({
          title: data.title,
          description: data.description,
          projectUrl: data.projectUrl,
          skills: data.categories,
          thumbnail: data.thumbnail,
        });
        applyProfileToState(updatedProfile);
        toast.success("Project added!");
      }
      setShowPortfolioModal(false);
      setEditingPortfolioItem(null);
    } catch (err) {
      console.error("Failed to save portfolio:", err);
      toast.error("Failed to save portfolio project");
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
    const startDateVal =
      expStartYear && expStartMonth
        ? `${expStartYear}-${expStartMonth}`
        : undefined;
    const endDateVal =
      expEndYear && expEndMonth ? `${expEndYear}-${expEndMonth}` : undefined;
    try {
      setActionLoading("experience-add");
      const data = await freelancerService.addExperience({
        title,
        company,
        startDate: startDateVal || new Date().toISOString(),
        endDate: endDateVal || undefined,
        description: expDescRef.current?.value?.trim() || undefined,
      });
      applyProfileToState(data);
      setShowExperienceModal(false);

      // Reset state for dates
      setExpStartMonth("");
      setExpStartYear("");
      setExpEndMonth("");
      setExpEndYear("");
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
      <div className="flex-1 flex items-center justify-center h-full min-h-[50vh] bg-slate-50 dark:bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-teal" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Loading your profile…
          </p>
        </div>
      </div>
    );
  }

  const initials =
    `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase() ||
    "?";

  return (
    <div className="w-full bg-slate-50 dark:bg-background flex-1 h-full overflow-y-auto transition-colors duration-300">
      <div className="w-full">
        {/* Header Bar */}
        <DashboardHeader
          title="Edit Profile"
          onMenuClick={() => setSidebarOpen(true)}
        >
          <div className="flex items-center gap-2 lg:gap-4 ml-auto">
            <Link to="/freelancer/profile" className="hidden lg:flex">
              <Button
                variant="outline"
                className="border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
              >
                <Eye size={16} className="mr-2" />
                Preview Profile
              </Button>
            </Link>
            <Button
              className="bg-teal hover:bg-teal-light text-white hidden lg:flex"
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
        </DashboardHeader>

        {/* Main Content Area */}
        <PullToRefresh onRefresh={handleRefresh}>
          <main className="p-4 lg:p-8 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] sm:pb-8 lg:pb-8 dashboard-content">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* LEFT - Main Form */}
            <div className="flex-1 space-y-6">
              {/* PROFILE PREVIEW CARD */}
              <section className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
                {/* Cover Image */}
                <div className="relative h-32 lg:h-40 bg-gradient-to-r from-navy via-royal-blue to-teal" />

                {/* Profile Photo */}
                <div className="relative px-6 pb-6">
                  <div className="relative -mt-12 lg:-mt-16 w-24 h-24 lg:w-32 lg:h-32">
                    {profile?.profilePicture ? (
                      <img
                        src={profile.profilePicture}
                        alt="Profile"
                        className="w-full h-full rounded-2xl object-cover border-4 border-white dark:border-[#111827] shadow-lg"
                      />
                    ) : (
                      <div className="w-full h-full rounded-2xl bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-3xl lg:text-4xl border-4 border-white dark:border-[#111827] shadow-lg">
                        {initials}
                      </div>
                    )}
                    <input
                      ref={profilePicInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePhotoChange}
                    />
                    <button
                      onClick={() => profilePicInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-teal hover:bg-teal-light rounded-full flex items-center justify-center text-white shadow-lg transition-colors border-2 border-white dark:border-[#111827]"
                    >
                      {uploadingPhoto ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Camera size={14} />
                      )}
                    </button>
                  </div>

                  {/* Verification Status */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success-green/10 text-success-green rounded-full text-sm font-medium border border-success-green/20">
                      <CheckCircle size={14} />
                      Email Verified
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border",
                        user?.isPhoneVerified
                          ? "bg-success-green/10 text-success-green border-success-green/20"
                          : "bg-gold/10 text-gold border-gold/20",
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
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border",
                        profile?.isVerified
                          ? "bg-success-green/10 text-success-green border-success-green/20"
                          : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10",
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
              <section className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
                {/* Tab Navigation */}
                <div className="flex overflow-x-auto border-b border-slate-100 dark:border-white/10">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                        activeTab === tab.id
                          ? "border-teal text-teal"
                          : "border-transparent text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white",
                      )}
                    >
                      <tab.icon size={16} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-4 sm:p-5 lg:p-6">
                  {/* BASIC INFO TAB */}
                  {activeTab === "basic" && (
                    <div className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                        {/* First Name */}
                        <div>
                          <label className="block text-sm font-medium text-navy dark:text-white mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) =>
                              handleInputChange("firstName", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy dark:text-white"
                            placeholder="First name"
                          />
                        </div>

                        {/* Last Name */}
                        <div>
                          <label className="block text-sm font-medium text-navy dark:text-white mb-2">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy dark:text-white"
                            placeholder="Last name"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                        {/* Display Name */}
                        <div>
                          <label className="block text-sm font-medium text-navy dark:text-white mb-2">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={formData.displayName}
                            onChange={(e) =>
                              handleInputChange("displayName", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy dark:text-white"
                            placeholder="Public display name"
                          />
                        </div>

                        {/* Contact Info */}
                        <div>
                          <label className="block text-sm font-medium text-navy dark:text-white mb-2">
                            Contact Email or Phone Number *
                          </label>
                          <input
                            type="text"
                            value={formData.contactInfo}
                            onChange={(e) =>
                              handleInputChange("contactInfo", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy dark:text-white"
                            placeholder="e.g., 9876543210 or mail@example.com"
                            required
                          />
                        </div>
                      </div>

                      {/* Professional Headline */}
                      <div>
                        <label className="block text-sm font-medium text-navy dark:text-white mb-2">
                          Professional Headline *
                        </label>
                        <input
                          type="text"
                          value={formData.headline}
                          onChange={(e) =>
                            handleInputChange("headline", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy dark:text-white"
                          placeholder="e.g., Professional Video Editor & Motion Graphics Artist"
                        />
                      </div>

                      {/* Categories */}
                      <div>
                        <label className="block text-sm font-medium text-navy dark:text-white mb-2">
                          Categories (Select multiple) *
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {categoryOptions.map((cat) => {
                            const isSelected = formData.categories.includes(cat);
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  let newCats = [...formData.categories];
                                  if (isSelected) {
                                    newCats = newCats.filter(c => c !== cat);
                                  } else {
                                    newCats.push(cat);
                                  }
                                  // Require at least one category
                                  if (newCats.length > 0) {
                                    handleInputChange("categories", newCats);
                                  }
                                }}
                                className={`px-4 py-2 rounded-full border text-sm transition-all ${
                                  isSelected
                                    ? "bg-teal text-white border-teal"
                                    : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-teal/50"
                                }`}
                              >
                                {cat}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="block text-sm font-medium text-navy dark:text-white mb-2">
                          Bio/About
                        </label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) =>
                            handleInputChange("bio", e.target.value)
                          }
                          rows={4}
                          maxLength={2000}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy dark:text-white resize-none"
                          placeholder="Tell clients about yourself..."
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          {formData.bio.length}/2000 characters
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                        {/* Availability */}
                        <div>
                          <label className="block text-sm font-medium text-navy dark:text-white mb-2">
                            Availability
                          </label>
                          <select
                            value={formData.availability}
                            onChange={(e) =>
                              handleInputChange("availability", e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy dark:text-white bg-white dark:bg-white/5"
                          >
                            {availabilityOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
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
                        <label className="block text-sm font-medium text-navy dark:text-white mb-2">
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
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy dark:text-white"
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
                        <h4 className="text-sm font-medium text-navy dark:text-white">
                          Your Skills
                        </h4>
                        {skills.map((skill) => (
                          <div
                            key={skill.name}
                            className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <GripVertical
                                size={16}
                                className="text-slate-400 dark:text-slate-500 cursor-grab shrink-0"
                              />
                              <span className="font-medium text-navy dark:text-white truncate">
                                {skill.name}
                              </span>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-1 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-200 dark:border-white/10">
                              <div className="flex items-center gap-2 flex-1 sm:flex-none max-w-[200px]">
                                <span className="text-xs text-slate-500 shrink-0 min-w-[3.5rem]">
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
                                  className="w-full sm:w-24 accent-teal"
                                />
                              </div>
                              <button
                                onClick={() => removeSkill(skill.name)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors shrink-0 ml-2"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
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
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <h4 className="text-sm font-medium text-navy dark:text-white">
                          Portfolio Items ({portfolio.length})
                        </h4>
                        <Button
                          onClick={() => {
                            setEditingPortfolioItem(null);
                            setShowPortfolioModal(true);
                          }}
                          className="bg-teal hover:bg-teal-light text-white w-full sm:w-auto"
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
                            <div className="h-40 overflow-hidden relative border-b border-slate-100 dark:border-white/5">
                              {item.thumbnail ? (
                                <img
                                  src={item.thumbnail}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                (() => {
                                  const category =
                                    item.skills?.[0] || "Default";
                                  const style = getCategoryStyle(category);
                                  const Icon = style.icon;
                                  return (
                                    <div
                                      className={cn(
                                        "w-full h-full flex flex-col items-center justify-center text-white bg-gradient-to-br transition-all duration-300",
                                        style.gradient,
                                      )}
                                    >
                                      <Icon
                                        size={40}
                                        className="mb-2 opacity-80"
                                      />
                                      <span className="text-xxs font-bold uppercase tracking-wider opacity-60">
                                        {category}
                                      </span>
                                    </div>
                                  );
                                })()
                              )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                              <h5 className="font-semibold text-navy dark:text-white mb-1">
                                {item.title}
                              </h5>
                              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                                {item.description}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {(item.skills || []).map((skill) => (
                                  <span
                                    key={skill}
                                    className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 text-xs rounded"
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
                                  setEditingPortfolioItem(item);
                                  setShowPortfolioModal(true);
                                }}
                                className="p-2 bg-white dark:bg-[#111827] rounded-lg shadow-md hover:bg-slate-50 dark:hover:bg-white/10 transition-colors border border-slate-100 dark:border-white/10"
                              >
                                <Edit2 size={14} className="text-teal" />
                              </button>
                              <button
                                onClick={() =>
                                  item._id && handleDeletePortfolio(item._id)
                                }
                                disabled={
                                  actionLoading === `portfolio-del-${item._id}`
                                }
                                className="p-2 bg-white dark:bg-[#111827] rounded-lg shadow-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border border-slate-100 dark:border-white/10"
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
                          <ImageIcon
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
                        <h4 className="text-sm font-medium text-navy dark:text-white">
                          Work Experience
                        </h4>
                        <Button
                          onClick={() => {
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
                            className="relative pl-6 pb-6 border-l-2 border-slate-200 dark:border-white/10 last:pb-0"
                          >
                            {/* Timeline dot */}
                            <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-teal border-2 border-white dark:border-[#111827]" />

                            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 ml-4 border border-slate-100 dark:border-white/5">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h5 className="font-semibold text-navy dark:text-white">
                                    {item.title}
                                  </h5>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {item.company}
                                  </p>
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-white/10 px-2 py-1 rounded">
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
                              <div className="flex gap-6">
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
                            className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5"
                          >
                            <div className="w-12 h-12 rounded-xl bg-royal-blue/10 dark:bg-royal-blue/20 flex items-center justify-center shrink-0">
                              <GraduationCap
                                size={24}
                                className="text-royal-blue dark:text-royal-blue-light"
                              />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-navy dark:text-white">
                                {item.degree && item.fieldOfStudy
                                  ? `${item.degree} in ${item.fieldOfStudy}`
                                  : item.degree ||
                                    item.fieldOfStudy ||
                                    "Education"}
                              </h5>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {item.institution}
                              </p>
                              {item.year && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
            <div className="lg:w-80 flex flex-col gap-6">
              {/* Profile Completeness */}
              <section className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-4 sm:p-5">
                <h3 className="text-lg font-bold text-navy dark:text-white mb-4">
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
                        stroke="currentColor"
                        className="text-slate-200 dark:text-white/10"
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
                      <span className="text-3xl font-bold text-navy dark:text-white">
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
                            ? "text-slate-500 dark:text-slate-400"
                            : "text-navy dark:text-white font-medium"
                        }
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Profile Tips */}
              <section className="bg-gradient-to-br from-royal-blue/5 to-teal/5 dark:from-royal-blue/10 dark:to-teal/10 rounded-2xl border border-royal-blue/10 dark:border-white/10 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={18} className="text-gold" />
                  <h3 className="font-bold text-navy dark:text-white">
                    Profile Tips
                  </h3>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <ChevronRight
                      size={16}
                      className="text-teal shrink-0 mt-0.5"
                    />
                    Add a professional profile photo to increase trust
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <ChevronRight
                      size={16}
                      className="text-teal shrink-0 mt-0.5"
                    />
                    Complete ID verification to get a verified badge
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <ChevronRight
                      size={16}
                      className="text-teal shrink-0 mt-0.5"
                    />
                    Add more portfolio items to showcase your work
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <ChevronRight
                      size={16}
                      className="text-teal shrink-0 mt-0.5"
                    />
                    Write a compelling bio that highlights your expertise
                  </li>
                </ul>
              </section>

              {/* Preview Link */}
              <Link to={`/freelancer/${user?._id}`} className="block w-full">
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
        </PullToRefresh>
        {/* MOBILE STICKY SAVE BAR */}
        <div 
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-white/10 px-4 py-3 flex gap-3 shadow-lg transition-all duration-300"
          style={{ paddingBottom: 'calc(0.75rem + var(--mobile-nav-pb, env(safe-area-inset-bottom, 0px)))' }}
        >
          <Link to={`/freelancer/${user?._id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
            >
              <Eye size={16} className="mr-2" />
              Preview
            </Button>
          </Link>
          <Button
            className="flex-1 bg-teal hover:bg-teal-light text-white"
            onClick={handleSaveChanges}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {/* PORTFOLIO MODAL */}
      <AddPortfolioModal
        isOpen={showPortfolioModal}
        onClose={() => {
          setShowPortfolioModal(false);
          setEditingPortfolioItem(null);
        }}
        onSubmit={handlePortfolioSubmit}
        categories={categoryOptions}
        editItem={editingPortfolioItem as any}
      />

      {/* EXPERIENCE MODAL */}
      {showExperienceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between p-4 sm:p-5 lg:p-6 border-b border-slate-100 dark:border-white/10">
              <h3 className="text-lg font-bold text-navy dark:text-white">
                Add Experience
              </h3>
              <button
                onClick={() => setShowExperienceModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy dark:text-white mb-2">
                  Job Title *
                </label>
                <input
                  ref={expTitleRef}
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy dark:text-white"
                  placeholder="e.g., Senior Video Editor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy dark:text-white mb-2">
                  Company Name *
                </label>
                <input
                  ref={expCompanyRef}
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy dark:text-white"
                  placeholder="Company name"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-navy dark:text-white mb-2">
                    Start Date
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={expStartMonth}
                      onChange={(e) => setExpStartMonth(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy dark:text-white"
                    >
                      <option value="">Month</option>
                      {Array.from({ length: 12 }).map((_, i) => {
                        const m = (i + 1).toString().padStart(2, "0");
                        return (
                          <option key={m} value={m}>
                            {new Date(0, i).toLocaleString("default", {
                              month: "short",
                            })}
                          </option>
                        );
                      })}
                    </select>
                    <select
                      value={expStartYear}
                      onChange={(e) => setExpStartYear(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy dark:text-white"
                    >
                      <option value="">Year</option>
                      {Array.from({ length: 40 }).map((_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy dark:text-white mb-2">
                    End Date
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={expEndMonth}
                      onChange={(e) => setExpEndMonth(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy dark:text-white"
                    >
                      <option value="">Month</option>
                      {Array.from({ length: 12 }).map((_, i) => {
                        const m = (i + 1).toString().padStart(2, "0");
                        return (
                          <option key={m} value={m}>
                            {new Date(0, i).toLocaleString("default", {
                              month: "short",
                            })}
                          </option>
                        );
                      })}
                    </select>
                    <select
                      value={expEndYear}
                      onChange={(e) => setExpEndYear(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy dark:text-white"
                    >
                      <option value="">Year</option>
                      {Array.from({ length: 40 }).map((_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Leave empty for Present
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy dark:text-white mb-2">
                  Description
                </label>
                <textarea
                  ref={expDescRef}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy dark:text-white resize-none"
                  rows={3}
                  placeholder="Describe your role and achievements"
                />
              </div>
            </div>

            <div className="flex gap-3 p-4 sm:p-5 border-t border-slate-100">
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
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy">Add Education</h3>
              <button
                onClick={() => setShowEducationModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
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

            <div className="flex gap-3 p-4 sm:p-5 border-t border-slate-100">
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

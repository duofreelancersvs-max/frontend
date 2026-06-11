import React, { useState, useEffect, useRef } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useOutletContext,
  useSearchParams,
} from "react-router-dom";
import type { ClientLayoutContext } from "@/layouts/ClientLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  FileText,
  ClipboardList,
  Eye,
  Lightbulb,
  MapPin,
  Edit2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { projectService } from "@/services";
import {
  publicService,
  type CategoryWithSkills,
} from "@/services/public.service";
import { toast } from "react-toastify";
import { CustomDatePicker } from "@/components/common/CustomDatePicker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

// Form Options
import DashboardHeader from "@/components/layouts/DashboardHeader";

// We will fetch categories and skills dynamically from the backend

// durations array removed

const steps = [
  { id: 1, label: "Project Details", icon: FileText },
  { id: 2, label: "Requirements", icon: ClipboardList },
  { id: 3, label: "Review", icon: Eye },
];

// CustomDatePicker has been moved to src/components/common/CustomDatePicker.tsx

const PostProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { id: projectId } = useParams<{ id: string }>();
  const isEditing = Boolean(projectId);
  const { setSidebarOpen } = useOutletContext<ClientLayoutContext>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep = parseInt(searchParams.get("step") || "1", 10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const [loadingProject, setLoadingProject] = useState(isEditing);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [idempotencyKey] = useState(() => {
    return typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  });

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    title: "",
    categories: [] as string[],
    description: "",
    contactInfo: "",
    // Step 2
    skills: [] as string[],
    location: "remote",
    city: "",
    country: "",
    autoDetectLocation: true,
    deadline: "",
    visibility: "public",
    // Step 3 (Review)
    termsAccepted: false,
  });

  // Dynamic Data
  const [categories, setCategories] = useState<string[]>([]);
  const [skillsByCategory, setSkillsByCategory] = useState<
    Record<string, string[]>
  >({});
  const [allSkillOptions, setAllSkillOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await publicService.getCategoriesWithSkills();
        const catNames = data.map((c: CategoryWithSkills) => c.name);
        setCategories(catNames);

        const skillsMap: Record<string, string[]> = {};
        const allSkills: string[] = [];
        data.forEach((c: CategoryWithSkills) => {
          const skillNames = (c.skills || []).map((s) => s.skillName);
          skillsMap[c.name] = skillNames;
          allSkills.push(...skillNames);
        });
        setSkillsByCategory(skillsMap);
        setAllSkillOptions(allSkills);
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    if (isEditing && projectId) {
      const fetchProject = async () => {
        try {
          setLoadingProject(true);
          const project = await projectService.getById(projectId);
          setFormData({
            title: project.title || "",
            categories: project.category ? [project.category] : [],
            description: project.description || "",
            contactInfo: project.contactInfo || "",
            skills: project.requiredSkills || [],
            location: project.location?.type || "remote",
            city: project.location?.city || "",
            country: project.location?.country || "",
            autoDetectLocation: true,
            deadline: project.deadline ? project.deadline.split("T")[0] : "",
            visibility: project.visibility || "public",
            termsAccepted: false,
          });
        } catch (error) {
          console.error("Error fetching project:", error);
          navigate(isAdmin ? "/admin/projects" : "/client/projects");
        } finally {
          setLoadingProject(false);
        }
      };
      fetchProject();
    }
  }, [isEditing, projectId, navigate]);

  // Reverse geocoding helper using OpenStreetMap Nominatim (free, no API key)
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      setLocationLoading(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`,
      );
      const data = await res.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        "";
      const country = data.address?.country || "";
      setFormData((prev) => ({
        ...prev,
        city,
        country,
      }));
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  // Auto-detect location on mount
  useEffect(() => {
    if (!isEditing && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.log("Location access denied or unavailable:", error.message);
        },
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAutoDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.log("Location access denied:", error.message);
          alert(
            "Unable to detect location. Please allow location access or enter manually.",
          );
        },
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const [skillSearch, setSkillSearch] = useState("");

  const handleInputChange = (
    field: string,
    value: string | boolean | string[] | File[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: [category],
    }));
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.title?.trim()) { toast.error("Please enter a project title"); return; }
      if (formData.categories.length === 0) { toast.error("Please select a project category"); return; }
      if (!formData.description?.trim()) { toast.error("Please enter a project description"); return; }
      if (formData.contactInfo) {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo);
        const isPhone = /^\d{10}$/.test(formData.contactInfo.replace(/[\s\-+]/g, ''));
        if (!isEmail && !isPhone) {
          toast.error("Contact Information must be a valid email or a 10-digit phone number.");
          return;
        }
      }
    } else if (currentStep === 2) {
      if (formData.skills.length === 0) { toast.error("Please select required skills"); return; }
      if (!formData.deadline) { toast.error("Please select a deadline"); return; }
      if (formData.location === "onsite" && (!formData.city?.trim() || !formData.country?.trim())) {
        toast.error("Please provide City and Country for onsite location");
        return;
      }
    }

    const next = Math.min(currentStep + 1, 3);
    setSearchParams({ step: next.toString() });
  };
  
  const prevStep = () => {
    const prev = Math.max(currentStep - 1, 1);
    setSearchParams({ step: prev.toString() });
  };

  const handleSubmit = async () => {
    try {
      const missingFields: string[] = [];

      if (!formData.title?.trim()) missingFields.push("Title");
      if (formData.categories.length === 0) missingFields.push("Category");
      if (!formData.description?.trim()) missingFields.push("Description");
      if (formData.skills.length === 0) missingFields.push("Skills");
      if (!formData.deadline) missingFields.push("Deadline");
      if (
        formData.location === "onsite" &&
        (!formData.city?.trim() || !formData.country?.trim())
      ) {
        missingFields.push("Location (City & Country)");
      }

      if (missingFields.length > 0) {
        toast.error(
          `Please provide all mandatory fields: ${missingFields.join(", ")}`,
        );

        const firstMissing = missingFields[0];
        if (["Title", "Category", "Description"].includes(firstMissing)) {
          setSearchParams({ step: "1" });
        } else if (
          ["Skills", "Deadline", "Location (City & Country)"].includes(
            firstMissing,
          )
        ) {
          setSearchParams({ step: "2" });
        }

        topRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (formData.contactInfo) {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo);
        const isPhone = /^\d{10}$/.test(formData.contactInfo.replace(/[\s\-+]/g, ''));
        if (!isEmail && !isPhone) {
          toast.error("Contact Information must be a valid email or a 10-digit phone number.");
          setSearchParams({ step: "1" });
          topRef.current?.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }

      setIsSubmitting(true);

      const projectData = {
        title: formData.title,
        description: formData.description,
        contactInfo: formData.contactInfo,
        category: formData.categories[0],
        requiredSkills: formData.skills,
        deadline: formData.deadline,
        location: {
          type: formData.location,
          city: formData.city,
          country: formData.country,
        },
        idempotencyKey,
      };

      if (isEditing && projectId) {
        await projectService.update(projectId, projectData);
        navigate(isAdmin ? "/admin/projects" : `/client/project/${projectId}`);
      } else {
        await projectService.create(projectData);
        setShowSuccessModal(true);
      }
    } catch (error) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      console.error(
        isEditing ? "Error updating project:" : "Error creating project:",
        err,
      );
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Something went wrong";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skills filtered by selected category + search
  const availableSkills = React.useMemo(() => {
    return formData.categories.length > 0
      ? skillsByCategory[formData.categories[0]] || []
      : allSkillOptions;
  }, [formData.categories, skillsByCategory, allSkillOptions]);

  const filteredSkills = React.useMemo(() => {
    if (!skillSearch) return availableSkills;
    const lowerSearch = skillSearch.toLowerCase();
    return availableSkills.filter((skill) =>
      skill.toLowerCase().includes(lowerSearch),
    );
  }, [availableSkills, skillSearch]);

  if (loadingProject) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-slate-50 dark:bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  return (
    <div
      ref={topRef}
      className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-background font-sans"
    >
      {/* Header Bar */}
      {!isAdmin && (
        <DashboardHeader
          title={isEditing ? "Edit Project" : "Post a New Project"}
          onMenuClick={() => setSidebarOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <main className="px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-3 space-y-6">
            {/* PROGRESS STEPPER */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
              <div className="flex items-center justify-between w-full min-w-0">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div
                      className="flex flex-col items-center cursor-pointer"
                      onClick={() => setSearchParams({ step: step.id.toString() })}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all hover:scale-105 active:scale-95",
                          currentStep > step.id
                            ? "bg-teal text-white"
                            : currentStep === step.id
                              ? "bg-royal-blue text-white shadow-lg shadow-royal-blue/25"
                              : "bg-slate-100 text-slate-400",
                        )}
                      >
                        {currentStep > step.id ? <Check size={18} /> : step.id}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium mt-2 hidden sm:block",
                          currentStep >= step.id
                            ? "text-navy dark:text-white"
                            : "text-slate-400 dark:text-slate-600",
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "flex-1 h-0.5 mx-3",
                          currentStep > step.id
                            ? "bg-teal"
                            : "bg-slate-200 dark:bg-white/10",
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 1: PROJECT DETAILS */}
            {currentStep === 1 && (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 lg:p-8">
                <h2 className="text-xl font-bold text-navy dark:text-white mb-6 flex items-center gap-2">
                  <FileText size={20} className="text-royal-blue" />
                  Project Details
                </h2>

                <div className="space-y-6">
                  {/* Project Title */}
                  <div>
                    <label className="block text-sm font-semibold text-navy dark:text-white mb-2">
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., Wedding Video Editing"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className="h-12 border-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:border-teal focus:ring-teal"
                    />
                  </div>

                  {/* Project Categories */}
                  <div>
                    <label className="block text-sm font-semibold text-navy dark:text-white mb-3">
                      Project Categories <span className="text-red-500">*</span>
                    </label>

                    {/* Available Categories */}
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryToggle(category)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                            formData.categories.includes(category)
                              ? "bg-teal text-white"
                              : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20",
                          )}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Project Description */}
                  <div>
                    <label className="block text-sm font-semibold text-navy dark:text-white mb-2">
                      Project Description{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      placeholder="Describe your project in detail. Include specific requirements, deliverables, and any reference materials..."
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      className="min-h-[180px] border-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:border-teal focus:ring-teal resize-none"
                    />
                    <div className="flex justify-between mt-2">
                      <p className="text-xs text-slate-400">
                        Be as detailed as possible to attract the right
                        freelancers
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          formData.description.length > 1000
                            ? "text-red-500"
                            : "text-slate-400",
                        )}
                      >
                        {formData.description.length}/1000
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <label className="block text-sm font-semibold text-navy dark:text-white mb-2">
                      Contact Email or Phone Number (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., email@example.com or +1 234 567 8900"
                      value={formData.contactInfo}
                      onChange={(e) =>
                        handleInputChange("contactInfo", e.target.value)
                      }
                      className="h-12 border-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:border-teal focus:ring-teal"
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      Leave an email or phone number for freelancers to contact you directly.
                    </p>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                  <Link to="/client/dashboard">
                    <Button
                      variant="outline"
                      className="border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 dark:hover:bg-white/5"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    onClick={nextStep}
                    className="bg-teal hover:bg-teal-light text-white px-8"
                  >
                    Next: Requirements
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: REQUIREMENTS */}
            {currentStep === 2 && (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 lg:p-8">
                <h2 className="text-xl font-bold text-navy dark:text-white mb-6 flex items-center gap-2">
                  <ClipboardList size={20} className="text-royal-blue" />
                  Requirements
                </h2>

                <div className="space-y-6">
                  {/* Skills Required */}
                  <div>
                    <label className="block text-sm font-semibold text-navy dark:text-white mb-2">
                      Skills Required <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Search skills..."
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      className="h-12 border-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:border-teal focus:ring-teal mb-3"
                    />

                    {/* Selected Skills */}
                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {formData.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-teal/10 dark:bg-teal/20 text-teal rounded-full text-sm font-medium"
                          >
                            {skill}
                            <button onClick={() => handleSkillToggle(skill)}>
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Available Skills */}
                    <div className="flex flex-wrap gap-2">
                      {filteredSkills.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => handleSkillToggle(skill)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                            formData.skills.includes(skill)
                              ? "bg-teal text-white"
                              : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20",
                          )}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>



                  {/* Location Preference */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-navy dark:text-white">
                        Location Preference
                      </label>
                      {formData.location === "onsite" && (
                        <button
                          onClick={() => {
                            handleInputChange("autoDetectLocation", true);
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition(
                                (position) => {
                                  const { latitude, longitude } =
                                    position.coords;
                                  // In a real app, you would use a reverse geocoding service
                                  // For now, we'll just show a placeholder
                                  handleInputChange(
                                    "city",
                                    `Location detected (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
                                  );
                                },
                                () => {
                                  console.log("Location access denied");
                                },
                              );
                            }
                          }}
                          className="text-xs text-teal hover:underline"
                        >
                          Auto-detect Location
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {["remote", "onsite", "hybrid"].map((loc) => (
                        <label
                          key={loc}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                            formData.location === loc
                              ? "border-teal bg-teal/5 dark:bg-teal/10"
                              : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20",
                          )}
                        >
                          <input
                            type="radio"
                            name="location"
                            value={loc}
                            checked={formData.location === loc}
                            onChange={(e) =>
                              handleInputChange("location", e.target.value)
                            }
                            className="sr-only"
                          />
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                              formData.location === loc
                                ? "border-teal bg-teal"
                                : "border-slate-300",
                            )}
                          >
                            {formData.location === loc && (
                              <Check size={12} className="text-white" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin
                              size={16}
                              className="text-slate-400 dark:text-slate-500"
                            />
                            <span className="font-medium text-navy dark:text-white capitalize">
                              {loc === "onsite" ? "On-site" : loc}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                    {formData.location === "onsite" && (
                      <Input
                        placeholder="Enter city name"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        className="mt-3 h-12 border-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:border-teal focus:ring-teal"
                      />
                    )}
                  </div>

                  {/* Project Location (Mandatory) */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-navy dark:text-white">
                        Project Location <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoDetectLocation}
                        disabled={locationLoading}
                        className="text-xs text-teal hover:underline flex items-center gap-1 disabled:opacity-50"
                      >
                        {locationLoading ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            Detecting...
                          </>
                        ) : (
                          <>
                            <MapPin size={12} />
                            Auto-detect Location
                          </>
                        )}
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          City
                        </label>
                        <div className="relative">
                          <MapPin
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                          />
                          <Input
                            placeholder="e.g., Hyderabad"
                            value={formData.city}
                            onChange={(e) =>
                              handleInputChange("city", e.target.value)
                            }
                            className="h-12 pl-10 border-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:border-teal focus:ring-teal"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          Country
                        </label>
                        <div className="relative">
                          <MapPin
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                          />
                          <Input
                            placeholder="e.g., India"
                            value={formData.country}
                            onChange={(e) =>
                              handleInputChange("country", e.target.value)
                            }
                            className="h-12 pl-10 border-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:border-teal focus:ring-teal"
                          />
                        </div>
                      </div>
                    </div>
                    {locationLoading && (
                      <p className="text-xs text-teal mt-2 flex items-center gap-1">
                        <Loader2 size={12} className="animate-spin" />
                        Detecting your location...
                      </p>
                    )}
                    {!locationLoading && formData.city && formData.country && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                        <CheckCircle size={12} className="text-teal" />
                        {formData.city}, {formData.country}
                      </p>
                    )}
                  </div>

                  {/* Project Deadline */}
                  <div>
                    <label className="block text-sm font-semibold text-navy dark:text-white mb-2">
                      Project Deadline <span className="text-red-500">*</span>
                    </label>
                    <CustomDatePicker
                      value={formData.deadline}
                      onChange={(date) => handleInputChange("deadline", date)}
                    />
                    {formData.deadline && (
                      <p className="text-xs text-teal mt-2 flex items-center gap-1">
                        <CheckCircle size={12} />
                        Deadline set to {format(new Date(formData.deadline + "T00:00:00"), "dd MMM yyyy")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-100 dark:border-white/10">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 dark:hover:bg-white/5"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="bg-teal hover:bg-teal-light text-white px-8"
                  >
                    Next: Review
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW */}
            {currentStep === 3 && (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 lg:p-8">
                <h2 className="text-xl font-bold text-navy dark:text-white mb-6 flex items-center gap-2">
                  <Eye size={20} className="text-royal-blue" />
                  Review Your Project
                </h2>


                {/* Project Preview */}
                <div className="space-y-6">
                  {/* Project Details Section */}
                  <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-xl border border-transparent dark:border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-navy dark:text-white flex items-center gap-2">
                        <FileText size={16} className="text-teal" />
                        Project Details
                      </h3>
                      <button
                        onClick={() => setSearchParams({ step: "1" })}
                        className="text-teal hover:underline text-sm flex items-center gap-1"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                          Title
                        </p>
                        <p className="font-medium text-navy dark:text-white">
                          {formData.title || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                          Categories
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {formData.categories.length > 0 ? (
                            formData.categories.map((cat) => (
                              <span
                                key={cat}
                                className="px-2 py-1 bg-teal/10 dark:bg-teal/20 text-teal rounded-md text-xs font-medium"
                              >
                                {cat}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-sm">
                              Not specified
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                          Description
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                          {formData.description || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Requirements Section */}
                  <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-xl border border-transparent dark:border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-navy dark:text-white flex items-center gap-2">
                        <ClipboardList size={16} className="text-teal" />
                        Requirements & Timeline
                      </h3>
                      <button
                        onClick={() => setSearchParams({ step: "2" })}
                        className="text-teal hover:underline text-sm flex items-center gap-1"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                          Required Skills
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {formData.skills.length > 0 ? (
                            formData.skills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-1 bg-teal/10 dark:bg-teal/20 text-teal rounded-md text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-sm">
                              Not specified
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">

                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                            Location Preference
                          </p>
                          <p className="font-medium text-navy dark:text-white capitalize">
                            {formData.location}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                            Deadline
                          </p>
                          <p className="font-medium text-navy dark:text-white">
                            {formData.deadline
                              ? format(new Date(formData.deadline + "T00:00:00"), "dd MMM yyyy")
                              : "Not specified"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                          Project Location
                        </p>
                        <p className="font-medium text-navy dark:text-white">
                          {formData.city && formData.country
                            ? `${formData.city}, ${formData.country}`
                            : formData.city ||
                              formData.country ||
                              "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="p-4 border-2 border-slate-200 dark:border-white/10 rounded-xl">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={(e) =>
                          handleInputChange("termsAccepted", e.target.checked)
                        }
                        className="mt-1 w-5 h-5 rounded border-slate-300 dark:border-white/10 text-teal focus:ring-teal dark:bg-white/5"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        I agree to the{" "}
                        <Link to="/terms-and-conditions" className="text-teal hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          to="/privacy-policy"
                          className="text-teal hover:underline"
                        >
                          Privacy Policy
                        </Link>
                        . I understand that this project will be visible to
                        freelancers based on my visibility settings.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-100 dark:border-white/10">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 dark:hover:bg-white/5"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.termsAccepted || isSubmitting}
                    className="bg-teal hover:bg-teal-light text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        {isEditing ? "Updating..." : "Posting..."}
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} className="mr-2" />
                        {isEditing ? "Update Project" : "Post Project"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR - Tips */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Tips Card */}
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Lightbulb size={18} className="text-gold" />
                  </div>
                  <h3 className="font-semibold text-navy dark:text-white">
                    Tips for a Great Post
                  </h3>
                </div>

                <ul className="space-y-3">
                  {[
                    "Write a clear, descriptive title",
                    "Include specific deliverables",
                    "Set a realistic deadline",
                    "Add reference files or examples",
                    "Mention your timeline clearly",
                    "List required skills accurately",
                  ].map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                    >
                      <CheckCircle
                        size={14}
                        className="text-teal mt-0.5 flex-shrink-0"
                      />
                      {tip}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10">
                  <Link
                    to="/help/posting-projects"
                    className="text-sm text-teal hover:underline flex items-center gap-1"
                  >
                    View example project →
                  </Link>
                </div>
              </div>

              {/* Need Help Card */}
              <div className="bg-gradient-to-br from-royal-blue to-navy rounded-2xl p-5 text-white">
                <AlertCircle size={24} className="mb-3" />
                <h4 className="font-semibold mb-2">Need Help?</h4>
                <p className="text-sm text-white/80 mb-4">
                  Our support team is here to assist you with posting your
                  project.
                </p>
                <Link to="/contact">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white text-sm"
                  >
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 text-center animate-fade-in-up border border-transparent dark:border-white/10 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-teal" />
            </div>
            <h3 className="text-2xl font-bold text-navy dark:text-white mb-2">
              Project Posted Successfully!
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Your project is now live. Freelancers will start applying soon.
              You'll receive notifications for new applications.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  navigate(isAdmin ? "/admin/dashboard" : "/client/dashboard")
                }
                className="flex-1 border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 dark:hover:bg-white/5"
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={() =>
                  navigate(isAdmin ? "/admin/projects" : "/client/projects")
                }
                className="flex-1 bg-teal hover:bg-teal-light text-white"
              >
                View Projects
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PostProject;

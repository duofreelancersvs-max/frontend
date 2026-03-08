import { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useOutletContext,
} from "react-router-dom";
import type { ClientLayoutContext } from "@/layouts/ClientLayout";
import {
  FileText,
  ClipboardList,
  Wallet,
  Eye,
  Lightbulb,
  Calendar,
  MapPin,
  Users,
  Edit2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  X,
  Menu,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { projectService } from "@/services";
import { toast } from "react-toastify";

// Form Options
const categories = [
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

const skillOptions = [
  "Adobe Premiere Pro",
  "After Effects",
  "DaVinci Resolve",
  "Final Cut Pro",
  "Cinema 4D",
  "Blender",
  "Nuke",
  "Houdini",
  "Maya",
  "Photoshop",
  "Illustrator",
  "Figma",
];

const experienceLevels = [
  {
    value: "entry",
    label: "Entry Level",
    desc: "Less than 2 years experience",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    desc: "2-5 years experience",
  },
  { value: "expert", label: "Expert", desc: "5+ years experience" },
];

const durations = ["Less than 1 week", "1-4 weeks", "1-3 months", "3+ months"];

const steps = [
  { id: 1, label: "Project Details", icon: FileText },
  { id: 2, label: "Requirements", icon: ClipboardList },
  { id: 3, label: "Budget", icon: Wallet },
  { id: 4, label: "Review", icon: Eye },
];

const PostProject = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  const isEditing = Boolean(projectId);
  const { setSidebarOpen } = useOutletContext<ClientLayoutContext>();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProject, setLoadingProject] = useState(isEditing);
  const { logout } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    title: "",
    categories: [] as string[],
    description: "",
    // Step 2
    skills: [] as string[],
    experienceLevel: "",
    duration: "",
    location: "remote",
    city: "",
    country: "",
    autoDetectLocation: true,
    // Step 3
    budgetType: "fixed",
    minBudget: "",
    maxBudget: "",
    deadline: "",
    visibility: "public",
    // Step 4
    termsAccepted: false,
  });

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
            skills: project.skills || [],
            experienceLevel: "",
            duration: "",
            location: project.location?.type || "remote",
            city: project.location?.city || "",
            country: project.location?.country || "",
            autoDetectLocation: true,
            budgetType: project.budget?.type || "fixed",
            minBudget: project.budget?.minAmount?.toString() || "",
            maxBudget: project.budget?.maxAmount?.toString() || "",
            deadline: project.deadline ? project.deadline.split("T")[0] : "",
            visibility: project.visibility || "public",
            termsAccepted: false,
          });
        } catch (error) {
          console.error("Error fetching project:", error);
          navigate("/client/projects");
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
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    try {
      const missingFields: string[] = [];

      if (!formData.title?.trim()) missingFields.push("Title");
      if (formData.categories.length === 0) missingFields.push("Category");
      if (!formData.description?.trim()) missingFields.push("Description");
      if (formData.skills.length === 0) missingFields.push("Skills");
      if (!formData.experienceLevel) missingFields.push("Experience Level");
      if (!formData.duration) missingFields.push("Duration");
      if (!formData.minBudget || !formData.maxBudget)
        missingFields.push("Budget Range");
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
        return;
      }

      setIsSubmitting(true);

      const projectData = {
        title: formData.title,
        description: formData.description,
        category: formData.categories[0],
        skills: formData.skills,
        budget: {
          type: formData.budgetType,
          minAmount: Number(formData.minBudget) || 0,
          maxAmount: Number(formData.maxBudget) || 0,
          currency: "INR",
        },
        deadline: formData.deadline,
        location: {
          type: formData.location,
          city: formData.city,
          country: formData.country,
        },
      };

      if (isEditing && projectId) {
        await projectService.update(projectId, projectData);
        navigate(`/client/project/${projectId}`);
      } else {
        await projectService.create(projectData);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error(
        isEditing ? "Error updating project:" : "Error creating project:",
        error,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSkills = skillOptions.filter((skill) =>
    skill.toLowerCase().includes(skillSearch.toLowerCase()),
  );

  if (loadingProject) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

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
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-navy">
                {isEditing ? "Edit Project" : "Post a New Project"}
              </h1>
              <p className="text-sm text-slate-500 hidden sm:block">
                Find the perfect freelancer for your project
              </p>
            </div>
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
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                  >
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
      <main className="p-4 lg:p-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-3 space-y-6">
            {/* PROGRESS STEPPER */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all",
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
                            ? "text-navy"
                            : "text-slate-400",
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "flex-1 h-0.5 mx-3",
                          currentStep > step.id ? "bg-teal" : "bg-slate-200",
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 1: PROJECT DETAILS */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
                <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
                  <FileText size={20} className="text-royal-blue" />
                  Project Details
                </h2>

                <div className="space-y-6">
                  {/* Project Title */}
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., Wedding Video Editing"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className="h-12 border-slate-200 focus:border-teal focus:ring-teal"
                    />
                  </div>

                  {/* Project Categories */}
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-3">
                      Project Categories <span className="text-red-500">*</span>
                    </label>

                    {/* Selected Categories */}
                    {formData.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {formData.categories.map((category) => (
                          <span
                            key={category}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-teal/10 text-teal rounded-full text-sm font-medium"
                          >
                            {category}
                            <button
                              onClick={() => handleCategoryToggle(category)}
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

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
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                          )}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Project Description */}
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">
                      Project Description{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      placeholder="Describe your project in detail. Include specific requirements, deliverables, and any reference materials..."
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      className="min-h-[180px] border-slate-200 focus:border-teal focus:ring-teal resize-none"
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
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                  <Link to="/client/dashboard">
                    <Button
                      variant="outline"
                      className="border-slate-300 text-slate-600"
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
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
                <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
                  <ClipboardList size={20} className="text-royal-blue" />
                  Requirements
                </h2>

                <div className="space-y-6">
                  {/* Skills Required */}
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">
                      Skills Required <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Search skills..."
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      className="h-12 border-slate-200 focus:border-teal focus:ring-teal mb-3"
                    />

                    {/* Selected Skills */}
                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {formData.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-teal/10 text-teal rounded-full text-sm font-medium"
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
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                          )}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-3">
                      Experience Level <span className="text-red-500">*</span>
                    </label>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {experienceLevels.map((level) => (
                        <label
                          key={level.value}
                          className={cn(
                            "relative p-4 rounded-xl border-2 cursor-pointer transition-all",
                            formData.experienceLevel === level.value
                              ? "border-teal bg-teal/5"
                              : "border-slate-200 hover:border-slate-300",
                          )}
                        >
                          <input
                            type="radio"
                            name="experienceLevel"
                            value={level.value}
                            checked={formData.experienceLevel === level.value}
                            onChange={(e) =>
                              handleInputChange(
                                "experienceLevel",
                                e.target.value,
                              )
                            }
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                formData.experienceLevel === level.value
                                  ? "border-teal bg-teal"
                                  : "border-slate-300",
                              )}
                            >
                              {formData.experienceLevel === level.value && (
                                <Check size={12} className="text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-navy">
                                {level.label}
                              </p>
                              <p className="text-xs text-slate-500">
                                {level.desc}
                              </p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Project Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">
                      Project Duration <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) =>
                        handleInputChange("duration", e.target.value)
                      }
                      className="w-full h-12 px-4 rounded-lg border border-slate-200 focus:border-teal focus:ring-1 focus:ring-teal text-navy bg-white"
                    >
                      <option value="">Select duration</option>
                      {durations.map((dur) => (
                        <option key={dur} value={dur}>
                          {dur}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location Preference */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-navy">
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
                              ? "border-teal bg-teal/5"
                              : "border-slate-200 hover:border-slate-300",
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
                            <MapPin size={16} className="text-slate-400" />
                            <span className="font-medium text-navy capitalize">
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
                        className="mt-3 h-12 border-slate-200 focus:border-teal focus:ring-teal"
                      />
                    )}
                  </div>

                  {/* Project Location (Mandatory) */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-navy">
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
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <Input
                            placeholder="e.g., Hyderabad"
                            value={formData.city}
                            onChange={(e) =>
                              handleInputChange("city", e.target.value)
                            }
                            className="h-12 pl-10 border-slate-200 focus:border-teal focus:ring-teal"
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
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <Input
                            placeholder="e.g., India"
                            value={formData.country}
                            onChange={(e) =>
                              handleInputChange("country", e.target.value)
                            }
                            className="h-12 pl-10 border-slate-200 focus:border-teal focus:ring-teal"
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
                      <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                        <CheckCircle size={12} className="text-teal" />
                        {formData.city}, {formData.country}
                      </p>
                    )}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="border-slate-300 text-slate-600"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="bg-teal hover:bg-teal-light text-white px-8"
                  >
                    Next: Budget
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: BUDGET */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
                <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
                  <Wallet size={20} className="text-royal-blue" />
                  Budget & Timeline
                </h2>

                <div className="space-y-6">
                  {/* Budget Type Toggle */}
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-3">
                      Budget Type
                    </label>
                    <div className="inline-flex bg-slate-100 rounded-xl p-1">
                      <button
                        onClick={() => handleInputChange("budgetType", "fixed")}
                        className={cn(
                          "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                          formData.budgetType === "fixed"
                            ? "bg-white text-navy shadow-sm"
                            : "text-slate-500 hover:text-navy",
                        )}
                      >
                        Fixed Price
                      </button>
                      <button
                        onClick={() =>
                          handleInputChange("budgetType", "hourly")
                        }
                        className={cn(
                          "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                          formData.budgetType === "hourly"
                            ? "bg-white text-navy shadow-sm"
                            : "text-slate-500 hover:text-navy",
                        )}
                      >
                        Hourly Rate
                      </button>
                    </div>
                  </div>

                  {/* Budget Range */}
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">
                      Budget Range (INR) <span className="text-red-500">*</span>
                    </label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          Minimum
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            ₹
                          </span>
                          <Input
                            type="number"
                            placeholder="5,000"
                            value={formData.minBudget}
                            onChange={(e) =>
                              handleInputChange("minBudget", e.target.value)
                            }
                            className="h-12 pl-8 border-slate-200 focus:border-teal focus:ring-teal"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          Maximum
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            ₹
                          </span>
                          <Input
                            type="number"
                            placeholder="25,000"
                            value={formData.maxBudget}
                            onChange={(e) =>
                              handleInputChange("maxBudget", e.target.value)
                            }
                            className="h-12 pl-8 border-slate-200 focus:border-teal focus:ring-teal"
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {formData.budgetType === "hourly"
                        ? "Per hour rate range"
                        : "Total project budget range"}
                    </p>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">
                      Project Deadline <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <Input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) =>
                          handleInputChange("deadline", e.target.value)
                        }
                        className="h-12 pl-12 border-slate-200 focus:border-teal focus:ring-teal"
                      />
                    </div>
                  </div>

                  {/* Visibility */}
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-3">
                      Project Visibility
                    </label>
                    <div className="p-4 rounded-xl border-2 border-teal bg-teal/5">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 mt-0.5 rounded-full bg-teal border-2 border-teal flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-teal" />
                            <p className="font-semibold text-navy">Public</p>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            All freelancers can see and apply to this project
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="border-slate-300 text-slate-600"
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

            {/* STEP 4: REVIEW */}
            {currentStep === 4 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
                <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
                  <Eye size={20} className="text-royal-blue" />
                  Review Your Project
                </h2>

                {/* Project Preview */}
                <div className="space-y-6">
                  {/* Project Details Section */}
                  <div className="p-5 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-navy flex items-center gap-2">
                        <FileText size={16} className="text-teal" />
                        Project Details
                      </h3>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-teal hover:underline text-sm flex items-center gap-1"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <div>
                        <p className="text-xs text-slate-500 uppercase">
                          Title
                        </p>
                        <p className="font-medium text-navy">
                          {formData.title || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">
                          Categories
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {formData.categories.length > 0 ? (
                            formData.categories.map((cat) => (
                              <span
                                key={cat}
                                className="px-2 py-1 bg-teal/10 text-teal rounded-md text-xs font-medium"
                              >
                                {cat}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-sm">
                              Not specified
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">
                          Description
                        </p>
                        <p className="text-slate-600 text-sm">
                          {formData.description || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Requirements Section */}
                  <div className="p-5 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-navy flex items-center gap-2">
                        <ClipboardList size={16} className="text-teal" />
                        Requirements
                      </h3>
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="text-teal hover:underline text-sm flex items-center gap-1"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <div>
                        <p className="text-xs text-slate-500 uppercase">
                          Required Skills
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {formData.skills.length > 0 ? (
                            formData.skills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-1 bg-teal/10 text-teal rounded-md text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-sm">
                              Not specified
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-slate-500 uppercase">
                            Experience Level
                          </p>
                          <p className="font-medium text-navy capitalize">
                            {formData.experienceLevel || "Any"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase">
                            Duration
                          </p>
                          <p className="font-medium text-navy">
                            {formData.duration || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase">
                            Location Preference
                          </p>
                          <p className="font-medium text-navy capitalize">
                            {formData.location}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">
                          Project Location
                        </p>
                        <p className="font-medium text-navy">
                          {formData.city && formData.country
                            ? `${formData.city}, ${formData.country}`
                            : formData.city ||
                              formData.country ||
                              "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Budget Section */}
                  <div className="p-5 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-navy flex items-center gap-2">
                        <Wallet size={16} className="text-teal" />
                        Budget & Timeline
                      </h3>
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="text-teal hover:underline text-sm flex items-center gap-1"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-slate-500 uppercase">
                          Budget Type
                        </p>
                        <p className="font-medium text-navy capitalize">
                          {formData.budgetType} Price
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">
                          Budget Range
                        </p>
                        <p className="font-medium text-navy">
                          {formData.minBudget && formData.maxBudget
                            ? `₹${parseInt(formData.minBudget).toLocaleString()} - ₹${parseInt(formData.maxBudget).toLocaleString()}`
                            : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">
                          Deadline
                        </p>
                        <p className="font-medium text-navy">
                          {formData.deadline
                            ? new Date(formData.deadline).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="p-4 border-2 border-slate-200 rounded-xl">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={(e) =>
                          handleInputChange("termsAccepted", e.target.checked)
                        }
                        className="mt-1 w-5 h-5 rounded border-slate-300 text-teal focus:ring-teal"
                      />
                      <span className="text-sm text-slate-600">
                        I agree to the{" "}
                        <Link to="/terms" className="text-teal hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          to="/privacy"
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
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="border-slate-300 text-slate-600"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.termsAccepted || isSubmitting}
                    className="bg-teal hover:bg-teal-light text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles size={18} className="mr-2" />
                    {isEditing ? "Update Project" : "Post Project"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR - Tips */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Tips Card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Lightbulb size={18} className="text-gold" />
                  </div>
                  <h3 className="font-semibold text-navy">
                    Tips for a Great Post
                  </h3>
                </div>

                <ul className="space-y-3">
                  {[
                    "Write a clear, descriptive title",
                    "Include specific deliverables",
                    "Set a realistic budget range",
                    "Add reference files or examples",
                    "Mention your timeline clearly",
                    "List required skills accurately",
                  ].map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <CheckCircle
                        size={14}
                        className="text-teal mt-0.5 flex-shrink-0"
                      />
                      {tip}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-4 border-t border-slate-100">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-teal" />
            </div>
            <h3 className="text-2xl font-bold text-navy mb-2">
              Project Posted Successfully!
            </h3>
            <p className="text-slate-500 mb-6">
              Your project is now live. Freelancers will start applying soon.
              You'll receive notifications for new applications.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/client/dashboard")}
                className="flex-1 border-slate-300 text-slate-600"
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={() => navigate("/client/projects")}
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

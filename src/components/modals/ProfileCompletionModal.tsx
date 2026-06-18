import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { X, Plus, Search, Loader2, Check } from "lucide-react";
import freelancerService from "@/services/freelancer.service";
import { publicService } from "@/services/public.service";

const CATEGORIES = [
  { label: "Editing", color: "bg-blue-500" },
  { label: "VFX", color: "bg-purple-500" },
  { label: "3D Design", color: "bg-amber-500" },
  { label: "Motion Graphics", color: "bg-pink-500" },
  { label: "Admin & support", color: "bg-slate-500" },
  { label: "Design & creative", color: "bg-rose-500" },
  { label: "Marketing", color: "bg-orange-500" },
  { label: "Writing & content", color: "bg-emerald-500" },
  { label: "AI & emerging tech", color: "bg-violet-500" },
  { label: "Development & tech", color: "bg-cyan-500" },
  { label: "Video, audio & animation", color: "bg-red-500" },
  { label: "Finance & Accounting", color: "bg-teal-600" },
  { label: "Photography", color: "bg-indigo-500" },
  { label: "Videography", color: "bg-fuchsia-500" },
  { label: "Wedding & Events", color: "bg-rose-400" },
  { label: "Thumbnail Design", color: "bg-yellow-500" },
  { label: "Education", color: "bg-sky-500" },
];

interface SkillOption {
  _id: string;
  skillName: string;
  category: string;
}

interface SelectedSkill {
  skillId: string;
  name: string;
  proficiency: number;
}

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose?: () => void;
  message?: string;
}

export default function ProfileCompletionModal({
  isOpen,
  onComplete,
  onClose,
  message,
}: ProfileCompletionModalProps) {
  const queryClient = useQueryClient();
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [skills, setSkills] = useState<SelectedSkill[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [skillResults, setSkillResults] = useState<SkillOption[]>([]);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [allSkills, setAllSkills] = useState<SkillOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const skillSearchRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    }
    return () => {
      const top = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (top) {
        window.scrollTo(0, parseInt(top || "0", 10) * -1);
      }
    };
  }, [isOpen]);

  const preventBodyScroll = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, skillsRes] = await Promise.all([
          freelancerService.getMyProfile(),
          publicService.getCategoriesWithSkills(),
        ]);
        const profile = (profileRes as any).data || profileRes;
        setHeadline(profile.headline || "");
        setBio(profile.bio || "");
        setContactInfo(profile.contactInfo || "");
        setSelectedCategories(profile.categories || []);
        setSkills(
          (profile.skills || []).map((s: any) => ({
            skillId: s.skillId || s._id || "",
            name: s.name,
            proficiency: s.proficiency || 3,
          }))
        );

        const cats = (skillsRes as any).data || skillsRes;
        const flat: SkillOption[] = [];
        for (const cat of cats) {
          for (const sk of cat.skills || []) {
            flat.push({
              _id: sk._id,
              skillName: sk.skillName,
              category: cat.name,
            });
          }
        }
        setAllSkills(flat);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    if (isOpen) load();
  }, [isOpen]);

  useEffect(() => {
    if (!skillInput.trim()) {
      setSkillResults([]);
      setShowSkillDropdown(false);
      return;
    }
    const q = skillInput.toLowerCase();
    const matched = allSkills
      .filter(
        (s) =>
          s.skillName.toLowerCase().includes(q) &&
          !skills.some((sk) => sk.skillId === s._id)
      )
      .slice(0, 8);
    setSkillResults(matched);
    setShowSkillDropdown(matched.length > 0);
  }, [skillInput, allSkills, skills]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        skillSearchRef.current &&
        !skillSearchRef.current.contains(e.target as Node)
      ) {
        setShowSkillDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addSkill = useCallback(
    (opt: SkillOption) => {
      if (skills.length >= 15) return;
      if (skills.some((s) => s.skillId === opt._id)) return;
      setSkills([
        ...skills,
        { skillId: opt._id, name: opt.skillName, proficiency: 3 },
      ]);
      setSkillInput("");
      setShowSkillDropdown(false);
    },
    [skills]
  );

  const removeSkill = (skillId: string) => {
    setSkills(skills.filter((s) => s.skillId !== skillId));
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const isStep1Valid = headline.trim().length >= 3 && selectedCategories.length > 0 && contactInfo.trim().length > 0;
  const isStep2Valid = skills.length >= 3;
  const canSubmit = isStep1Valid && isStep2Valid;

  const handleSave = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await freelancerService.updateProfile({
        headline: headline.trim(),
        bio: bio.trim(),
        contactInfo: contactInfo.trim(),
        categories: selectedCategories,
        skills,
      } as any);
      await queryClient.invalidateQueries({ queryKey: ["myFreelancerProfile"] });
      onComplete();
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg" hideClose>
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-teal mb-4" />
            <p className="text-sm text-slate-500">Loading your profile...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleClose = () => {
    onClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent
        className="sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] p-0"
        hideClose
        onTouchMove={preventBodyScroll}
      >
        <div
          ref={scrollRef}
          className="flex flex-col h-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto overscroll-contain"
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="p-5 sm:p-6">
            <DialogHeader className="relative">
              <button
                onClick={handleClose}
                className="absolute right-0 top-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
              <DialogTitle className="text-xl font-bold text-navy dark:text-white pr-8">
                Complete Your Profile
              </DialogTitle>
              {message && (
                <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30 rounded-xl">
                  <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                    {message}
                  </p>
                </div>
              )}
              <DialogDescription className="text-slate-500 text-sm">
                {step === 1
                  ? "Tell us about yourself so clients can find you."
                  : "Add your skills to show your expertise."}
              </DialogDescription>
            </DialogHeader>

            {/* Progress */}
            <div className="flex gap-2 mt-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn("text-xs font-bold", step >= 1 ? "text-teal" : "text-slate-400")}>
                    Profile
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10">
                  <div
                    className={cn("h-full rounded-full transition-all", step >= 1 ? "bg-teal w-full" : "w-0")}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn("text-xs font-bold", step >= 2 ? "text-teal" : "text-slate-400")}>
                    Skills
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10">
                  <div
                    className={cn("h-full rounded-full transition-all", step >= 2 ? "bg-teal w-full" : "w-0")}
                  />
                </div>
              </div>
            </div>

            {step === 1 ? (
              <div className="space-y-5">
                {/* Headline */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Professional Headline *
                  </label>
                  <Input
                    placeholder="e.g. Professional Video Editor & Motion Graphics Artist"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    maxLength={120}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    {headline.length}/120
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Short Bio
                  </label>
                  <Textarea
                    placeholder="Tell clients about your experience and what you do best..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                  <p className="text-xs text-slate-400 mt-1">{bio.length}/500</p>
                </div>

                {/* Contact Info */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Email or Phone *
                  </label>
                  <Input
                    placeholder="e.g. your@email.com or 9876543210"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    maxLength={100}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Clients will use this to reach you
                  </p>
                </div>

                {/* Categories */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                    Your Categories *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => {
                      const isSelected = selectedCategories.includes(cat.label);
                      return (
                        <button
                          key={cat.label}
                          type="button"
                          onClick={() => toggleCategory(cat.label)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-left",
                            isSelected
                              ? "bg-teal/5 text-navy dark:text-white border-teal/40"
                              : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                          )}
                        >
                          <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", cat.color)} />
                          <span className="truncate">{cat.label}</span>
                          {isSelected && <Check size={12} className="ml-auto shrink-0 text-teal" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Skills */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Skills * (min 3)
                    </label>
                    <span className="text-xs text-slate-400">{skills.length}/15</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1.5 mb-4">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        skills.length >= 3 ? "bg-teal" : "bg-amber-400"
                      )}
                      style={{ width: `${Math.min((skills.length / 15) * 100, 100)}%` }}
                    />
                  </div>

                  {/* Selected skills */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {skills.map((sk) => (
                        <div
                          key={sk.skillId}
                          className="flex items-center gap-1.5 bg-teal/10 text-teal px-3 py-1.5 rounded-full text-xs font-bold"
                        >
                          {sk.name}
                          <button
                            onClick={() => removeSkill(sk.skillId)}
                            className="hover:text-red-500 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skill search */}
                  <div ref={skillSearchRef} className="relative">
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <Input
                        placeholder="Type a skill name..."
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && skillResults.length > 0) {
                            e.preventDefault();
                            addSkill(skillResults[0]);
                          }
                        }}
                        className="pl-9 rounded-xl"
                      />
                    </div>

                    {showSkillDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                        {skillResults.map((opt) => (
                          <button
                            key={opt._id}
                            onClick={() => addSkill(opt)}
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 text-sm flex items-center justify-between transition-colors"
                          >
                            <span className="font-medium text-navy dark:text-white">
                              {opt.skillName}
                            </span>
                            <span className="text-xs text-slate-400">
                              {opt.category}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Suggested skills */}
                  <div className="mt-4">
                    <p className="text-xs text-slate-400 mb-2">Quick add:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allSkills
                        .filter((s) => !skills.some((sk) => sk.skillId === s._id))
                        .slice(0, 8)
                        .map((opt) => (
                          <button
                            key={opt._id}
                            onClick={() => addSkill(opt)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium hover:bg-teal/10 hover:text-teal transition-colors"
                          >
                            <Plus size={12} />
                            {opt.skillName}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer - sticky bottom */}
          <div className="sticky bottom-0 bg-white dark:bg-[#111827] border-t border-slate-100 dark:border-white/5 p-5 sm:p-6 shrink-0">
            <div className="flex gap-3">
              {step === 2 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-xl font-bold h-12"
                >
                  Back
                </Button>
              )}
              {step === 1 ? (
                <Button
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid}
                  className="flex-1 rounded-xl font-bold bg-teal hover:bg-[#128a7f] text-white h-12"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={!canSubmit || saving}
                  className="flex-1 rounded-xl font-bold bg-teal hover:bg-[#128a7f] text-white h-12"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin mr-2" />
                  ) : null}
                  Save Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

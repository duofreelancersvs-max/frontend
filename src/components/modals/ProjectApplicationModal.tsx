import { useState } from "react";

import { CustomDatePicker } from "@/components/common/CustomDatePicker";
import { useNavigate } from "react-router-dom";
import {
  X,
  Star,
  Clock,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { applicationService } from "@/services";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { PlanLimitWarning } from "@/components/feature-gate";
import { useUpgradeModalStore } from "@/stores/upgrade-modal.store";
import type { PlanErrorMeta, PlanErrorCode } from "@/types/feature-gate.types";
import { useQueryClient } from "@tanstack/react-query";

interface ProjectData {
  id: string;
  title: string;
  client: {
    name: string;
    rating: number;
    reviews: number;
    verified: boolean;
  };
  deadline?: string;
  questions?: string[];
}

interface ProjectApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (conversationId?: string) => void;
  project: ProjectData;
}



const ProjectApplicationModal = ({
  isOpen,
  onClose,
  onSuccess,
  project,
}: ProjectApplicationModalProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const gate = useFeatureGate();
  const [coverLetter, setCoverLetter] = useState("");
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [questionAnswers, setQuestionAnswers] = useState<{
    [key: number]: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const openUpgradeModal = useUpgradeModalStore((s) => s.open);

  const isGateClosed = gate.featureGatesEnabled && !gate.canApply;
  const maxCoverLetterLength = 1000;

  const handleQuestionChange = (index: number, value: string) => {
    setQuestionAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!coverLetter.trim()) {
      newErrors.coverLetter = "Cover letter is required";
    } else if (coverLetter.length < 50) {
      newErrors.coverLetter = "Cover letter must be at least 50 characters";
    }


    if (!estimatedCompletionDate) {
      newErrors.estimatedCompletionDate = "Please select a target completion date";
    }

    if (!proposedRate) {
      newErrors.proposedRate = "Proposed rate is required";
    } else if (isNaN(Number(proposedRate)) || Number(proposedRate) <= 0) {
      newErrors.proposedRate = "Please enter a valid amount";
    }

    if (project.questions) {
      project.questions.forEach((_, index) => {
        if (!questionAnswers[index]?.trim()) {
          newErrors[`question_${index}`] = "This question is required";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Pre-flight gate: if the user has hit the limit, surface the upgrade
    // modal instead of burning a round-trip to the server.
    if (isGateClosed) {
      openUpgradeModal("limit", {
        limit: gate.usage?.limit,
        current: gate.usage?.used,
        resetsAt: gate.usage?.resetsAt,
        planName: gate.context?.planName,
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await applicationService.apply({
        projectId: String(project.id),
        coverLetter: coverLetter.trim(),
        estimatedCompletionDate: estimatedCompletionDate,
        proposedRate: Number(proposedRate),
      });
      const convId = (result as any)?.conversationId;

      // Server returned a fresh usage snapshot — refetch the gate so other
      // parts of the UI (banner, indicator) update in lock-step.
      gate.refetch();
      
      // Invalidate applications query to ensure "Apply Now" updates to "Applied"
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });

      handleClose();

      if (onSuccess) {
        onSuccess(convId);
      } else if (convId) {
        navigate("/freelancer/messages", {
          state: { conversationId: convId },
        });
      } else {
        navigate("/freelancer/applications");
      }
    } catch (err: any) {
      console.error("[ProjectApplicationModal] Submit error:", err);
      const code: PlanErrorCode | undefined = err?.data?.error?.code;
      const meta: PlanErrorMeta | undefined = err?.data?.error?.meta;
      if (
        code === "PLAN_LIMIT_EXCEEDED" ||
        code === "TRIAL_EXPIRED" ||
        code === "UPGRADE_REQUIRED" ||
        code === "FEATURE_NOT_AVAILABLE"
      ) {
        openUpgradeModal(
          code === "TRIAL_EXPIRED"
            ? "trial_expired"
            : code === "FEATURE_NOT_AVAILABLE"
              ? "feature_locked"
              : "limit",
          meta,
        );
        gate.refetch();
        return;
      }
      // Try to extract the clearest message from the error object
      const msg =
        err.message ||
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to submit application. Please try again.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form state
    setCoverLetter("");
    setEstimatedCompletionDate("");
    setProposedRate("");
    setQuestionAnswers({});
    setErrors({});
    setSubmitError(null);
    setSubmitError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85dvh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-transparent dark:border-white/5">
            {/* HEADER */}
            <div className="flex items-start justify-between p-4 sm:p-5 lg:p-6 border-b border-slate-100 dark:border-white/5 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-navy dark:text-white">
                  Apply for Project
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {project.title}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors -mr-2 -mt-2 animate-all"
              >
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-6">
              {/* Plan limit / usage warning */}
              <PlanLimitWarning />
              {/* PROJECT SUMMARY */}
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-transparent dark:border-white/5">
                <h3 className="text-sm font-semibold text-navy dark:text-white mb-3">
                  Project Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">Client</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-navy dark:text-white text-sm leading-tight">
                        {project.client.name}
                      </span>
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gold/10 rounded-lg shrink-0">
                        <Star size={10} className="text-gold fill-gold" />
                        <span className="text-xxs font-bold text-gold">
                          {project.client.rating || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  {project.deadline && (
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Deadline</p>
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-slate-400 dark:text-slate-500" />
                        <span className="font-medium text-navy dark:text-white text-sm">
                          {new Date(project.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* APPLICATION FORM */}
              <div className="space-y-5">
                {/* Cover Letter */}
                <div>
                  <label className="block text-sm font-medium text-navy dark:text-slate-200 mb-2">
                    Cover Letter *
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={5}
                    maxLength={maxCoverLetterLength}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all text-navy dark:text-white bg-white dark:bg-white/5 resize-none",
                      errors.coverLetter
                        ? "border-red-300 dark:border-red-500/50 focus:border-red-400 focus:ring-red-100 dark:focus:ring-red-950/30"
                        : "border-slate-200 dark:border-white/10 focus:border-teal focus:ring-teal/20",
                    )}
                    placeholder="Introduce yourself and explain why you're a good fit for this project. Highlight your relevant experience and what makes you unique..."
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    {errors.coverLetter ? (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.coverLetter}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Minimum 50 characters
                      </p>
                    )}
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {coverLetter.length}/{maxCoverLetterLength}
                    </p>
                  </div>
                </div>

                  {/* Estimated Completion Date */}
                  <div>
                    <label className="block text-sm font-medium text-navy dark:text-slate-200 mb-2">
                      Target Completion Date *
                    </label>
                    <CustomDatePicker
                      value={estimatedCompletionDate}
                      onChange={setEstimatedCompletionDate}
                      minDate={new Date()}
                    />
                    {errors.estimatedCompletionDate && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1.5">
                        <AlertCircle size={12} />
                        {errors.estimatedCompletionDate}
                      </p>
                    )}
                  </div>

                  {/* Proposed Rate */}
                  <div>
                    <label className="block text-sm font-medium text-navy dark:text-slate-200 mb-2">
                      Proposed Rate *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-450 text-sm font-semibold">₹</span>
                      <input
                        type="number"
                        value={proposedRate}
                        onChange={(e) => setProposedRate(e.target.value)}
                        placeholder="Enter your rate amount"
                        className={cn(
                          "w-full pl-8 pr-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all text-navy dark:text-white bg-white dark:bg-white/5",
                          errors.proposedRate
                            ? "border-red-300 dark:border-red-500/50 focus:border-red-400 focus:ring-red-100 dark:focus:ring-red-950/30"
                            : "border-slate-200 dark:border-white/10 focus:border-teal focus:ring-teal/20",
                        )}
                      />
                    </div>
                    {errors.proposedRate && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1.5">
                        <AlertCircle size={12} />
                        {errors.proposedRate}
                      </p>
                    )}
                  </div>

                {/* Client Questions */}
                {project.questions && project.questions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-navy dark:text-white border-t border-slate-100 dark:border-white/5 pt-5">
                      Client Questions
                    </h3>
                    {project.questions.map((question, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-navy dark:text-slate-200 mb-2">
                          {index + 1}. {question} *
                        </label>
                        <textarea
                          value={questionAnswers[index] || ""}
                          onChange={(e) =>
                             handleQuestionChange(index, e.target.value)
                          }
                          rows={3}
                          className={cn(
                            "w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all text-navy dark:text-white bg-white dark:bg-white/5 resize-none",
                            errors[`question_${index}`]
                              ? "border-red-300 dark:border-red-500/50 focus:border-red-400 focus:ring-red-100 dark:focus:ring-red-950/30"
                              : "border-slate-200 dark:border-white/10 focus:border-teal focus:ring-teal/20",
                          )}
                          placeholder="Enter your answer..."
                        />
                         {errors[`question_${index}`] && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle size={12} />
                            {errors[`question_${index}`]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-4 sm:p-5 lg:p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 shrink-0">
              {/* Submit Error */}
              {submitError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg mb-4 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle
                    size={16}
                    className="text-red-500 shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
                </div>
              )}


              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="w-full sm:flex-1 border-slate-200 dark:border-white/10 text-navy dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  className="w-full sm:flex-1 bg-teal hover:bg-teal-light text-white"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isGateClosed}
                  title={isGateClosed ? "You've reached your application limit" : undefined}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : isGateClosed ? (
                    <>
                      <Lock size={14} className="mr-1" />
                      Upgrade to apply
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </div>
      </div>
    </div>
  );
};

export default ProjectApplicationModal;

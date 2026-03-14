import { useState } from "react";
import {
  X,
  Star,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { applicationService } from "@/services";

interface ProjectData {
  id: string;
  title: string;
  client: {
    name: string;
    rating: number;
    reviews: number;
    verified: boolean;
  };
  budget: {
    type: string;
    minAmount: number;
    maxAmount: number;
    currency?: string;
  };
  deadline?: string;
  questions?: string[];
}

interface ProjectApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  project: ProjectData;
  applicationsRemaining?: number;
  subscriptionPlan?: "Free" | "Pro" | "Premium";
}

const durationOptions = [
  { value: "7", label: "Less than 1 week" },
  { value: "14", label: "1-2 weeks" },
  { value: "28", label: "2-4 weeks" },
  { value: "60", label: "1-2 months" },
  { value: "90", label: "2+ months" },
];

const ProjectApplicationModal = ({
  isOpen,
  onClose,
  onSuccess,
  project,
  applicationsRemaining = 5,
  subscriptionPlan = "Free",
}: ProjectApplicationModalProps) => {
  const [coverLetter, setCoverLetter] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [questionAnswers, setQuestionAnswers] = useState<{
    [key: number]: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

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


    if (!estimatedDuration) {
      newErrors.estimatedDuration = "Please select an estimated duration";
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

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await applicationService.apply({
        projectId: String(project.id),
        coverLetter: coverLetter.trim(),
        estimatedDuration: parseInt(estimatedDuration, 10),
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: { message?: string; error?: { message?: string } };
        };
      };
      const msg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to submit application. Please try again.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form state
    setCoverLetter("");
    setEstimatedDuration("");
    setQuestionAnswers({});
    setErrors({});
    setSubmitError(null);
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* SUCCESS STATE */}
        {isSuccess ? (
          <div className="p-8 text-center">
            {/* Success Animation */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success-green/10 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-success-green flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle size={40} className="text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-navy mb-2">
              Application Submitted!
            </h2>
            <p className="text-slate-500 mb-6">
              Your application for "{project.title}" has been sent to the
              client. They will review it and get back to you soon.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  handleClose();
                  if (onSuccess) {
                    onSuccess();
                  } else {
                    window.location.href = "/freelancer/applications";
                  }
                }}
                className="w-full bg-teal hover:bg-teal-light text-white"
              >
                {onSuccess ? "Go to Messages" : "View My Applications"}
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full border-slate-200"
              >
                Continue Browsing
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="flex items-start justify-between p-5 lg:p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-navy">
                  Apply for Project
                </h2>
                <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                  {project.title}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors -mr-2 -mt-2"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-6">
              {/* PROJECT SUMMARY */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-navy mb-3">
                  Project Summary
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Client</p>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-navy text-sm">
                        {project.client.name}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <Star size={12} className="text-gold fill-gold" />
                        <span className="text-xs text-slate-600">
                          {project.client.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Budget</p>
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} className="text-success-green" />
                      <span className="font-medium text-navy text-sm">
                        ₹{(project.budget.minAmount || 0).toLocaleString()} - ₹
                        {(project.budget.maxAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {project.deadline && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Deadline</p>
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-slate-400" />
                        <span className="font-medium text-navy text-sm">
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
                  <label className="block text-sm font-medium text-navy mb-2">
                    Cover Letter *
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={5}
                    maxLength={maxCoverLetterLength}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all text-navy resize-none",
                      errors.coverLetter
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-teal focus:ring-teal/20",
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
                      <p className="text-xs text-slate-400">
                        Minimum 50 characters
                      </p>
                    )}
                    <p className="text-xs text-slate-400">
                      {coverLetter.length}/{maxCoverLetterLength}
                    </p>
                  </div>
                </div>

                  {/* Estimated Duration */}
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">
                      Estimated Duration *
                    </label>
                    <select
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all text-navy bg-white",
                        errors.estimatedDuration
                          ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                          : "border-slate-200 focus:border-teal focus:ring-teal/20",
                      )}
                    >
                      <option value="">Select duration</option>
                      {durationOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {errors.estimatedDuration && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1.5">
                        <AlertCircle size={12} />
                        {errors.estimatedDuration}
                      </p>
                    )}
                  </div>



                {/* Client Questions */}
                {project.questions && project.questions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-navy border-t border-slate-100 pt-5">
                      Client Questions
                    </h3>
                    {project.questions.map((question, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-navy mb-2">
                          {index + 1}. {question} *
                        </label>
                        <textarea
                          value={questionAnswers[index] || ""}
                          onChange={(e) =>
                            handleQuestionChange(index, e.target.value)
                          }
                          rows={3}
                          className={cn(
                            "w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all text-navy resize-none",
                            errors[`question_${index}`]
                              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                              : "border-slate-200 focus:border-teal focus:ring-teal/20",
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
            <div className="p-5 lg:p-6 border-t border-slate-100 bg-slate-50">
              {/* Submit Error */}
              {submitError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg mb-4">
                  <AlertCircle
                    size={16}
                    className="text-red-500 shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}

              {/* Applications Remaining (for Free plan) */}
              {subscriptionPlan === "Free" && (
                <p className="text-xs text-slate-500 text-center mb-4 flex items-center justify-center gap-1">
                  <AlertCircle size={12} />
                  You have {applicationsRemaining} applications remaining this
                  month.{" "}
                  <a
                    href="/freelancer/subscription"
                    className="text-teal font-medium hover:underline"
                  >
                    Upgrade
                  </a>
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-200"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-teal hover:bg-teal-light text-white"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectApplicationModal;

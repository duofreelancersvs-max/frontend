import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { reviewService } from "@/services";
import { toast } from "react-toastify";

interface ReviewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  freelancerId: string;
  freelancerName: string;
  onSuccess?: () => void;
}

const ReviewProjectModal = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  freelancerId,
  freelancerName,
  onSuccess,
}: ReviewProjectModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setIsSubmitting(true);
      await reviewService.create({
        projectId,
        revieweeId: freelancerId,
        rating,
        comment,
      });
      toast.success("Review submitted successfully!");
      onSuccess?.();
      onClose();
      // Reset form
      setRating(0);
      setComment("");
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-navy text-xl">Review Project</DialogTitle>
          <DialogDescription>
            Share your experience working with {freelancerName} on "{projectTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-slate-600">Your Rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={36}
                    className={cn(
                      "transition-colors",
                      (hoverRating || rating) >= star
                        ? "text-gold fill-gold"
                        : "text-slate-200"
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm font-bold text-teal">
              {rating === 5 ? "Excellent!" : 
               rating === 4 ? "Very Good!" :
               rating === 3 ? "Good" :
               rating === 2 ? "Fair" :
               rating === 1 ? "Poor" : ""}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">
              Your Review
            </label>
            <Textarea
              placeholder="What was it like working with this freelancer? (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] border-slate-200 focus:border-teal focus:ring-teal"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 font-sans">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-teal hover:bg-teal-light text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewProjectModal;

import React from "react";
import { Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  quote: string;
  authorName: string;
  authorTitle: string;
  authorImage: string;
  rating?: number;
  className?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  authorName,
  authorTitle,
  authorImage,
  rating = 5,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl p-6 shadow-sm border border-slate-100 relative hover:shadow-md transition-shadow",
        className,
      )}
    >
      <div className="absolute top-6 left-6">
        <Quote size={40} className="text-teal/10 fill-teal/10" />
      </div>

      <div className="relative z-10 pt-4">
        <p className="text-text-secondary italic font-medium leading-relaxed mb-6">
          "{quote}"
        </p>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 bg-slate-200">
            <img
              src={authorImage}
              alt={authorName}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h4 className="font-bold text-text-primary text-sm">
              {authorName}
            </h4>
            <div className="text-xs text-text-secondary">{authorTitle}</div>
          </div>

          <div className="ml-auto flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={cn(
                  "fill-current",
                  i < Math.floor(rating) ? "text-gold" : "text-slate-200",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;

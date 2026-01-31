import React from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number; // 0 to 5
  showCount?: boolean;
  count?: number; // Number of ratings
  size?: number;
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  showCount = false,
  count,
  size = 16,
  className,
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={size} className="fill-gold text-gold" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <StarHalf size={size} className="fill-gold text-gold" />
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            size={size}
            className="fill-page-bg text-slate-200"
          />
        ))}
      </div>

      {(showCount || count !== undefined) && (
        <div className="flex items-baseline gap-1 ml-1">
          <span className="font-bold text-text-primary text-sm">{rating}</span>
          {count !== undefined && (
            <span className="text-xs text-text-secondary">({count})</span>
          )}
        </div>
      )}
    </div>
  );
};

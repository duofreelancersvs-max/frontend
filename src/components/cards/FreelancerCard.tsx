import React from "react";
import { Star, MapPin, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FreelancerCardProps {
  name: string;
  title: string;
  rating: number;
  reviewCount: number;

  location: string;
  skills: string[];
  imageUrl: string;
  coverUrl?: string;
  isVerified?: boolean;
  /**
   * True when the freelancer has an active Pro plan. Renders a teal
   * "Pro Member" badge in the top-right corner of the cover image.
   */
  isPro?: boolean;
  /**
   * True when the freelancer is being boosted to the top of search
   * results. Renders a teal "Featured" ribbon across the cover image.
   */
  isFeatured?: boolean;
  onViewProfile?: () => void;
  className?: string;
}

const FreelancerCard: React.FC<FreelancerCardProps> = ({
  name,
  title,
  rating,
  reviewCount,

  location,
  skills,
  imageUrl,
  coverUrl,
  isVerified = false,
  isPro = false,
  isFeatured = false,
  onViewProfile,
  className,
}) => {
  return (
    <div
      className={cn(
        "w-[280px] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group",
        className,
      )}
    >
      {/* Cover Image */}
      <div className="h-[100px] w-full bg-slate-100 relative">
        {coverUrl && (
          <img
            src={coverUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}

        {isFeatured && (
          <div
            data-testid="featured-ribbon"
            className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-teal-500 text-white text-xxs font-bold uppercase tracking-wide shadow-md"
          >
            <Zap size={10} className="fill-white" />
            Featured
          </div>
        )}

        {isPro && (
          <div
            data-testid="pro-member-badge"
            className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/90 backdrop-blur-sm border border-teal-500/30 text-teal-700 text-xxs font-bold shadow-md"
            title="Pro Member"
          >
            <Zap size={10} className="fill-teal-500 text-teal-500" />
            Pro
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-5 pb-5 pt-0 flex flex-col items-center -mt-10 flex-grow relative z-10">
        {/* Avatar */}
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-sm overflow-hidden bg-slate-200">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          {isVerified && (
            <div className="absolute bottom-1 right-1 bg-white rounded-full p-0.5 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-success-green fill-success-green/10" />
            </div>
          )}
        </div>

        {/* Name & Title */}
        <h3 className="text-lg font-bold text-text-primary text-center leading-tight mb-1 group-hover:text-royal-blue transition-colors">
          {name}
        </h3>
        <p className="text-sm text-text-secondary text-center mb-3 line-clamp-1">
          {title}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4 bg-page-bg py-1.5 px-3 rounded-full">
          <Star className="w-4 h-4 text-gold fill-gold" />
          <span className="font-semibold text-text-primary text-sm">
            {rating}
          </span>
          <span className="text-text-secondary text-xs">({reviewCount})</span>
        </div>

        {/* Details Row */}
        <div className="w-full flex justify-center items-center text-sm text-text-secondary mb-4 px-2">
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-text-secondary" />
            <span className="truncate max-w-[120px]">{location}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 justify-center mb-5 w-full">
          {skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 bg-page-bg text-text-secondary text-xs font-medium rounded-md border border-slate-100"
            >
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="px-2 py-1 text-text-secondary text-xxs font-medium">
              + {skills.length - 3}
            </span>
          )}
        </div>

        {/* CTA */}
        <Button
          variant="navy"
          className="w-full shadow-md"
          onClick={onViewProfile}
        >
          View Profile
        </Button>
      </div>
    </div>
  );
};

export default FreelancerCard;

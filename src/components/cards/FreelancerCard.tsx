import React from "react";
import { Star, MapPin, CheckCircle2 } from "lucide-react";
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
      </div>

      {/* Profile Info */}
      <div className="px-5 pb-5 pt-0 flex flex-col items-center -mt-[40px] flex-grow relative z-10">
        {/* Avatar */}
        <div className="relative mb-3">
          <div className="w-[80px] h-[80px] rounded-full border-4 border-white shadow-sm overflow-hidden bg-slate-200">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          {isVerified && (
            <div className="absolute bottom-1 right-1 bg-white rounded-full p-[2px] shadow-sm">
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
              className="px-2.5 py-1 bg-page-bg text-text-secondary text-[11px] font-medium rounded-md border border-slate-100"
            >
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="px-2 py-1 text-text-secondary text-[10px] font-medium">
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

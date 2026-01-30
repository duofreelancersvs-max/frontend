import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillTagProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

export const SkillTag: React.FC<SkillTagProps> = ({
  label,
  onRemove,
  className,
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal/10 text-teal border border-teal/20 transition-colors",
        onRemove && "pr-1 hover:bg-teal/20",
        className,
      )}
    >
      {label}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-0.5 hover:bg-teal/20 rounded-full transition-colors"
          aria-label={`Remove ${label}`}
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
};

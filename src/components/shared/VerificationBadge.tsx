import React from "react";
import { CheckCircle2, Crown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  type: "basic" | "premium";
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  type,
  className,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center justify-center cursor-help",
              className,
            )}
          >
            {type === "premium" ? (
              <div className="bg-gold/10 rounded-full p-1 border border-gold/20">
                <Crown size={14} className="text-gold fill-gold" />
              </div>
            ) : (
              <CheckCircle2
                size={18}
                className="text-success-green fill-white"
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {type === "premium" ? "Premium Verified" : "Verified Freelancer"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

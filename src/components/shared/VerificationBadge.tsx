import React from "react";
import { CheckCircle2, Zap } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  type: "basic" | "pro";
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
            {type === "pro" ? (
              <div className="bg-teal-500/10 rounded-full p-1 border border-teal-500/30">
                <Zap size={14} className="text-teal-600 fill-teal-500" />
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
            {type === "pro" ? "Pro Member" : "Verified Freelancer"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

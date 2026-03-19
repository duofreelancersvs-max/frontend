import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  isDark?: boolean;
  withText?: boolean;
  size?: "sm" | "md" | "lg";
}

const Logo: React.FC<LogoProps> = ({
  className,
  isDark = false,
  withText = true,
  size = "md",
}) => {
  const iconSizes = {
    sm: "w-9 h-9 rounded-full text-lg",
    md: "w-12 h-12 rounded-full text-xl",
    lg: "w-16 h-16 rounded-full text-2xl",
  };

  const titleSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <Link to="/" className={cn("flex items-center gap-3 group", className)}>
      <div
        className={cn(
          iconSizes[size],
          "flex items-center justify-center transition-all duration-300 rounded-full overflow-hidden",
          "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
          isDark
            ? "ring-4 ring-white/10 shadow-none"
            : "border border-slate-100",
        )}
      >
        <img
          src="/logo.png"
          alt="CMI"
          className="w-full h-full object-contain p-0 scale-150 group-hover:scale-170 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent) {
              parent.style.background =
                "linear-gradient(135deg, #0D9488 0%, #172554 100%)";
              parent.innerHTML =
                '<span class="text-white font-bold select-none text-xs">C</span>';
            }
          }}
        />
      </div>
      {withText && (
        <div
          className={cn(
            titleSizes[size],
            "font-extrabold tracking-tighter transition-all duration-300",
          )}
        >
          <span className={isDark ? "text-white" : "text-navy"}>Connect</span>
          <span className="text-teal">
            Me
          </span>
          <span
            className={cn(
              "transition-colors duration-300",
              isDark
                ? "text-white/90 group-hover:text-white"
                : "text-navy/90 group-hover:text-navy",
            )}
          >
            India
          </span>
        </div>
      )}
    </Link>
  );
};

export default Logo;

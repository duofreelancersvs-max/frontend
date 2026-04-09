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
    <Link to="/" className={cn("flex items-center gap-3 transition-all hover:opacity-90 active:scale-95 group", className)}>
      <div
        className={cn(
          iconSizes[size],
          "flex items-center justify-center rounded-xl overflow-hidden bg-white dark:bg-white shadow-sm ring-1 ring-slate-200 dark:ring-white/10",
        )}
      >
        <img
          src="/logo.png"
          alt="CMI"
          className="w-full h-full object-contain scale-[1.8] group-hover:scale-[2] transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent) {
              parent.innerHTML =
                '<span class="text-[#001D3D] font-black text-lg">C</span>';
            }
          }}
        />
      </div>
      {withText && (
        <div
          className={cn(
            titleSizes[size],
            "font-black tracking-tight flex items-center leading-none",
          )}
        >
          <span className={cn(isDark ? "text-white" : "text-navy dark:text-white")}>Connect</span>
          <span className="text-teal">Me</span>
          <span className={cn(isDark ? "text-white" : "text-navy dark:text-white")}>India</span>
          <div className="ml-1.5 w-1.5 h-1.5 rounded-full bg-teal" />
        </div>
      )}
    </Link>
  );
};

export default Logo;

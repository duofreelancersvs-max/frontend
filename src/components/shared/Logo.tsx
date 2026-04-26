import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  isDark?: boolean;
  withText?: boolean;
  size?: "sm" | "md" | "lg";
}

const Logo: React.FC<LogoProps> = ({ className, size = "md", isDark }) => {
  const imageHeights = {
    sm: "h-10",
    md: "h-14",
    lg: "h-20",
  };

  const imageClasses = cn(
    imageHeights[size],
    "w-auto object-contain brightness-110 contrast-105 group-hover:scale-105 transition-transform duration-500",
  );

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).style.display = "none";
    const parent = (e.target as HTMLImageElement).parentElement;
    if (parent && !parent.querySelector('span')) {
      parent.innerHTML = '<span class="text-[#001D3D] dark:text-white font-black text-xl">CMI</span>';
    }
  };

  return (
    <Link
      to="/"
      className={cn(
        "flex items-center transition-all hover:opacity-90 active:scale-95 group",
        className,
      )}
    >
      {isDark === true && (
        <img src="/darkThemeLogo.png" alt="ConnectMeIndia" className={imageClasses} onError={handleError} />
      )}
      {isDark === false && (
        <img src="/logo.png" alt="ConnectMeIndia" className={imageClasses} onError={handleError} />
      )}
      {isDark === undefined && (
        <>
          <img src="/logo.png" alt="ConnectMeIndia" className={cn(imageClasses, "block dark:hidden")} onError={handleError} />
          <img src="/darkThemeLogo.png" alt="ConnectMeIndia" className={cn(imageClasses, "hidden dark:block")} onError={handleError} />
        </>
      )}
    </Link>
  );
};

export default Logo;

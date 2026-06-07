import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  isDark?: boolean;
  withText?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Logo dimensions:
 * - logo.png / darkThemeLogo.png : 2443 × 1600  (landscape, ratio 1.527)
 * - newLogo.png                  : 6400 × 8534  (portrait,  ratio 0.750)
 *
 * For landscape images we constrain by height; the width will be ~1.5× the height.
 * For portrait newLogo.png we constrain by height too, but need a taller h so width
 * becomes visible: at h-14 (56px) width = 56 × 0.75 = 42px (tiny!).
 * Solution: use logo.png (landscape, same branding) for light mode → consistent sizing.
 */
const Logo: React.FC<LogoProps> = ({ className, size = "md", isDark }) => {
  // Both logo.png and darkThemeLogo.png are 2443×1600 (landscape).
  // Height classes → rendered width at each size:
  //   sm: h-10 (40px) → width ≈ 61px
  //   md: h-14 (56px) → width ≈ 85px
  //   lg: h-16 (64px) → width ≈ 98px
  const heightClasses: Record<string, string> = {
    sm: "h-10",
    md: "h-12",
    lg: "h-16",
  };

  const imageClasses = cn(
    heightClasses[size],
    "w-auto object-contain brightness-110 contrast-105 group-hover:scale-105 transition-transform duration-500",
  );

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).style.display = "none";
    const parent = (e.target as HTMLImageElement).parentElement;
    if (parent && !parent.querySelector("span")) {
      const textColor = isDark === true ? "text-white" : "text-[#001D3D] dark:text-white";
      parent.innerHTML = `<span class="${textColor} font-black text-xl tracking-tight">CMI</span>`;
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
        <img
          src="/darkThemeLogo.png"
          alt="ConnectMeIndia"
          className={imageClasses}
          onError={handleError}
        />
      )}
      {isDark === false && (
        <img
          src="/logo.png"
          alt="ConnectMeIndia"
          className={imageClasses}
          onError={handleError}
        />
      )}
      {isDark === undefined && (
        <>
          <img
            src="/logo.png"
            alt="ConnectMeIndia"
            className={cn(imageClasses, "block dark:hidden")}
            onError={handleError}
          />
          <img
            src="/darkThemeLogo.png"
            alt="ConnectMeIndia"
            className={cn(imageClasses, "hidden dark:block")}
            onError={handleError}
          />
        </>
      )}
    </Link>
  );
};

export default Logo;

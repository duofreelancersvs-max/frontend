import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

interface AuthFormPanelProps {
  children: ReactNode;
  className?: string;
  loadingOverlay?: ReactNode;
  maxWidth?: "md" | "lg";
}

/**
 * Mobile-first auth form column — full-width on phones, centered card on md+.
 * Branding panel is progressive enhancement via `hidden md:flex` sibling.
 */
const AuthFormPanel = ({
  children,
  className,
  loadingOverlay,
  maxWidth = "md",
}: AuthFormPanelProps) => {
  return (
    <div
      className={cn(
        "flex-1 flex flex-col items-center justify-start md:justify-center",
        "bg-slate-50 dark:bg-background relative",
        "py-16 md:py-20 lg:py-24 overflow-y-auto overflow-x-hidden min-w-0",
        className,
      )}
    >
      {loadingOverlay}

      <div className="w-full absolute top-0 left-0 p-4 sm:p-6 flex items-center justify-between md:justify-end lg:p-8 z-30">
        <div className="md:hidden shrink-0">
          <Logo size="sm" />
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle className="min-w-[44px] min-h-[44px]" />
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="min-h-[44px] text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-white rounded-xl border border-slate-200 dark:border-white/10 md:border-none px-3 sm:px-4"
            >
              <ArrowLeft size={16} className="mr-1.5 sm:mr-2" />
              <span className="font-bold text-xs uppercase tracking-wider">Home</span>
            </Button>
          </Link>
        </div>
      </div>

      <div
        className={cn(
          "w-full px-4 sm:px-6 md:px-0 mt-12 md:mt-0",
          maxWidth === "lg" ? "max-w-lg" : "max-w-md",
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default AuthFormPanel;

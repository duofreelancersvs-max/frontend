import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/theme.store";
import { cn } from "@/lib/utils";

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2 rounded-xl transition-colors focus:outline-none flex items-center justify-center",
        isDark 
          ? "bg-white/10 hover:bg-white/20 text-yellow-400" 
          : "bg-slate-100/50 hover:bg-slate-200 text-slate-700 border border-slate-200",
        className
      )}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
};

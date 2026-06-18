import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-base text-text-primary dark:text-white ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary placeholder:text-text-secondary dark:placeholder:text-slate-500 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/20 focus-visible:border-teal disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 shadow-sm [-webkit-tap-highlight-color:transparent]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

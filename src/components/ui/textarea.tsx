import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <textarea
          className={cn(
            "flex min-h-[120px] w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm text-text-primary dark:text-white ring-offset-white placeholder:text-text-secondary dark:placeholder:text-slate-500 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/20 focus-visible:border-teal disabled:cursor-not-allowed disabled:opacity-50 resize-y shadow-sm transition-all duration-200 [-webkit-tap-highlight-color:transparent]",
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };

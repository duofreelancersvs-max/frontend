import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <textarea
          className={cn(
            "flex min-h-[120px] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-text-primary ring-offset-white placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:border-teal disabled:cursor-not-allowed disabled:opacity-50 resize-y shadow-sm transition-all duration-200",
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

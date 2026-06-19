import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PublicMainProps {
  children: ReactNode;
  className?: string;
}

/** Accessible main landmark for public marketing pages. */
const PublicMain = ({ children, className }: PublicMainProps) => (
  <main id="main-content" className={cn("min-w-0", className)}>
    {children}
  </main>
);

export default PublicMain;

import type { ReactNode } from "react";
import AuthBrandingPanel from "@/components/auth/AuthBrandingPanel";
import AuthFormPanel from "@/components/auth/AuthFormPanel";

interface AuthPageShellProps {
  brandingTitle: ReactNode;
  brandingDescription: string;
  children: ReactNode;
  loadingOverlay?: ReactNode;
  maxWidth?: "md" | "lg";
}

/** Mobile-first auth page layout: form first, branding on md+. */
const AuthPageShell = ({
  brandingTitle,
  brandingDescription,
  children,
  loadingOverlay,
  maxWidth = "md",
}: AuthPageShellProps) => (
  <div className="min-h-[100dvh] flex flex-col md:flex-row font-sans">
    <AuthBrandingPanel
      title={brandingTitle}
      description={brandingDescription}
    />
    <AuthFormPanel loadingOverlay={loadingOverlay} maxWidth={maxWidth}>
      {children}
    </AuthFormPanel>
  </div>
);

export default AuthPageShell;

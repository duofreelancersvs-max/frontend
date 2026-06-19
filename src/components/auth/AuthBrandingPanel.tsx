import type { ReactNode } from "react";
import Logo from "@/components/shared/Logo";

interface AuthBrandingPanelProps {
  title: ReactNode;
  description: string;
  footer?: ReactNode;
}

/** Progressive-enhancement branding column for auth pages (hidden on mobile). */
const AuthBrandingPanel = ({
  title,
  description,
  footer,
}: AuthBrandingPanelProps) => (
  <div className="hidden md:flex md:w-[40%] lg:w-[45%] relative bg-navy overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-[#050B15] via-navy to-royal-blue" />
    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-royal-blue/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
    <div className="relative z-10 flex flex-col justify-between p-8 lg:p-12 w-full">
      <Logo size="lg" isDark />
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
          {title}
        </h2>
        <p className="text-slate-300 text-base lg:text-lg max-w-md">
          {description}
        </p>
      </div>
      {footer}
    </div>
  </div>
);

export default AuthBrandingPanel;

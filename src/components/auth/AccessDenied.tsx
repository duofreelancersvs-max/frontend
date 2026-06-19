import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Lightweight 403-style page for role-gated routes (avoids pulling full NotFound chunk). */
const AccessDenied = () => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-50 dark:bg-[#050B15] text-center">
    <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
      <ShieldAlert size={40} className="text-red-500" aria-hidden />
    </div>
    <h1 className="text-2xl font-bold text-navy dark:text-white mb-2">Access Denied</h1>
    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
      You don&apos;t have permission to view this page.
    </p>
    <Link to="/">
      <Button className="min-h-[44px]">Go to Home</Button>
    </Link>
  </div>
);

export default AccessDenied;

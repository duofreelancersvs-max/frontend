import { useState } from "react";
import { Outlet } from "react-router-dom";
import FreelancerSidebar from "@/components/layout/FreelancerSidebar";

export type FreelancerLayoutContext = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const FreelancerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <FreelancerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Overlay for mobile when sidebar is open */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        <Outlet context={{ setSidebarOpen, sidebarOpen }} />
      </div>
    </div>
  );
};

export default FreelancerLayout;

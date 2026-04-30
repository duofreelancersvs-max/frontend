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
    <div className="flex h-[100dvh] bg-background font-sans transition-colors duration-300 overflow-hidden">
      <FreelancerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-[100dvh] lg:ml-64 transition-all duration-300 relative w-full overflow-y-auto overflow-x-hidden">
        <Outlet context={{ setSidebarOpen, sidebarOpen }} />
      </div>
    </div>
  );
};

export default FreelancerLayout;

import { useState } from "react";
import { Outlet } from "react-router-dom";
import ClientSidebar from "@/components/layout/ClientSidebar";

export type ClientLayoutContext = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const ClientLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#050B15] overflow-hidden font-sans transition-colors duration-300">
      <ClientSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        <Outlet context={{ setSidebarOpen, sidebarOpen }} />
      </div>
    </div>
  );
};

export default ClientLayout;

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
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
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

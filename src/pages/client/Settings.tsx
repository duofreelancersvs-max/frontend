import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Folder,
  PlusCircle,
  Search,
  Mail,
  CreditCard,
  Star,
  Settings,
  LogOut,
  X,
  Menu,
  User,
  Bell,
  Lock,
  Shield,
  Palette,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const sidebarNavItems = [
  { icon: Home, label: "Dashboard", href: "/client/dashboard", active: false },
  { icon: Folder, label: "My Projects", href: "/client/projects", badge: null },
  {
    icon: PlusCircle,
    label: "Post Project",
    href: "/client/post-project",
    badge: null,
  },
  {
    icon: Search,
    label: "Find Freelancers",
    href: "/freelancers",
    badge: null,
  },
  { icon: Mail, label: "Messages", href: "/client/messages", badge: "3" },
  {
    icon: CreditCard,
    label: "Payments",
    href: "/client/payments",
    badge: null,
  },
  { icon: Star, label: "Reviews", href: "/client/reviews", badge: null },
  {
    icon: Settings,
    label: "Settings",
    href: "/client/settings",
    active: true,
    badge: null,
  },
];

const ClientSettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("account");

  const settingsSections = [
    { id: "account", label: "Account", icon: User },
    { id: "company", label: "Company", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-navy transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight">
                ConnectMe
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase -mt-1 text-teal-light">
                India
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  item.active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon size={20} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-teal text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                RK
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  Rajesh Kumar
                </p>
                <p className="text-xs text-white/50">Client Account</p>
              </div>
              <button className="text-white/50 hover:text-white transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="lg:ml-64">
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-navy">
                Settings
              </h1>
              <p className="text-sm text-slate-500 hidden sm:block">
                Manage your account preferences
              </p>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      activeSection === section.id
                        ? "bg-teal/10 text-teal"
                        : "text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    <section.icon size={18} />
                    {section.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3">
              {activeSection === "account" && (
                <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-6">
                  <h2 className="text-lg font-bold text-navy">
                    Account Settings
                  </h2>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
                        Full Name
                      </label>
                      <Input defaultValue="Rajesh Kumar" className="max-w-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
                        Email Address
                      </label>
                      <Input
                        defaultValue="rajesh@company.com"
                        className="max-w-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
                        Phone Number
                      </label>
                      <Input
                        defaultValue="+91 98765 12345"
                        className="max-w-md"
                      />
                    </div>
                  </div>
                  <Button className="bg-teal hover:bg-teal-light text-white">
                    Save Changes
                  </Button>
                </div>
              )}
              {activeSection === "company" && (
                <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-6">
                  <h2 className="text-lg font-bold text-navy">
                    Company Information
                  </h2>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
                        Company Name
                      </label>
                      <Input
                        defaultValue="TechMart Solutions"
                        className="max-w-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
                        Industry
                      </label>
                      <select className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg">
                        <option>Technology</option>
                        <option>Marketing</option>
                        <option>E-commerce</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
                        Website
                      </label>
                      <Input
                        defaultValue="https://techmart.com"
                        className="max-w-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
                        Company Size
                      </label>
                      <select className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg">
                        <option>1-10 employees</option>
                        <option>11-50 employees</option>
                        <option>51-200 employees</option>
                        <option>200+ employees</option>
                      </select>
                    </div>
                  </div>
                  <Button className="bg-teal hover:bg-teal-light text-white">
                    Save Changes
                  </Button>
                </div>
              )}
              {activeSection === "notifications" && (
                <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-6">
                  <h2 className="text-lg font-bold text-navy">
                    Notification Preferences
                  </h2>
                  <div className="space-y-4">
                    {[
                      "Email notifications for new applications",
                      "Push notifications",
                      "SMS alerts for urgent updates",
                      "Project milestone notifications",
                      "Freelancer message notifications",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                      >
                        <span className="text-sm text-slate-600">{item}</span>
                        <button className="w-12 h-6 rounded-full bg-teal relative">
                          <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeSection === "security" && (
                <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-6">
                  <h2 className="text-lg font-bold text-navy">
                    Security Settings
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
                        Current Password
                      </label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="max-w-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
                        New Password
                      </label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="max-w-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
                        Confirm Password
                      </label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="max-w-md"
                      />
                    </div>
                  </div>
                  <Button className="bg-teal hover:bg-teal-light text-white">
                    Update Password
                  </Button>
                </div>
              )}
              {activeSection === "privacy" && (
                <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-6">
                  <h2 className="text-lg font-bold text-navy">
                    Privacy Settings
                  </h2>
                  <div className="space-y-4">
                    {[
                      "Show company profile in search results",
                      "Allow freelancers to send messages",
                      "Display project history publicly",
                      "Share reviews publicly",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                      >
                        <span className="text-sm text-slate-600">{item}</span>
                        <button className="w-12 h-6 rounded-full bg-teal relative">
                          <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeSection === "preferences" && (
                <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-6">
                  <h2 className="text-lg font-bold text-navy">Preferences</h2>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
                        Language
                      </label>
                      <select className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg">
                        <option>English</option>
                        <option>Hindi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
                        Timezone
                      </label>
                      <select className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg">
                        <option>IST (UTC+5:30)</option>
                        <option>UTC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
                        Currency
                      </label>
                      <select className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg">
                        <option>INR (₹)</option>
                        <option>USD ($)</option>
                      </select>
                    </div>
                  </div>
                  <Button className="bg-teal hover:bg-teal-light text-white">
                    Save Preferences
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientSettings;

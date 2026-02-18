import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { ClientLayoutContext } from "@/layouts/ClientLayout";
import {
  User,
  Bell,
  Lock,
  Shield,
  Palette,
  Building2,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ClientSettings = () => {
  const { setSidebarOpen } = useOutletContext<ClientLayoutContext>();
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
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 font-sans">
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
  );
};

export default ClientSettings;

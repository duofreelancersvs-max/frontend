import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  Home,
  User,
  FolderOpen,
  Search,
  FileText,
  Mail,
  CreditCard,
  DollarSign,
  Star,
  Settings,
  LogOut,
  X,
  Menu,
  Bell,
  Lock,
  Shield,
  Palette,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { userService, freelancerService } from "@/services";
import type { User as UserType, FreelancerProfile } from "@/services";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";

const sidebarNavItems = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/freelancer/dashboard",
    active: false,
  },
  { icon: User, label: "My Profile", href: "/freelancer/profile", badge: null },
  {
    icon: FolderOpen,
    label: "Portfolio",
    href: "/freelancer/portfolio",
    badge: null,
  },
  { icon: Search, label: "Browse Projects", href: "/projects", badge: null },
  {
    icon: FileText,
    label: "My Applications",
    href: "/freelancer/applications",
    badge: "3",
  },
  { icon: Mail, label: "Messages", href: "/freelancer/messages", badge: "5" },
  {
    icon: CreditCard,
    label: "Subscription",
    href: "/freelancer/subscription",
    badge: null,
  },
  {
    icon: DollarSign,
    label: "Earnings",
    href: "/freelancer/earnings",
    badge: null,
  },
  { icon: Star, label: "Reviews", href: "/freelancer/reviews", badge: null },
  {
    icon: Settings,
    label: "Settings",
    href: "/freelancer/settings",
    active: true,
    badge: null,
  },
];

const FreelancerSettings = () => {
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  const [activeSection, setActiveSection] = useState("account");
  const [user, setUser] = useState<UserType | null>(null);
  const [freelancerProfile, setFreelancerProfile] =
    useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userData, profileData] = await Promise.allSettled([
          userService.getMe().catch(() => null),
          freelancerService.getMyProfile().catch(() => null),
        ]);
        if (userData.status === "fulfilled") setUser(userData.value);
        if (profileData.status === "fulfilled")
          setFreelancerProfile(profileData.value);
      } catch (error) {
        console.error("Error fetching settings data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const settingsSections = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Palette },
  ];

  return (
    <div className="w-full bg-slate-50">
      <div className="w-full">
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
                      <Input defaultValue="Arun Kumar" className="max-w-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
                        Email Address
                      </label>
                      <Input
                        defaultValue="arun@example.com"
                        className="max-w-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
                        Phone Number
                      </label>
                      <Input
                        defaultValue="+91 98765 43210"
                        className="max-w-md"
                      />
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
                      "Email notifications",
                      "Push notifications",
                      "SMS alerts",
                      "Project updates",
                      "Message notifications",
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
                      "Show profile in search results",
                      "Allow messages from clients",
                      "Display earnings publicly",
                      "Show online status",
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

export default FreelancerSettings;

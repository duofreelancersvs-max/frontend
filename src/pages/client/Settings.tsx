import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import type { ClientLayoutContext } from "@/layouts/ClientLayout";
import {
  User,
  Bell,
  Lock,
  Shield,
  Palette,
  Building2,
  Menu,
  MessageSquare,
  User as UserIcon,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { ThemeToggle as ThemeToggleButton } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { userService, settingsService, clientService } from "@/services";
import type { ClientProfile } from "@/services/client.service";
import type {
  NotificationSettings,
  PrivacySettings,
  PreferenceSettings,
} from "@/services/settings.service";
import { useUnreadStore } from "@/stores/unread.store";

const ClientSettings = () => {
  const { setSidebarOpen } = useOutletContext<ClientLayoutContext>();
  const totalUnreadCount = useUnreadStore((s) => s.totalUnreadCount);
  const [activeSection, setActiveSection] = useState("account");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(
    null,
  );

  const [accountForm, setAccountForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    industry: "",
    website: "",
    companySize: "",
  });

  const [notificationsForm, setNotificationsForm] =
    useState<NotificationSettings>({
      email: true,
      push: true,
      sms: false,
      projectUpdates: true,
      messages: true,
    });

  const [privacyForm, setPrivacyForm] = useState<PrivacySettings>({
    showInSearch: true,
    allowMessages: true,
    displayEarnings: false,
    showOnlineStatus: true,
  });

  const [preferencesForm, setPreferencesForm] = useState<PreferenceSettings>({
    language: "en",
    timezone: "Asia/Kolkata",
    currency: "INR",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userData, settingsData, clientData] = await Promise.allSettled([
          userService.getMe().catch(() => null),
          settingsService.getSettings().catch(() => null),
          clientService.getMyProfile().catch(() => null),
        ]);

        if (userData.status === "fulfilled" && userData.value) {
          let displayName = userData.value.fullName || "";
          if (
            !displayName &&
            clientData.status === "fulfilled" &&
            clientData.value
          ) {
            displayName = clientData.value.companyName || "";
          }
          setAccountForm({
            fullName: displayName,
            email: userData.value.email || "",
            phone: userData.value.phone || "",
          });
        }

        if (settingsData.status === "fulfilled" && settingsData.value) {
          setNotificationsForm(settingsData.value.notifications);
          setPrivacyForm(settingsData.value.privacy);
          setPreferencesForm(settingsData.value.preferences);
        }

        if (clientData.status === "fulfilled" && clientData.value) {
          setClientProfile(clientData.value);
          setCompanyForm({
            companyName: clientData.value.companyName || "",
            industry: clientData.value.industry || "",
            website: clientData.value.website || "",
            companySize: "",
          });
        }
      } catch (error) {
        console.error("Error fetching settings data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAccountSave = async () => {
    try {
      setSaving(true);
      await userService.updateMe({
        fullName: accountForm.fullName,
        phone: accountForm.phone,
      });
      alert("Account settings saved successfully!");
    } catch (error) {
      console.error("Error saving account:", error);
      alert("Failed to save account settings");
    } finally {
      setSaving(false);
    }
  };

  const handleCompanySave = async () => {
    try {
      setSaving(true);
      if (clientProfile) {
        await clientService.updateProfile({
          companyName: companyForm.companyName,
          industry: companyForm.industry,
          website: companyForm.website,
        });
      } else {
        await clientService.createProfile({
          companyName: companyForm.companyName,
          industry: companyForm.industry,
          website: companyForm.website,
        });
      }
      alert("Company information saved successfully!");
    } catch (error) {
      console.error("Error saving company:", error);
      alert("Failed to save company information");
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationsSave = async () => {
    try {
      setSaving(true);
      await settingsService.updateSettings({
        notifications: notificationsForm,
      });
      alert("Notification settings saved successfully!");
    } catch (error) {
      console.error("Error saving notifications:", error);
      alert("Failed to save notification settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePrivacySave = async () => {
    try {
      setSaving(true);
      await settingsService.updateSettings({
        privacy: privacyForm,
      });
      alert("Privacy settings saved successfully!");
    } catch (error) {
      console.error("Error saving privacy:", error);
      alert("Failed to save privacy settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesSave = async () => {
    try {
      setSaving(true);
      await settingsService.updateSettings({
        preferences: preferencesForm,
      });
      alert("Preferences saved successfully!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    try {
      setSaving(true);
      const { authService } = await import("@/services");
      await authService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );
      alert("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotificationsForm((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const togglePrivacy = (key: keyof PrivacySettings) => {
    setPrivacyForm((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const settingsSections = [
    { id: "account", label: "Account", icon: User },
    { id: "company", label: "Company", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Palette },
  ];

  if (loading) {
    return (
       <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-[#050B15] font-sans flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">Loading settings...</div>
      </div>
    );
  }

   return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-[#050B15] font-sans">
       <header className="sticky top-0 z-20 bg-white dark:bg-[#050B15] border-b border-slate-200 dark:border-white/5 px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
             <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div>
               <h1 className="text-xl lg:text-2xl font-bold text-navy dark:text-white">
                Settings
              </h1>
               <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
                Manage your account preferences
              </p>
            </div>
          </div>

           <div className="flex items-center gap-2 lg:gap-4">
            <ThemeToggleButton className="w-9 h-9" />
            <Link
              to="/client/messages"
              className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg flex"
            >
              <MessageSquare size={20} />
              {totalUnreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-teal rounded-full border-2 border-white" />
              )}
            </Link>
            
             <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg flex">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="relative">
               <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-bold text-sm">
                  {user?.fullName
                    ? user.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : (user?.email?.[0] || "U").toUpperCase()}
                </div>
                 <ChevronDown
                  size={16}
                  className="text-slate-500 dark:text-slate-400 hidden sm:block"
                />
              </button>

               {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#121A2A] rounded-xl shadow-xl border border-slate-100 dark:border-white/5 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
                    <p className="font-semibold text-navy dark:text-white">
                      {user?.fullName || user?.email?.split("@")[0] || "Client"}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    to="/client/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <UserIcon size={16} />
                    My Profile
                  </Link>
                  <Link
                    to="/client/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <hr className="my-2 border-slate-100 dark:border-white/5" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="p-4 lg:p-8">
        <div className="grid lg:grid-cols-4 gap-6">
           <div className="lg:col-span-1">
            <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-4 space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all",
                     activeSection === section.id
                      ? "bg-teal/10 dark:bg-teal/20 text-teal"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5",
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
               <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-6 space-y-6">
                <h2 className="text-lg font-bold text-navy dark:text-white">
                  Account Settings
                </h2>
                <div className="grid gap-4">
                   <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Full Name
                    </label>
                    <Input
                      value={accountForm.fullName}
                      onChange={(e) =>
                        setAccountForm((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                       placeholder="Enter your full name"
                      className="max-w-md dark:bg-white/5 dark:border-white/10 dark:text-white"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Email Address
                    </label>
                    <Input
                      value={accountForm.email}
                       placeholder="No email available"
                      disabled
                      className="max-w-md bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-white/10"
                    />
                     <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Phone Number
                    </label>
                    <Input
                      value={accountForm.phone}
                      onChange={(e) =>
                        setAccountForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                       placeholder="Enter your phone number"
                      className="max-w-md dark:bg-white/5 dark:border-white/10 dark:text-white"
                    />
                  </div>
                </div>
                <Button
                  className="bg-teal hover:bg-teal-light text-white"
                  onClick={handleAccountSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
            {activeSection === "company" && (
               <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-6 space-y-6">
                <h2 className="text-lg font-bold text-navy dark:text-white">
                  Company Information
                </h2>
                <div className="grid gap-4">
                   <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Company Name
                    </label>
                    <Input
                      value={companyForm.companyName}
                      onChange={(e) =>
                        setCompanyForm((prev) => ({
                          ...prev,
                          companyName: e.target.value,
                        }))
                      }
                       placeholder="Enter your company name"
                      className="max-w-md dark:bg-white/5 dark:border-white/10 dark:text-white"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Industry
                    </label>
                    <select
                      value={companyForm.industry}
                      onChange={(e) =>
                        setCompanyForm((prev) => ({
                          ...prev,
                          industry: e.target.value,
                        }))
                      }
                      className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="">Select industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Marketing">Marketing</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Website
                    </label>
                    <Input
                      value={companyForm.website}
                      onChange={(e) =>
                        setCompanyForm((prev) => ({
                          ...prev,
                          website: e.target.value,
                        }))
                      }
                       placeholder="https://example.com"
                      className="max-w-md dark:bg-white/5 dark:border-white/10 dark:text-white"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Company Size
                    </label>
                    <select
                      value={companyForm.companySize}
                      onChange={(e) =>
                        setCompanyForm((prev) => ({
                          ...prev,
                          companySize: e.target.value,
                        }))
                      }
                      className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="200+">200+ employees</option>
                    </select>
                  </div>
                </div>
                <Button
                  className="bg-teal hover:bg-teal-light text-white"
                  onClick={handleCompanySave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
            {activeSection === "notifications" && (
               <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-6 space-y-6">
                <h2 className="text-lg font-bold text-navy dark:text-white">
                  Notification Preferences
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      key: "email",
                      label: "Email notifications for new applications",
                    },
                    { key: "push", label: "Push notifications" },
                    { key: "sms", label: "SMS alerts for urgent updates" },
                    {
                      key: "projectUpdates",
                      label: "Project milestone notifications",
                    },
                    {
                      key: "messages",
                      label: "Freelancer message notifications",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                     className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5 last:border-0"
                    >
                       <span className="text-sm text-slate-600 dark:text-slate-400">
                        {item.label}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          toggleNotification(
                            item.key as keyof NotificationSettings,
                          )
                        }
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-colors",
                          notificationsForm[
                            item.key as keyof NotificationSettings
                          ]
                            ? "bg-teal"
                            : "bg-slate-300",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                            notificationsForm[
                              item.key as keyof NotificationSettings
                            ]
                              ? "right-1"
                              : "left-1",
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  className="bg-teal hover:bg-teal-light text-white"
                  onClick={handleNotificationsSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            )}
            {activeSection === "security" && (
               <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-6 space-y-6">
                <h2 className="text-lg font-bold text-navy dark:text-white">
                  Security Settings
                </h2>
                <div className="space-y-4">
                   <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                       placeholder="Enter current password"
                      className="max-w-md dark:bg-white/5 dark:border-white/10 dark:text-white"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                       placeholder="Enter new password"
                      className="max-w-md dark:bg-white/5 dark:border-white/10 dark:text-white"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Confirm Password
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                       placeholder="Confirm new password"
                      className="max-w-md dark:bg-white/5 dark:border-white/10 dark:text-white"
                    />
                  </div>
                </div>
                <Button
                  className="bg-teal hover:bg-teal-light text-white"
                  onClick={handlePasswordSave}
                  disabled={saving}
                >
                  {saving ? "Updating..." : "Update Password"}
                </Button>
              </div>
            )}
            {activeSection === "privacy" && (
               <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-6 space-y-6">
                <h2 className="text-lg font-bold text-navy dark:text-white">
                  Privacy Settings
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      key: "showInSearch",
                      label: "Show company profile in search results",
                    },
                    {
                      key: "allowMessages",
                      label: "Allow freelancers to send messages",
                    },
                    {
                      key: "displayEarnings",
                      label: "Display project history publicly",
                    },
                    {
                      key: "showOnlineStatus",
                      label: "Share reviews publicly",
                    },
                  ].map((item) => (
                     <div
                      key={item.key}
                      className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5 last:border-0"
                    >
                       <span className="text-sm text-slate-600 dark:text-slate-400">
                        {item.label}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          togglePrivacy(item.key as keyof PrivacySettings)
                        }
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-colors",
                          privacyForm[item.key as keyof PrivacySettings]
                            ? "bg-teal"
                            : "bg-slate-300",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                            privacyForm[item.key as keyof PrivacySettings]
                              ? "right-1"
                              : "left-1",
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  className="bg-teal hover:bg-teal-light text-white"
                  onClick={handlePrivacySave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            )}
            {activeSection === "preferences" && (
               <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-6 space-y-6">
                <h2 className="text-lg font-bold text-navy dark:text-white">Preferences</h2>
                <div className="grid gap-4">
                   <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Language
                    </label>
                    <select
                      value={preferencesForm.language}
                      onChange={(e) =>
                        setPreferencesForm((prev) => ({
                          ...prev,
                          language: e.target.value,
                        }))
                      }
                      className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Timezone
                    </label>
                    <select
                      value={preferencesForm.timezone}
                      onChange={(e) =>
                        setPreferencesForm((prev) => ({
                          ...prev,
                          timezone: e.target.value,
                        }))
                      }
                      className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="Asia/Kolkata">IST (UTC+5:30)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Currency
                    </label>
                    <select
                      value={preferencesForm.currency}
                      onChange={(e) =>
                        setPreferencesForm((prev) => ({
                          ...prev,
                          currency: e.target.value,
                        }))
                      }
                      className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>
                <Button
                  className="bg-teal hover:bg-teal-light text-white"
                  onClick={handlePreferencesSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Preferences"}
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

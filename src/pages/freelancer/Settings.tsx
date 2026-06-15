import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  User,
  Lock,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { userService, settingsService, freelancerService } from "@/services";
import type { FreelancerProfile } from "@/services/freelancer.service";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import DashboardHeader from "@/components/layouts/DashboardHeader";
import type {
  PrivacySettings,
} from "@/services/settings.service";

const FreelancerSettings = () => {
  const { setSidebarOpen } = useOutletContext<FreelancerLayoutContext>();
  const [activeSection, setActiveSection] = useState("account");


  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [accountForm, setAccountForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [privacyForm, setPrivacyForm] = useState<PrivacySettings>({
    showInSearch: true,
    allowMessages: true,
    displayEarnings: false,
    showOnlineStatus: true,
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
        const [userData, settingsData, profileData] = await Promise.allSettled([
          userService.getMe().catch(() => null),
          settingsService.getSettings().catch(() => null),
          freelancerService.getMyProfile().catch(() => null),
        ]);

        if (userData.status === "fulfilled" && userData.value) {
          let displayName = userData.value.fullName || "";
          if (
            !displayName &&
            profileData.status === "fulfilled" &&
            profileData.value
          ) {
            const profile = profileData.value as FreelancerProfile;
            displayName =
              `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
          }
          setAccountForm({
            fullName: displayName,
            email: userData.value.email || "",
            phone: userData.value.phone || "",
          });
        }

        if (settingsData.status === "fulfilled" && settingsData.value) {
          setPrivacyForm(settingsData.value.privacy);
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

  const handlePrivacySave = async () => {
    try {
      setSaving(true);
      const result = await settingsService.updateSettings({
        privacy: privacyForm,
      });
      setPrivacyForm(result.privacy);
      alert("Privacy settings saved successfully!");
    } catch (error) {
      console.error("Error saving privacy:", error);
      alert("Failed to save privacy settings");
    } finally {
      setSaving(false);
    }
  };

  const [isGoogleLogin, setIsGoogleLogin] = useState(false);

  useEffect(() => {
    import("@/lib/supabase").then(({ supabase }) => {
      supabase.auth.getUser().then(({ data }) => {
        if (
          data?.user?.app_metadata?.provider === "google" ||
          data?.user?.identities?.some((id) => id.provider === "google")
        ) {
          setIsGoogleLogin(true);
        }
      });
    });
  }, []);

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

  const settingsSections = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "privacy", label: "Privacy", icon: Shield },
  ];

  const togglePrivacy = (key: keyof PrivacySettings) => {
    setPrivacyForm((prev: PrivacySettings) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <div className="w-full bg-slate-50 dark:bg-background flex items-center justify-center h-64">
        <div className="text-slate-500 dark:text-slate-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 dark:bg-background min-h-screen">
      <div className="w-full">
        <DashboardHeader
          title="Settings"
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="px-6 lg:px-8 py-6 lg:py-8">
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 p-4 space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      activeSection === section.id
                        ? "bg-teal/10 text-teal"
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
                <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-6 shadow-sm space-y-6">
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
                        className="max-w-md bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-400 dark:border-white/10"
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
              {activeSection === "security" && (
                <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-6 shadow-sm space-y-6">
                  <h2 className="text-lg font-bold text-navy dark:text-white">
                    Security Settings
                  </h2>
                  <div className="space-y-4">
                    {isGoogleLogin && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm max-w-md">
                        You logged in with Google. Password changes are managed by your Google account.
                      </div>
                    )}
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
                        disabled={isGoogleLogin}
                        className="max-w-md dark:bg-white/5 dark:border-white/10 dark:text-white disabled:opacity-50"
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
                        disabled={isGoogleLogin}
                        className="max-w-md dark:bg-white/5 dark:border-white/10 dark:text-white disabled:opacity-50"
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
                        disabled={isGoogleLogin}
                        className="max-w-md dark:bg-white/5 dark:border-white/10 dark:text-white disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <Button
                    className="bg-teal hover:bg-teal-light text-white disabled:opacity-50"
                    onClick={handlePasswordSave}
                    disabled={saving || isGoogleLogin}
                  >
                    {saving ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              )}
              {activeSection === "privacy" && (
                <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-6 shadow-sm space-y-6">
                  <h2 className="text-lg font-bold text-navy dark:text-white">
                    Privacy Settings
                  </h2>
                  <div className="space-y-4">
                    {[
                      {
                        key: "showInSearch",
                        label: "Show profile in search results",
                      },
                      {
                        key: "allowMessages",
                        label: "Allow messages from clients",
                      },
                      {
                        key: "displayEarnings",
                        label: "Display earnings publicly",
                      },
                      { key: "showOnlineStatus", label: "Show online status" },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FreelancerSettings;

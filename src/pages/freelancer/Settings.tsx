import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  User,
  Bell,
  Lock,
  Shield,
  Palette,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { userService, settingsService, freelancerService } from "@/services";
import type { FreelancerProfile } from "@/services/freelancer.service";
import type { FreelancerLayoutContext } from "@/layouts/FreelancerLayout";
import type {
  NotificationSettings,
  PrivacySettings,
  PreferenceSettings,
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

  const [preferencesForm, setPreferencesForm] =
    useState<PreferenceSettings>({
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
        const [userData, settingsData, profileData] = await Promise.allSettled([
          userService.getMe().catch(() => null),
          settingsService.getSettings().catch(() => null),
          freelancerService.getMyProfile().catch(() => null),
        ]);

        if (userData.status === "fulfilled" && userData.value) {
          let displayName = userData.value.fullName || "";
          if (!displayName && profileData.status === "fulfilled" && profileData.value) {
            const profile = profileData.value as FreelancerProfile;
            displayName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
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

  const handleNotificationsSave = async () => {
    try {
      setSaving(true);
      const result = await settingsService.updateSettings({
        notifications: notificationsForm,
      });
      setNotificationsForm(result.notifications);
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

  const handlePreferencesSave = async () => {
    try {
      setSaving(true);
      const result = await settingsService.updateSettings({
        preferences: preferencesForm,
      });
      setPreferencesForm(result.preferences);
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
        passwordForm.newPassword
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
    setNotificationsForm((prev: NotificationSettings) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const togglePrivacy = (key: keyof PrivacySettings) => {
    setPrivacyForm((prev: PrivacySettings) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const settingsSections = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Palette },
  ];

  if (loading) {
    return (
      <div className="w-full bg-slate-50 flex items-center justify-center h-64">
        <div className="text-slate-500">Loading settings...</div>
      </div>
    );
  }

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
                        : "text-slate-600 hover:bg-slate-50"
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
                      <Input
                        value={accountForm.fullName}
                        onChange={(e) =>
                          setAccountForm((prev) => ({
                            ...prev,
                            fullName: e.target.value,
                          }))
                        }
                        placeholder="Enter your full name"
                        className="max-w-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
                        Email Address
                      </label>
                      <Input
                        value={accountForm.email}
                        placeholder="No email available"
                        disabled
                        className="max-w-md bg-slate-50 text-slate-700"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Email cannot be changed
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
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
                        className="max-w-md"
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
              {activeSection === "notifications" && (
                <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-6">
                  <h2 className="text-lg font-bold text-navy">
                    Notification Preferences
                  </h2>
                  <div className="space-y-4">
                    {[
                      { key: "email", label: "Email notifications" },
                      { key: "push", label: "Push notifications" },
                      { key: "sms", label: "SMS alerts" },
                      { key: "projectUpdates", label: "Project updates" },
                      { key: "messages", label: "Message notifications" },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                      >
                        <span className="text-sm text-slate-600">{item.label}</span>
                        <button
                          type="button"
                          onClick={() =>
                            toggleNotification(
                              item.key as keyof NotificationSettings
                            )
                          }
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-colors",
                            notificationsForm[
                              item.key as keyof NotificationSettings
                            ]
                              ? "bg-teal"
                              : "bg-slate-300"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                              notificationsForm[
                                item.key as keyof NotificationSettings
                              ]
                                ? "right-1"
                                : "left-1"
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
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        placeholder="Enter current password"
                        className="max-w-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
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
                        className="max-w-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
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
                        className="max-w-md"
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
                <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-6">
                  <h2 className="text-lg font-bold text-navy">
                    Privacy Settings
                  </h2>
                  <div className="space-y-4">
                    {[
                      { key: "showInSearch", label: "Show profile in search results" },
                      { key: "allowMessages", label: "Allow messages from clients" },
                      { key: "displayEarnings", label: "Display earnings publicly" },
                      { key: "showOnlineStatus", label: "Show online status" },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                      >
                        <span className="text-sm text-slate-600">{item.label}</span>
                        <button
                          type="button"
                          onClick={() =>
                            togglePrivacy(item.key as keyof PrivacySettings)
                          }
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-colors",
                            privacyForm[item.key as keyof PrivacySettings]
                              ? "bg-teal"
                              : "bg-slate-300"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                              privacyForm[item.key as keyof PrivacySettings]
                                ? "right-1"
                                : "left-1"
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
                <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-6">
                  <h2 className="text-lg font-bold text-navy">Preferences</h2>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">
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
                      <label className="block text-sm font-medium text-slate-600 mb-2">
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
    </div>
  );
};

export default FreelancerSettings;

import { api } from "@/lib/api";

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  projectUpdates: boolean;
  messages: boolean;
}

export interface PrivacySettings {
  showInSearch: boolean;
  allowMessages: boolean;
  displayEarnings: boolean;
  showOnlineStatus: boolean;
}

export interface PreferenceSettings {
  language: string;
  timezone: string;
  currency: string;
}

export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  preferences: PreferenceSettings;
}

export interface UpdateSettingsRequest {
  notifications?: Partial<NotificationSettings>;
  privacy?: Partial<PrivacySettings>;
  preferences?: Partial<PreferenceSettings>;
}

export const settingsService = {
  getSettings: () => api.get<UserSettings>("/user-settings/me"),

  updateSettings: (data: UpdateSettingsRequest) =>
    api.patch<UserSettings>("/user-settings/me", data),
};

export default settingsService;

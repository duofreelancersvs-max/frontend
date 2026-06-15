import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import FreelancerSettings from "../../../pages/freelancer/Settings";
import { useAuth } from "@/hooks/useAuth";
import { userService, settingsService, freelancerService } from "@/services";
import type { User } from "@/types/auth.types";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/services", () => ({
  userService: {
    getMe: vi.fn(),
    updateMe: vi.fn(),
  },
  settingsService: {
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
  },
  freelancerService: {
    getMyProfile: vi.fn(),
  },
  authService: {
    changePassword: vi.fn(),
  }
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useOutletContext: () => ({ setSidebarOpen: vi.fn() }),
  };
});

describe("FreelancerSettings", () => {
  const mockUser: User = {
    _id: "user-1",
    email: "f@test.com",
    fullName: "Test Freelancer",
    role: "freelancer",
    phone: "1234567890",
    status: "active",
    isEmailVerified: true,
    isPhoneVerified: true,
  };

  const mockSettings = {
    notifications: { email: true, push: true, sms: false, projectUpdates: true, messages: true },
    privacy: { showInSearch: true, allowMessages: true, displayEarnings: false, showOnlineStatus: true }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
    });
    
    (userService.getMe as any).mockResolvedValue(mockUser);
    (settingsService.getSettings as any).mockResolvedValue(mockSettings);
    (freelancerService.getMyProfile as any).mockResolvedValue({ firstName: "Test", lastName: "Freelancer" });
  });

  it("renders account settings with user data", async () => {
    renderWithRouter(<FreelancerSettings />);
    
    expect(await screen.findByDisplayValue("Test Freelancer")).toBeInTheDocument();
    expect(screen.getByDisplayValue("f@test.com")).toBeDisabled();
    expect(screen.getByDisplayValue("1234567890")).toBeInTheDocument();
  });

  it("toggles privacy settings", async () => {
    (settingsService.updateSettings as any).mockResolvedValue(mockSettings);
    renderWithRouter(<FreelancerSettings />);
    
    const privacyBtn = await screen.findByRole("button", { name: /privacy/i });
    fireEvent.click(privacyBtn);
    
    const showSearchToggle = screen.getByText("Show profile in search results").nextElementSibling as HTMLElement;
    fireEvent.click(showSearchToggle);
    
    const saveBtn = screen.getByText(/save settings/i);
    fireEvent.click(saveBtn);
    
    expect(settingsService.updateSettings).toHaveBeenCalled();
  });
});

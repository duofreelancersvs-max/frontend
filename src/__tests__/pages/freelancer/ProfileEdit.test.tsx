import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "@/__tests__/test-utils";
import FreelancerProfileEdit from "../../../pages/freelancer/ProfileEdit";
import { useAuth } from "@/hooks/useAuth";
import { freelancerService } from "@/services/freelancer.service";
import type { User } from "@/types/auth.types";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/services/freelancer.service", () => ({
  freelancerService: {
    ensureProfile: vi.fn(),
    updateProfile: vi.fn(),
    addPortfolio: vi.fn(),
    updatePortfolio: vi.fn(),
    removePortfolio: vi.fn(),
    addExperience: vi.fn(),
    removeExperience: vi.fn(),
    addEducation: vi.fn(),
    removeEducation: vi.fn(),
  },
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useOutletContext: () => ({ setSidebarOpen: vi.fn() }),
  };
});

describe("FreelancerProfileEdit", () => {
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

  const mockProfile = {
    firstName: "Test",
    lastName: "Freelancer",
    displayName: "tfreelancer",
    headline: "Video Editor",
    bio: "Bio contents",
    availability: "full-time",
    category: "Editing",
    skills: [{ skillId: "s1", name: "React", proficiency: 3 }],
    portfolio: [],
    workExperience: [],
    education: [],
    profilePicture: "pic.jpg",
    isVerified: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });
    (freelancerService.ensureProfile as any).mockResolvedValue(mockProfile);
  });

  it("renders basic info form with profile data", async () => {
    renderWithRouter(<FreelancerProfileEdit />);
    
    expect(await screen.findByDisplayValue("Test")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Freelancer")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Video Editor")).toBeInTheDocument();
  });

  it("handles form input changes and submission", async () => {
    (freelancerService.updateProfile as any).mockResolvedValue({ ...mockProfile, headline: "Updated Headline" });
    
    renderWithRouter(<FreelancerProfileEdit />);
    const headlineInput = await screen.findByDisplayValue("Video Editor");
    
    await userEvent.clear(headlineInput);
    await userEvent.type(headlineInput, "Updated Headline");
    
    const saveButtons = screen.getAllByText(/save changes/i);
    fireEvent.click(saveButtons[0]);
    
    expect(freelancerService.updateProfile).toHaveBeenCalledWith(expect.objectContaining({
      headline: "Updated Headline"
    }));
  });

  it("switches tabs correctly", async () => {
    renderWithRouter(<FreelancerProfileEdit />);
    const skillsTab = await screen.findByRole("button", { name: /skills/i });
    fireEvent.click(skillsTab);
    
    expect(screen.getByText("Add Skills")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("adds and removes skills", async () => {
    renderWithRouter(<FreelancerProfileEdit />);
    const skillsTab = await screen.findByRole("button", { name: /skills/i });
    fireEvent.click(skillsTab);
    
    const skillInput = screen.getByPlaceholderText(/type a skill/i);
    await userEvent.type(skillInput, "Vue{enter}");
    
    expect(screen.getByText("Vue")).toBeInTheDocument();
    
    // Find remove button by title or aria-label if present, else by parent relation
    const removeButtons = screen.getAllByRole("button").filter(b => b.className.includes("text-red-"));
    if (removeButtons.length > 0) {
      fireEvent.click(removeButtons[removeButtons.length - 1]);
    }
    
    expect(screen.queryByText("Vue")).not.toBeInTheDocument();
  });

  it("displays loading state initially", async () => {
    (freelancerService.ensureProfile as any).mockReturnValue(new Promise(() => {}));
    renderWithRouter(<FreelancerProfileEdit />);
    expect(screen.getByText(/loading your profile/i)).toBeInTheDocument();
  });
});

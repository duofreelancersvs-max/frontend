import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import FreelancerApplications from "../../../pages/freelancer/Applications";
import { useAuthStore } from "@/stores/auth.store";
import { applicationService } from "@/services";
import type { User } from "@/types/auth.types";

vi.mock("@/services", () => ({
  applicationService: {
    getMyApplications: vi.fn(),
    withdraw: vi.fn(),
  },
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useOutletContext: () => ({ setSidebarOpen: vi.fn() }),
  };
});

describe("FreelancerApplications", () => {
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

  const mockApplications = {
    applications: [
      {
        id: "1",
        _id: "1",
        status: "pending",
        coverLetter: "I am a great dev.",
        createdAt: new Date().toISOString(),
        estimatedDuration: 10,
        project: {
          title: "React Web App",
          budget: { minAmount: 1000, maxAmount: 5000 },
          deadline: new Date().toISOString(),
          clientId: { firstName: "John", lastName: "Doe" }
        },
      },
      {
        id: "2",
        _id: "2",
        status: "accepted",
        coverLetter: "I can do this.",
        createdAt: new Date().toISOString(),
        estimatedDuration: 5,
        project: {
          title: "Logo Design",
          budget: { minAmount: 500, maxAmount: 1500 },
          deadline: new Date().toISOString(),
          clientId: { firstName: "Jane", lastName: "Smith" }
        },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: mockUser, isAuthenticated: true, isLoading: false });
    (applicationService.getMyApplications as any).mockResolvedValue(mockApplications);
  });

  it("renders applications list", async () => {
    renderWithRouter(<FreelancerApplications />);
    expect(await screen.findByText("React Web App")).toBeInTheDocument();
    expect(screen.getByText("Logo Design")).toBeInTheDocument();
  });

  it("filters by status", async () => {
    renderWithRouter(<FreelancerApplications />);
    await screen.findByText("React Web App");
    
    const pendingTab = screen.getByRole("button", { name: /pending/i });
    fireEvent.click(pendingTab);
    
    expect(screen.getByText("React Web App")).toBeInTheDocument();
    expect(screen.queryByText("Logo Design")).not.toBeInTheDocument();
  });

  it("opens application details modal", async () => {
    renderWithRouter(<FreelancerApplications />);
    const viewButtons = await screen.findAllByText(/view details/i);
    fireEvent.click(viewButtons[0]);
    
    expect(await screen.findByText("Application Details")).toBeInTheDocument();
    expect(screen.getByText("I am a great dev.")).toBeInTheDocument();
  });

  it("handles withdrawal", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    (applicationService.withdraw as any).mockResolvedValue({});
    
    renderWithRouter(<FreelancerApplications />);
    const withdrawButtons = await screen.findAllByText(/withdraw/i);
    fireEvent.click(withdrawButtons[0]);
    
    expect(applicationService.withdraw).toHaveBeenCalledWith("1");
    await waitFor(() => {
      expect(applicationService.getMyApplications).toHaveBeenCalledTimes(2);
    });
  });

  it("renders empty state", async () => {
    (applicationService.getMyApplications as any).mockResolvedValue({ applications: [] });
    renderWithRouter(<FreelancerApplications />);
    expect(await screen.findByText(/no applications found/i)).toBeInTheDocument();
  });
});

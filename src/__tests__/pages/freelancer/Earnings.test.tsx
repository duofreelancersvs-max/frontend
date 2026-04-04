import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import FreelancerEarnings from "../../../pages/freelancer/Earnings";
import { useAuthStore } from "@/stores/auth.store";
import { projectService } from "@/services/project.service";
import type { User } from "@/types/auth.types";

vi.mock("@/services/project.service", () => ({
  projectService: {
    getMyFreelancerProjects: vi.fn(),
  },
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useOutletContext: () => ({ setSidebarOpen: vi.fn() }),
  };
});

describe("FreelancerEarnings", () => {
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

  const mockProjects = {
    projects: [
      {
        _id: "p1",
        title: "Project 1",
        status: "completed",
        budget: { maxAmount: 5000 },
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: "Video Editing",
        client: { fullName: "Client A" }
      },
      {
        _id: "p2",
        title: "Project 2",
        status: "in-progress",
        budget: { maxAmount: 3000 },
        updatedAt: new Date().toISOString(),
        category: "Motion Graphics",
        client: { fullName: "Client B" }
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: mockUser, isAuthenticated: true, isLoading: false });
    (projectService.getMyFreelancerProjects as any).mockResolvedValue(mockProjects);
  });

  it("renders earnings stats", async () => {
    renderWithRouter(<FreelancerEarnings />);
    expect(await screen.findByText("₹5,000")).toBeInTheDocument(); // Total Earnings
    expect(screen.getByText("₹3,000")).toBeInTheDocument(); // Pending
    expect(screen.getByText("1")).toBeInTheDocument(); // Projects Completed
  });

  it("renders recent transactions table", async () => {
    renderWithRouter(<FreelancerEarnings />);
    expect(await screen.findByText("Project 1")).toBeInTheDocument();
    expect(screen.getByText("Client A")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    
    expect(screen.getByText("Project 2")).toBeInTheDocument();
    expect(screen.getAllByText("Pending")[0]).toBeInTheDocument();
  });

  it("handles date range selection", async () => {
    renderWithRouter(<FreelancerEarnings />);
    const last3MonthsBtn = await screen.findByText("Last 3 Months");
    fireEvent.click(last3MonthsBtn);
    
    expect(last3MonthsBtn).toHaveClass("bg-white text-navy shadow-sm");
  });

  it("renders chart elements", async () => {
    renderWithRouter(<FreelancerEarnings />);
    // Check if the chart container or some bars are present
    expect(await screen.findByText("Earnings Overview")).toBeInTheDocument();
    expect(screen.getByText("Jan")).toBeInTheDocument();
    expect(screen.getByText("Dec")).toBeInTheDocument();
  });

  it("displays loading state initially", async () => {
    (projectService.getMyFreelancerProjects as any).mockReturnValue(new Promise(() => {}));
    const { container } = renderWithRouter(<FreelancerEarnings />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});

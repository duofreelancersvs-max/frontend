import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import FreelancerDashboard from "../../../pages/freelancer/Dashboard";
import { useAuthStore } from "@/stores/auth.store";
import {
  freelancerService,
  applicationService,
  projectService,
  subscriptionService,
  conversationService,
} from "@/services";
import type { User } from "@/types/auth.types";

window.HTMLElement.prototype.scrollIntoView = vi.fn();

vi.mock("@/services", () => ({
  freelancerService: {
    getMyProfile: vi.fn(),
  },
  applicationService: {
    getMyApplications: vi.fn(),
  },
  projectService: {
    search: vi.fn(),
  },
  subscriptionService: {
    getMySubscription: vi.fn(),
  },
  conversationService: {
    getAll: vi.fn(),
  },
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useOutletContext: () => ({ setSidebarOpen: vi.fn() }),
  };
});

describe("FreelancerDashboard", () => {
  const mockUser: User = {
    _id: "1",
    email: "freelancer@example.com",
    fullName: "Test Freelancer",
    role: "freelancer",
    phone: "1234567890",
    status: "active",
    isEmailVerified: true,
    isPhoneVerified: true,
  };

  const mockProfile = {
    id: "1",
    userId: "1",
    title: "Full Stack Developer",
    bio: "Experienced developer",
    skills: ["React", "Node.js"],
    portfolio: [{ id: "1", title: "Project 1" }],
    workExperience: [{ id: "1", role: "Dev" }],
    education: [{ id: "1", school: "Uni" }],
    availability: "full-time",
    totalReviews: 10,
  };

  const mockApplications = {
    applications: [
      {
        id: "app-1",
        status: "pending",
        createdAt: new Date().toISOString(),
        project: {
          title: "Test Project",
          budget: { minAmount: 1000, maxAmount: 5000 },
        },
      },
    ],
  };

  const mockProjects = {
    projects: [
      {
        id: "proj-1",
        title: "Recommended Project",
        budget: { minAmount: 2000, maxAmount: 4000 },
        skills: ["React"],
        createdAt: new Date().toISOString(),
        client: { fullName: "Test Client" },
      },
    ],
  };

  const mockSubscription = {
    plan: "pro",
    endDate: new Date(Date.now() + 86400000).toISOString(),
  };

  const mockConversations = {
    conversations: [
      {
        id: "conv-1",
        unreadCount: 2,
        participants: [{ fullName: "John Doe" }],
        lastMessage: { content: "Hello", createdAt: new Date().toISOString() },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: mockUser, isAuthenticated: true, isLoading: false });
    
    (freelancerService.getMyProfile as any).mockResolvedValue(mockProfile);
    (applicationService.getMyApplications as any).mockResolvedValue(mockApplications);
    (projectService.search as any).mockResolvedValue(mockProjects);
    (subscriptionService.getMySubscription as any).mockResolvedValue(mockSubscription);
    (conversationService.getAll as any).mockResolvedValue(mockConversations);
  });

  it("renders dashboard with welcome message", async () => {
    renderWithRouter(<FreelancerDashboard />);
    expect(await screen.findByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Welcome back, freelancer/i)).toBeInTheDocument();
  });

  it("displays stats cards correctly", async () => {
    renderWithRouter(<FreelancerDashboard />);
    await waitFor(() => {
      expect(screen.getByText("10")).toBeInTheDocument(); // Profile views
      expect(screen.getByText("1")).toBeInTheDocument(); // Active applications
    });
  });

  it("shows profile completeness", async () => {
    renderWithRouter(<FreelancerDashboard />);
    expect(await screen.findByText(/Complete Your Profile/i)).toBeInTheDocument();
    expect(screen.getAllByText(/100/)[0]).toBeInTheDocument();
  });

  it("renders recommended projects", async () => {
    renderWithRouter(<FreelancerDashboard />);
    expect(await screen.findByText("Recommended Project")).toBeInTheDocument();
  });

  it("toggles profile dropdown", async () => {
    renderWithRouter(<FreelancerDashboard />);
    const avatar = await screen.findByText("TF");
    fireEvent.click(avatar.closest("button")!);
    
    expect(screen.getByText("My Profile")).toBeInTheDocument();
  });
});

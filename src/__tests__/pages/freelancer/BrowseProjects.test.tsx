import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "@/__tests__/test-utils";
import BrowseProjects from "../../../pages/freelancer/BrowseProjects";
import { useAuth } from "@/hooks/useAuth";
import { projectService, conversationService } from "@/services";
import type { User } from "@/types/auth.types";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/services", () => ({
  projectService: {
    search: vi.fn(),
  },
  conversationService: {
    create: vi.fn(),
    getAll: vi.fn()
  },
}));

vi.mock("@/components/modals/ProjectApplicationModal", () => ({
  __esModule: true,
  default: ({ isOpen, onSuccess }: { isOpen: boolean, onSuccess: () => void }) => 
    isOpen ? <div data-testid="application-modal"><button onClick={onSuccess}>Submit App</button></div> : null
}));

vi.mock("@/components/modals/TermsModal", () => ({
  TermsModal: ({ isOpen, onAccept }: { isOpen: boolean, onAccept: () => void }) => 
    isOpen ? <div data-testid="terms-modal"><button onClick={onAccept}>Accept Terms</button></div> : null
}));

describe("BrowseProjects", () => {
  const mockUser: User = {
    _id: "user-1",
    email: "freelancer@example.com",
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
        id: "1",
        _id: "1",
        title: "React Developer Needed",
        description: "Looking for a React expert to build a dashboard.",
        skills: ["React", "TypeScript"],
        budget: { minAmount: 5000, maxAmount: 10000, type: "fixed" },
        createdAt: new Date().toISOString(),
        applications: 5,
        location: { type: "remote" },
        client: { fullName: "John Doe" },
      },
      {
        id: "2",
        _id: "2",
        title: "Video Editor for YouTube",
        description: "Edit high-quality videos for my channel.",
        skills: ["Premiere Pro", "After Effects"],
        budget: { minAmount: 1000, maxAmount: 3000, type: "hourly" },
        createdAt: new Date().toISOString(),
        applications: 2,
        location: { type: "onsite", city: "Hyderabad" },
        client: { fullName: "Jane Smith" },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });
    (projectService.search as any).mockResolvedValue(mockProjects);
    (conversationService.getAll as any).mockResolvedValue({ conversations: [] });
  });

  it("renders projects list", async () => {
    renderWithRouter(<BrowseProjects />);
    expect(await screen.findByText("React Developer Needed")).toBeInTheDocument();
  });

  it("handles search filtering", async () => {
    renderWithRouter(<BrowseProjects />);
    await screen.findByText("React Developer Needed");
    
    const searchInput = screen.getByPlaceholderText(/search projects/i);
    await userEvent.type(searchInput, "React");
    
    expect(screen.getByText("React Developer Needed")).toBeInTheDocument();
    expect(screen.queryByText("Video Editor for YouTube")).not.toBeInTheDocument();
  });

  it("can clear all filters", async () => {
    renderWithRouter(<BrowseProjects />);
    await screen.findByText("React Developer Needed");
    
    const searchInput = screen.getByPlaceholderText(/search projects/i);
    await userEvent.type(searchInput, "React");
    
    const clearButton = screen.getByText(/clear all filters/i);
    fireEvent.click(clearButton);
    
    expect(screen.getByText("Video Editor for YouTube")).toBeInTheDocument();
  });

  it("handles project application flow", async () => {
    (conversationService.create as any).mockResolvedValue({});
    renderWithRouter(<BrowseProjects />);
    await screen.findByText("React Developer Needed");
    
    const applyButtons = screen.getAllByRole("button", { name: /apply now/i });
    fireEvent.click(applyButtons[0]);
    
    // Terms Modal
    expect(await screen.findByTestId("terms-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Accept Terms"));
    
    // Application Modal
    await waitFor(async () => {
      expect(await screen.findByTestId("application-modal")).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText("Submit App"));
    
    await waitFor(() => {
      expect(conversationService.create).toHaveBeenCalled();
    });
  });

  it("displays loading state initially", async () => {
    (projectService.search as any).mockReturnValue(new Promise(() => {}));
    renderWithRouter(<BrowseProjects />);
    expect(screen.getByText(/loading projects/i)).toBeInTheDocument();
  });
});

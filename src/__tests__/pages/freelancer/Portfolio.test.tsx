import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import FreelancerPortfolio from "../../../pages/freelancer/Portfolio";
import { useAuthStore } from "@/stores/auth.store";
import { freelancerService } from "@/services";
import type { User } from "@/types/auth.types";

vi.mock("@/services", () => ({
  freelancerService: {
    getMyProfile: vi.fn(),
    addPortfolio: vi.fn(),
    updatePortfolio: vi.fn(),
    removePortfolio: vi.fn(),
  },
}));

vi.mock("@/components/modals/AddPortfolioModal", () => ({
  AddPortfolioModal: ({ isOpen, onClose, onSubmit }: any) => 
    isOpen ? (
      <div data-testid="portfolio-modal">
        <button onClick={() => onSubmit({ 
          title: "New Project", 
          description: "Desc", 
          projectUrl: "http", 
          category: "Social Media", 
          thumbnail: "thumb" 
        })}>Submit</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useOutletContext: () => ({ setSidebarOpen: vi.fn() }),
  };
});

describe("FreelancerPortfolio", () => {
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
    portfolio: [
      {
        id: "1",
        _id: "1",
        title: "Test Video",
        description: "A cool video",
        skills: ["Social Media"],
        projectUrl: "http://example.com",
        thumbnail: "thumb.jpg",
        views: 100
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: mockUser, isAuthenticated: true, isLoading: false });
    (freelancerService.getMyProfile as any).mockResolvedValue(mockProfile);
  });

  it("renders portfolio list", async () => {
    renderWithRouter(<FreelancerPortfolio />);
    expect(await screen.findByText("Test Video")).toBeInTheDocument();
    expect(screen.getByText("A cool video")).toBeInTheDocument();
    expect(screen.getAllByText("100")[0]).toBeInTheDocument(); // Views
  });

  it("filters by category", async () => {
    renderWithRouter(<FreelancerPortfolio />);
    await screen.findByText("Test Video");
    
    const weddingFilter = screen.getByText("Wedding Videos");
    fireEvent.click(weddingFilter);
    
    expect(screen.queryByText("Test Video")).not.toBeInTheDocument();
  });

  it("opens add modal and submits new project", async () => {
    (freelancerService.addPortfolio as any).mockResolvedValue({
      portfolio: [...mockProfile.portfolio, { id: "2", title: "New Project", skills: ["Social Media"] }]
    });
    
    renderWithRouter(<FreelancerPortfolio />);
    const addBtn = await screen.findByText(/add project/i);
    fireEvent.click(addBtn);
    
    expect(screen.getByTestId("portfolio-modal")).toBeInTheDocument();
    
    const submitBtn = screen.getByText("Submit");
    fireEvent.click(submitBtn);
    
    expect(freelancerService.addPortfolio).toHaveBeenCalled();
    expect(await screen.findByText("New Project")).toBeInTheDocument();
  });

  it("handles project deletion", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    (freelancerService.removePortfolio as any).mockResolvedValue({ portfolio: [] });
    
    renderWithRouter(<FreelancerPortfolio />);
    await screen.findByText("Test Video");
    
    // Open menu
    const menuBtn = screen.getAllByRole("button").find(b => b.className.includes("p-1.5"));
    if (menuBtn) fireEvent.click(menuBtn);
    
    const deleteBtn = screen.getByText(/delete/i);
    fireEvent.click(deleteBtn);
    
    expect(freelancerService.removePortfolio).toHaveBeenCalledWith("1");
    expect(await screen.findByText(/no projects in this category/i)).toBeInTheDocument();
  });

  it("copies project link to clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    });
    
    renderWithRouter(<FreelancerPortfolio />);
    await screen.findByText("Test Video");
    
    const menuBtn = screen.getAllByRole("button").find(b => b.className.includes("p-1.5"));
    if (menuBtn) fireEvent.click(menuBtn);
    
    const shareBtn = screen.getByText(/share/i);
    fireEvent.click(shareBtn);
    
    expect(writeText).toHaveBeenCalledWith("http://example.com");
  });
});

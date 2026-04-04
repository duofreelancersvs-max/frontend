import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import ClientDashboard from "@/pages/client/Dashboard";
import { useAuthStore } from "@/stores/auth.store";

// Mock react-router-dom
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useOutletContext: () => ({ setSidebarOpen: vi.fn(), sidebarOpen: false }),
  };
});

// Mock services
vi.mock("@/services", () => ({
  projectService: {
    getMyClientProjects: vi.fn(() => Promise.resolve({ 
      projects: [
        {
          _id: "1",
          title: "E-commerce Website",
          status: "in-progress",
          budget: { minAmount: 1000, maxAmount: 5000 },
          createdAt: new Date().toISOString(),
          freelancer: { fullName: "Arun Kumar" }
        }
      ], 
      total: 1 
    })),
  },
  freelancerService: {
    getTopRated: vi.fn(() => Promise.resolve({ 
      profiles: [
        { 
          id: "1", 
          userId: "Rahul Sharma", 
          title: "Full Stack Developer", 
          skills: ["React", "Node.js"], 
          rating: 4.8, 
          totalReviews: 25 
        }
      ] 
    })),
  },
  conversationService: {
    getAll: vi.fn(() => Promise.resolve({ 
      conversations: [
        { 
          id: "1", 
          participants: [{ fullName: "Arun Kumar" }], 
          lastMessage: { content: "Hi", createdAt: new Date().toISOString() }, 
          unreadCount: 1 
        }
      ] 
    })),
  },
  userService: {
    getMe: vi.fn(() => Promise.resolve({ fullName: "Rajesh Kumar" })),
  },
  clientService: {
    getMyProfile: vi.fn(() => Promise.resolve({ companyName: "Test Co" })),
  },
  applicationService: {
    getMyClientApplications: vi.fn(() => Promise.resolve({ 
      applications: [
        { 
          id: "1", 
          freelancer: { fullName: "Meera Reddy" }, 
          project: { title: "Mobile App" }, 
          status: "pending", 
          createdAt: new Date().toISOString() 
        }
      ] 
    })),
  },
}));

// Mock lucide-react icons
vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
    Home: () => <svg data-testid="home-icon" />,
    Folder: () => <svg data-testid="folder-icon" />,
    PlusCircle: () => <svg data-testid="plus-circle-icon" />,
    Search: () => <svg data-testid="search-icon" />,
    Mail: () => <svg data-testid="mail-icon" />,
    CreditCard: () => <svg data-testid="credit-card-icon" />,
    Star: () => <svg data-testid="star-icon" />,
    Settings: () => <svg data-testid="settings-icon" />,
    Bell: () => <svg data-testid="bell-icon" />,
    ChevronDown: () => <svg data-testid="chevron-down-icon" />,
    LogOut: () => <svg data-testid="logout-icon" />,
    User: () => <svg data-testid="user-icon" />,
    ArrowRight: () => <svg data-testid="arrow-right-icon" />,
    Clock: () => <svg data-testid="clock-icon" />,
    MessageSquare: () => <svg data-testid="message-square-icon" />,
    TrendingUp: () => <svg data-testid="trending-up-icon" />,
    CheckCircle: () => <svg data-testid="check-circle-icon" />,
    AlertCircle: () => <svg data-testid="alert-circle-icon" />,
    Sparkles: () => <svg data-testid="sparkles-icon" />,
    X: () => <svg data-testid="x-icon" />,
    Menu: () => <svg data-testid="menu-icon" />,
  };
});

describe("ClientDashboard", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { 
        _id: "1", 
        fullName: "Rajesh Kumar", 
        role: "client", 
        email: "rajesh@example.com",
        phone: "9876543210",
        status: "active",
        isEmailVerified: true,
        isPhoneVerified: true
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  const renderAndNavigate = async () => {
    renderWithRouter(<ClientDashboard />);
    await waitFor(() => {
      expect(screen.queryAllByText(/Welcome back/i).length).toBeGreaterThan(0);
    });
  };

  it("renders dashboard header with welcome message", async () => {
    await renderAndNavigate();
    // Use getAllByText for Dashboard label as well if multiple
    expect(screen.getAllByText(/dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rajesh Kumar/i).length).toBeGreaterThan(0);
  });

  it("renders sidebar navigation", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/dashboard/i).length).toBeGreaterThan(0);
  });

  it("renders welcome banner with greeting", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/Rajesh Kumar/i).length).toBeGreaterThan(0);
  });

  it("renders post new project button", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/post new project/i).length).toBeGreaterThan(0);
  });

  it("renders find freelancers button", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/find freelancers/i).length).toBeGreaterThan(0);
  });

  it("renders stats cards", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/active projects/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/completed projects/i).length).toBeGreaterThan(0);
  });

  it("renders active projects section", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/active projects/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/e-commerce website/i).length).toBeGreaterThan(0);
  });

  it("displays project status badges", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/in progress/i).length).toBeGreaterThan(0);
  });

  it("renders recent applications section", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/recent applications/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/meera reddy/i).length).toBeGreaterThan(0);
  });

  it("displays application status badges", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/pending/i).length).toBeGreaterThan(0);
  });

  it("renders recommended freelancers section", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/recommended for you/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/rahul sharma/i).length).toBeGreaterThan(0);
  });

  it("displays freelancer rates and ratings", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/4.8/i).length).toBeGreaterThan(0);
  });

  it("renders recent messages section", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/recent messages/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/arun kumar/i).length).toBeGreaterThan(0);
  });

  it("displays notification badges", async () => {
    await renderAndNavigate();
    const bell = screen.getByTestId("bell-icon");
    expect(bell.parentElement?.querySelector(".bg-red-500")).toBeInTheDocument();
  });

  it("renders quick actions section", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/quick actions/i).length).toBeGreaterThan(0);
  });

  it("renders recent activity feed", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/recent activity/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/new project created/i).length).toBeGreaterThan(0);
  });

  it("renders header with notification bell", async () => {
    await renderAndNavigate();
    expect(screen.getByTestId("bell-icon")).toBeInTheDocument();
  });

  it("renders view all links", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/view all/i).length).toBeGreaterThan(0);
  });

  it("renders mobile menu button", async () => {
    await renderAndNavigate();
    expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
  });

  it("has link to projects page", async () => {
    await renderAndNavigate();
    const viewAllLinks = screen.getAllByRole("link", { name: /view all/i });
    expect(viewAllLinks.length).toBeGreaterThan(0);
  });
});

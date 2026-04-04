import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "@/__tests__/test-utils";
import ClientProjects from "@/pages/client/Projects";
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
          title: "E-commerce product video",
          category: "Video Editing",
          status: "in-progress",
          description: "Help us create a stunning video for our shop",
          skills: ["Adobe Premiere Pro"],
          budget: { minAmount: 5000, maxAmount: 15000 },
          applications: 12,
          deadline: "2024-12-31",
          createdAt: new Date().toISOString(),
          freelancer: { fullName: "Arun Kumar" }
        },
        {
          _id: "2",
          title: "Corporate explainer animation",
          category: "Motion Graphics",
          status: "open",
          description: "Animate our brand story and values",
          skills: ["After Effects"],
          budget: { minAmount: 10000, maxAmount: 25000 },
          applications: 8,
          deadline: "2024-12-31",
          createdAt: new Date().toISOString()
        },
        {
          _id: "3",
          title: "YouTube channel intro",
          category: "3D Design",
          status: "completed",
          description: "Cool 3D intro for a tech channel",
          skills: ["Cinema 4D"],
          budget: { minAmount: 15000, maxAmount: 45000 },
          applications: 24,
          deadline: "2024-12-31",
          createdAt: new Date().toISOString(),
          freelancer: { fullName: "Priya Sharma" }
        }
      ], 
      total: 3 
    })),
    getMyClientStats: vi.fn(() => Promise.resolve({
      total: 3,
      open: 1,
      inProgress: 1,
      completed: 1,
      cancelled: 0,
      drafts: 0
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
    X: () => <svg data-testid="x-icon" />,
    Menu: () => <svg data-testid="menu-icon" />,
    MoreVertical: () => <svg data-testid="more-vertical-icon" />,
    Grid3X3: () => <svg data-testid="grid-icon" />,
    List: () => <svg data-testid="list-icon" />,
    Clock: () => <svg data-testid="clock-icon" />,
    Users: () => <svg data-testid="users-icon" />,
    ChevronLeft: () => <svg data-testid="chevron-left-icon" />,
    ChevronRight: () => <svg data-testid="chevron-right-icon" />,
    Edit2: () => <svg data-testid="edit-icon" />,
    Trash2: () => <svg data-testid="trash-icon" />,
    Copy: () => <svg data-testid="copy-icon" />,
    Eye: () => <svg data-testid="eye-icon" />,
    CheckCircle: () => <svg data-testid="check-circle-icon" />,
    Briefcase: () => <svg data-testid="briefcase-icon" />,
    MapPin: () => <svg data-testid="map-pin-icon" />,
    Calendar: () => <svg data-testid="calendar-icon" />,
    Loader2: () => <svg data-testid="loader-icon" />,
    MessageSquare: () => <svg data-testid="message-square-icon" />,
  };
});

describe("ClientProjects", () => {
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
    renderWithRouter(<ClientProjects />);
    await waitFor(() => {
      expect(screen.queryAllByText(/My Projects/i).length).toBeGreaterThan(0);
    });
  };

  it("renders page header with title", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/my projects/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/manage and track all your projects/i)
    ).toBeInTheDocument();
  });

  it("has user initials in header", async () => {
    await renderAndNavigate();
    expect(screen.getByText("RK")).toBeInTheDocument();
  });

  it("renders post new project button", async () => {
    await renderAndNavigate();
    expect(
      screen.getAllByText(/post new project/i).length
    ).toBeGreaterThan(0);
  });

  it("renders project tabs", async () => {
    await renderAndNavigate();
    const allTabs = screen.getAllByRole("button");
    expect(allTabs.some(btn => btn.textContent?.toLowerCase().includes("all"))).toBe(true);
    expect(allTabs.some(btn => btn.textContent?.toLowerCase().includes("open"))).toBe(true);
    expect(allTabs.some(btn => btn.textContent?.toLowerCase().includes("in progress"))).toBe(true);
    expect(allTabs.some(btn => btn.textContent?.toLowerCase().includes("completed"))).toBe(true);
  });

  it("renders search input", async () => {
    await renderAndNavigate();
    expect(
      screen.getByPlaceholderText(/search projects/i)
    ).toBeInTheDocument();
  });

  it("allows searching projects", async () => {
    await renderAndNavigate();
    const searchInput = screen.getByPlaceholderText(/search projects/i);
    await userEvent.type(searchInput, "e-commerce");
    expect(searchInput).toHaveValue("e-commerce");
  });

  it("renders sort dropdown", async () => {
    await renderAndNavigate();
    expect(screen.getByText(/recent/i)).toBeInTheDocument();
  });

  it("renders view mode toggle", async () => {
    await renderAndNavigate();
    const gridButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("[data-testid='grid-icon']")
    );
    const listButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("[data-testid='list-icon']")
    );
    expect(gridButtons.length || listButtons.length).toBeGreaterThan(0);
  });

  it("renders project cards in grid view", async () => {
    await renderAndNavigate();
    expect(screen.getByText(/e-commerce product video/i)).toBeInTheDocument();
    expect(screen.getByText(/corporate explainer animation/i)).toBeInTheDocument();
    expect(screen.getByText(/youtube channel intro/i)).toBeInTheDocument();
  });

  it("displays project categories", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/video editing/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/motion graphics/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3d design/i).length).toBeGreaterThan(0);
  });

  it("displays project status badges", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/in progress/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/open/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/completed/i).length).toBeGreaterThan(0);
  });

  it("displays project budgets", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/₹15,000/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/₹25,000/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/₹45,000/i).length).toBeGreaterThan(0);
  });

  it("displays project applications count", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/12/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/8/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/24/i).length).toBeGreaterThan(0);
  });

  it("displays project skills", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/adobe premiere pro/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/after effects/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/cinema 4d/i).length).toBeGreaterThan(0);
  });

  it("renders view details buttons", async () => {
    await renderAndNavigate();
    const viewButtons = screen.getAllByRole("button", { name: /view details/i });
    expect(viewButtons.length).toBeGreaterThan(0);
  });

  it("renders applications buttons for open projects", async () => {
    await renderAndNavigate();
    const applicationsButtons = screen.getAllByRole("button", { name: /applications/i });
    expect(applicationsButtons.length).toBeGreaterThan(0);
  });

  it("displays assigned freelancers for active projects", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/arun kumar/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/priya sharma/i).length).toBeGreaterThan(0);
  });

  it("shows not assigned for open projects", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/not assigned/i).length).toBeGreaterThan(0);
  });

  it("allows switching between tabs", async () => {
    await renderAndNavigate();
    const allButtons = screen.getAllByRole("button");
    const openTab = allButtons.find(btn => btn.textContent?.toLowerCase().includes("open"));
    if (openTab) {
      await userEvent.click(openTab);
      expect(openTab).toHaveClass("border-teal");
    }
  });

  it("renders action menu buttons on project cards", async () => {
    await renderAndNavigate();
    const menuButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("[data-testid='more-vertical-icon']")
    );
    expect(menuButtons.length).toBeGreaterThan(0);
  });

  it("renders header with notification bell", async () => {
    await renderAndNavigate();
    const bellButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("[data-testid='bell-icon']")
    );
    expect(bellButtons.length).toBeGreaterThan(0);
  });

  it("renders mobile menu button", async () => {
    await renderAndNavigate();
    const menuButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("[data-testid='menu-icon']")
    );
    expect(menuButtons.length).toBeGreaterThan(0);
  });
});

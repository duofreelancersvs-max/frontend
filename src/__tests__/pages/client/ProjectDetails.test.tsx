import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import ProjectDetails from "@/pages/client/ProjectDetails";
import { useAuthStore } from "@/stores/auth.store";

// Mock react-router-dom
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useParams: () => ({ id: "1" }),
    useOutletContext: () => ({ setSidebarOpen: vi.fn(), sidebarOpen: false }),
  };
});

// Mock services
vi.mock("@/services", () => ({
  projectService: {
    getById: vi.fn(() => Promise.resolve({
      _id: "1",
      title: "E-commerce product video",
      category: "Video Editing",
      status: "open",
      description: "looking for a skilled video editor for our growth",
      skills: ["Adobe Premiere Pro", "After Effects"],
      budget: { minAmount: 15000, maxAmount: 25000 },
      deadline: "2024-12-31T00:00:00.000Z",
      createdAt: new Date().toISOString(),
      applications: 12
    })),
    complete: vi.fn(() => Promise.resolve({})),
    cancel: vi.fn(() => Promise.resolve({})),
  },
  applicationService: {
    getByProject: vi.fn(() => Promise.resolve({
      applications: [
        {
          _id: "app1",
          coverLetter: "I can help with this",
          proposedRate: 20000,
          estimatedDuration: 5,
          status: "pending",
          createdAt: new Date().toISOString(),
          freelancer: { fullName: "Arun Kumar", title: "Video Editor" }
        }
      ]
    })),
    updateStatus: vi.fn(() => Promise.resolve({})),
  }
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
    ChevronRight: () => <svg data-testid="chevron-right-icon" />,
    Edit2: () => <svg data-testid="edit-icon" />,
    Share2: () => <svg data-testid="share-icon" />,
    XCircle: () => <svg data-testid="x-circle-icon" />,
    Download: () => <svg data-testid="download-icon" />,
    FileText: () => <svg data-testid="file-text-icon" />,
    Clock: () => <svg data-testid="clock-icon" />,
    Calendar: () => <svg data-testid="calendar-icon" />,
    MapPin: () => <svg data-testid="map-pin-icon" />,
    Briefcase: () => <svg data-testid="briefcase-icon" />,
    Users: () => <svg data-testid="users-icon" />,
    MessageSquare: () => <svg data-testid="message-square-icon" />,
    Heart: () => <svg data-testid="heart-icon" />,
    CheckCircle: () => <svg data-testid="check-circle-icon" />,
    Eye: () => <svg data-testid="eye-icon" />,
    ThumbsUp: () => <svg data-testid="thumbs-up-icon" />,
    ThumbsDown: () => <svg data-testid="thumbs-down-icon" />,
    Send: () => <svg data-testid="send-icon" />,
    Award: () => <svg data-testid="award-icon" />,
    TrendingUp: () => <svg data-testid="trending-up-icon" />,
    Verified: () => <svg data-testid="verified-icon" />,
    Loader2: () => <svg data-testid="loader-icon" />,
  };
});

describe("ProjectDetails", () => {
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
    renderWithRouter(<ProjectDetails />);
    await waitFor(() => {
      expect(screen.queryAllByText(/E-commerce product video/i).length).toBeGreaterThan(0);
    });
  };

  it("renders project title", async () => {
    await renderAndNavigate();
    expect(
      screen.getAllByText(/e-commerce product video/i).length
    ).toBeGreaterThan(0);
  });

  it("renders project status badge", async () => {
    await renderAndNavigate();
    expect(screen.getByText(/open for applications/i)).toBeInTheDocument();
  });

  it("renders project category", async () => {
    await renderAndNavigate();
    expect(
      screen.getAllByText(/video editing/i).length
    ).toBeGreaterThan(0);
  });

  it("renders project description", async () => {
    await renderAndNavigate();
    expect(
      screen.getByText(/looking for a skilled video editor/i)
    ).toBeInTheDocument();
  });

  it("renders budget information", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/15,000/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/25,000/i).length).toBeGreaterThan(0);
  });

  it("renders location preference", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/remote/i).length).toBeGreaterThan(0);
  });

  it("renders required skills", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/adobe premiere pro/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/after effects/i).length).toBeGreaterThan(0);
  });

  it("renders applications count", async () => {
    await renderAndNavigate();
    // "12 applications" is in the header
    expect(screen.getAllByText(/12 applications/i).length).toBeGreaterThan(0);
    // There is also a "Total Applications" card with count "1" (from our mock app list)
    expect(screen.getAllByText(/1/i).length).toBeGreaterThan(0);
  });

  it("renders posted date", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/posted/i).length).toBeGreaterThan(0);
  });

  it("renders breadcrumb navigation", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/my projects/i).length).toBeGreaterThan(0);
  });

  it("renders edit project button for open projects", async () => {
    await renderAndNavigate();
    const editButtons = screen.getAllByRole("link").filter((link) =>
      link.textContent?.toLowerCase().includes("edit project")
    );
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it("renders applications section", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/applications/i).length).toBeGreaterThan(0);
  });

  it("renders about the project section", async () => {
    await renderAndNavigate();
    expect(screen.getByText(/about the project/i)).toBeInTheDocument();
  });

  it("has user initials in header", async () => {
    await renderAndNavigate();
    expect(screen.getByText("RK")).toBeInTheDocument();
  });
});

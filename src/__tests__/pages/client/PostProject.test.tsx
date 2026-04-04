import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "@/__tests__/test-utils";
import PostProject from "@/pages/client/PostProject";
import { useAuthStore } from "@/stores/auth.store";

// Mock react-router-dom
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useOutletContext: () => ({ setSidebarOpen: vi.fn(), sidebarOpen: false }),
    useParams: () => ({ id: undefined }),
  };
});

// Mock services
vi.mock("@/services", () => ({
  projectService: {
    getById: vi.fn(() => Promise.resolve({
      _id: "1",
      title: "Test Project",
      category: "Editing",
      description: "Test description",
      skills: ["Adobe Premiere Pro"],
      budget: { minAmount: 1000, maxAmount: 5000 },
      deadline: "2024-12-31"
    })),
    create: vi.fn(() => Promise.resolve({})),
    update: vi.fn(() => Promise.resolve({})),
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
    Check: () => <svg data-testid="check-icon" />,
    Upload: () => <svg data-testid="upload-icon" />,
    X: () => <svg data-testid="x-icon" />,
    Menu: () => <svg data-testid="menu-icon" />,
    FileText: () => <svg data-testid="file-text-icon" />,
    ClipboardList: () => <svg data-testid="clipboard-list-icon" />,
    Wallet: () => <svg data-testid="wallet-icon" />,
    Eye: () => <svg data-testid="eye-icon" />,
    Lightbulb: () => <svg data-testid="lightbulb-icon" />,
    Calendar: () => <svg data-testid="calendar-icon" />,
    MapPin: () => <svg data-testid="map-pin-icon" />,
    Users: () => <svg data-testid="users-icon" />,
    Edit2: () => <svg data-testid="edit-icon" />,
    CheckCircle: () => <svg data-testid="check-circle-icon" />,
    AlertCircle: () => <svg data-testid="alert-circle-icon" />,
    Sparkles: () => <svg data-testid="sparkles-icon" />,
    MessageSquare: () => <svg data-testid="message-square-icon" />,
    Loader2: () => <svg data-testid="loader-icon" />,
  };
});

describe("PostProject", () => {
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
    renderWithRouter(<PostProject />);
    await waitFor(() => {
      expect(screen.queryAllByText(/Post a New Project/i).length).toBeGreaterThan(0);
    });
  };

  it("renders page header with title", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/post a new project/i).length).toBeGreaterThan(0);
  });

  it("renders page subtitle", async () => {
    await renderAndNavigate();
    expect(
      screen.getByText(/find the perfect freelancer for your project/i)
    ).toBeInTheDocument();
  });

  it("has user initials in header", async () => {
    await renderAndNavigate();
    expect(screen.getByText("RK")).toBeInTheDocument();
  });

  it("renders project title input", async () => {
    await renderAndNavigate();
    expect(screen.getByPlaceholderText(/e.g., wedding video editing/i)).toBeInTheDocument();
  });

  it("allows entering project title", async () => {
    await renderAndNavigate();
    const titleInput = screen.getByPlaceholderText(/e.g., wedding video editing/i);
    await userEvent.type(titleInput, "E-commerce Product Video");
    expect(titleInput).toHaveValue("E-commerce Product Video");
  });

  it("renders category selection", async () => {
    await renderAndNavigate();
    // The specific categories are in the component as constants
    expect(screen.getByText(/Editing/i)).toBeInTheDocument();
    expect(screen.getByText(/VFX/i)).toBeInTheDocument();
  });

  it("renders description textarea", async () => {
    await renderAndNavigate();
    expect(
      screen.getByPlaceholderText(/describe your project in detail/i)
    ).toBeInTheDocument();
  });

  it("allows entering project description", async () => {
    await renderAndNavigate();
    const descInput = screen.getByPlaceholderText(/describe your project in detail/i);
    await userEvent.clear(descInput);
    await userEvent.type(
      descInput,
      "Need a professional video for our e-commerce store"
    );
    expect(descInput).toHaveValue(
      "Need a professional video for our e-commerce store"
    );
  });

  it("renders skills selection section on step 2", async () => {
    await renderAndNavigate();
    // Navigate to step 2
    const nextButton = screen.getByRole("button", { name: /next: requirements/i });
    await userEvent.click(nextButton);
    expect(screen.getByText(/skills required/i)).toBeInTheDocument();
  });

  it("renders experience level selection on step 2", async () => {
    await renderAndNavigate();
    const nextButton = screen.getByRole("button", { name: /next: requirements/i });
    await userEvent.click(nextButton);
    expect(screen.getAllByText(/experience level/i).length).toBeGreaterThan(0);
  });

  it("renders project duration selection on step 2", async () => {
    await renderAndNavigate();
    const nextButton = screen.getByRole("button", { name: /next: requirements/i });
    await userEvent.click(nextButton);
    expect(screen.getByText(/project duration/i)).toBeInTheDocument();
  });

  it("renders budget range inputs on step 3", async () => {
    await renderAndNavigate();
    const nextButton = screen.getByRole("button", { name: /next: requirements/i });
    await userEvent.click(nextButton);
    const budgetButton = screen.getByRole("button", { name: /next: budget/i });
    await userEvent.click(budgetButton);
    expect(screen.getAllByText(/minimum/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/maximum/i).length).toBeGreaterThan(0);
  });

  it("has navigation buttons", async () => {
    await renderAndNavigate();
    expect(
      screen.getByRole("button", { name: /next: requirements/i })
    ).toBeInTheDocument();
  });

  it("has cancel button", async () => {
    await renderAndNavigate();
    expect(
      screen.getAllByRole("button", { name: /cancel/i }).length
    ).toBeGreaterThan(0);
  });

  it("renders mobile menu button", async () => {
    await renderAndNavigate();
    expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
  });
});

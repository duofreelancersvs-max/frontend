import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "@/__tests__/test-utils";
import PostProject from "@/pages/client/PostProject";

// Mock lucide-react icons
vi.mock("lucide-react", async () => {
  const actual = await vi.importActual("lucide-react");
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
  };
});

// Mock window.alert
const mockAlert = vi.fn();
Object.defineProperty(window, "alert", {
  writable: true,
  configurable: true,
  value: mockAlert,
});

describe("PostProject", () => {
  beforeEach(() => {
    mockAlert.mockClear();
  });

  it("renders page header with title", () => {
    renderWithRouter(<PostProject />);
    expect(screen.getAllByText(/post a new project/i).length).toBeGreaterThan(0);
  });

  it("renders page subtitle", () => {
    renderWithRouter(<PostProject />);
    expect(
      screen.getByText(/find the perfect freelancer for your project/i)
    ).toBeInTheDocument();
  });

  it("renders sidebar navigation", () => {
    renderWithRouter(<PostProject />);
    expect(screen.getAllByText(/dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/my projects/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/post project/i).length).toBeGreaterThan(0);
  });

  it("renders user profile in sidebar", () => {
    renderWithRouter(<PostProject />);
    expect(screen.getByText(/rajesh kumar/i)).toBeInTheDocument();
  });

  it("renders project title input", () => {
    renderWithRouter(<PostProject />);
    expect(screen.getByPlaceholderText(/e.g., wedding video editing/i)).toBeInTheDocument();
  });

  it("allows entering project title", async () => {
    renderWithRouter(<PostProject />);
    const titleInput = screen.getByPlaceholderText(/e.g., wedding video editing/i);
    await userEvent.type(titleInput, "E-commerce Product Video");
    expect(titleInput).toHaveValue("E-commerce Product Video");
  });

  it("renders category selection", () => {
    renderWithRouter(<PostProject />);
    expect(screen.getAllByText(/category/i).length).toBeGreaterThan(0);
  });

  it("renders description textarea", () => {
    renderWithRouter(<PostProject />);
    expect(
      screen.getByPlaceholderText(/describe your project in detail/i)
    ).toBeInTheDocument();
  });

  it("allows entering project description", async () => {
    renderWithRouter(<PostProject />);
    const descInput = screen.getByPlaceholderText(/describe your project in detail/i);
    await userEvent.type(
      descInput,
      "Need a professional video for our e-commerce store"
    );
    expect(descInput).toHaveValue(
      "Need a professional video for our e-commerce store"
    );
  });

  it("renders skills selection section on step 2", async () => {
    renderWithRouter(<PostProject />);
    // Navigate to step 2
    const nextButton = screen.getByRole("button", { name: /next: requirements/i });
    await userEvent.click(nextButton);
    expect(screen.getByText(/skills required/i)).toBeInTheDocument();
  });

  it("renders budget range inputs on step 3", async () => {
    renderWithRouter(<PostProject />);
    // Navigate to step 3
    const nextButton = screen.getByRole("button", { name: /next: requirements/i });
    await userEvent.click(nextButton);
    const budgetButton = screen.getByRole("button", { name: /next: budget/i });
    await userEvent.click(budgetButton);
    expect(screen.getAllByText(/minimum/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/maximum/i).length).toBeGreaterThan(0);
  });

  it("renders experience level selection on step 2", async () => {
    renderWithRouter(<PostProject />);
    // Navigate to step 2
    const nextButton = screen.getByRole("button", { name: /next: requirements/i });
    await userEvent.click(nextButton);
    expect(screen.getAllByText(/experience level/i).length).toBeGreaterThan(0);
  });

  it("renders duration selection on step 2", async () => {
    renderWithRouter(<PostProject />);
    // Navigate to step 2
    const nextButton = screen.getByRole("button", { name: /next: requirements/i });
    await userEvent.click(nextButton);
    expect(screen.getByText(/project duration/i)).toBeInTheDocument();
  });

  it("renders location preference selection on step 2", async () => {
    renderWithRouter(<PostProject />);
    // Navigate to step 2
    const nextButton = screen.getByRole("button", { name: /next: requirements/i });
    await userEvent.click(nextButton);
    expect(screen.getByText(/location preference/i)).toBeInTheDocument();
  });

  it("renders attachments section", () => {
    renderWithRouter(<PostProject />);
    expect(screen.getByText(/attachments/i)).toBeInTheDocument();
  });

  it("has navigation buttons", () => {
    renderWithRouter(<PostProject />);
    expect(
      screen.getByRole("button", { name: /next: requirements/i })
    ).toBeInTheDocument();
  });

  it("has cancel button", () => {
    renderWithRouter(<PostProject />);
    expect(
      screen.getAllByRole("button", { name: /cancel/i }).length
    ).toBeGreaterThan(0);
  });

  it("renders mobile menu button", () => {
    renderWithRouter(<PostProject />);
    const menuButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.querySelector("[data-testid='menu-icon']"));
    expect(menuButtons.length).toBeGreaterThan(0);
  });
});

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "@/__tests__/test-utils";
import ClientProjects from "@/pages/client/Projects";

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
  };
});

describe("ClientProjects", () => {
  it("renders page header with title", () => {
    renderWithRouter(<ClientProjects />);
    expect(screen.getAllByText(/my projects/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/manage and track all your projects/i)
    ).toBeInTheDocument();
  });

  it("renders sidebar navigation", () => {
    renderWithRouter(<ClientProjects />);
    expect(screen.getAllByText(/dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/my projects/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/post project/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/find freelancers/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/messages/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/payments/i).length).toBeGreaterThan(0);
  });

  it("renders user profile in sidebar", () => {
    renderWithRouter(<ClientProjects />);
    expect(screen.getByText(/rajesh kumar/i)).toBeInTheDocument();
    expect(screen.getByText(/client account/i)).toBeInTheDocument();
  });

  it("renders post new project button", () => {
    renderWithRouter(<ClientProjects />);
    expect(
      screen.getAllByRole("link", { name: /post new project/i }).length
    ).toBeGreaterThan(0);
  });

  it("renders project tabs", () => {
    renderWithRouter(<ClientProjects />);
    // Tab buttons contain both label and count, so check for partial matches
    const allTabs = screen.getAllByRole("button");
    expect(allTabs.some(btn => btn.textContent?.toLowerCase().includes("all"))).toBe(true);
    expect(allTabs.some(btn => btn.textContent?.toLowerCase().includes("open"))).toBe(true);
    expect(allTabs.some(btn => btn.textContent?.toLowerCase().includes("in progress"))).toBe(true);
    expect(allTabs.some(btn => btn.textContent?.toLowerCase().includes("completed"))).toBe(true);
    expect(allTabs.some(btn => btn.textContent?.toLowerCase().includes("drafts"))).toBe(true);
    expect(allTabs.some(btn => btn.textContent?.toLowerCase().includes("cancelled"))).toBe(true);
  });

  it("renders search input", () => {
    renderWithRouter(<ClientProjects />);
    expect(
      screen.getByPlaceholderText(/search projects/i)
    ).toBeInTheDocument();
  });

  it("allows searching projects", async () => {
    renderWithRouter(<ClientProjects />);
    const searchInput = screen.getByPlaceholderText(/search projects/i);
    await userEvent.type(searchInput, "e-commerce");
    expect(searchInput).toHaveValue("e-commerce");
  });

  it("renders sort dropdown", () => {
    renderWithRouter(<ClientProjects />);
    expect(screen.getByText(/recent/i)).toBeInTheDocument();
  });

  it("renders view mode toggle", () => {
    renderWithRouter(<ClientProjects />);
    const gridButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("[data-testid='grid-icon']")
    );
    const listButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("[data-testid='list-icon']")
    );
    expect(gridButtons.length || listButtons.length).toBeGreaterThan(0);
  });

  it("renders project cards in grid view", () => {
    renderWithRouter(<ClientProjects />);
    expect(screen.getByText(/e-commerce product video/i)).toBeInTheDocument();
    expect(
      screen.getByText(/corporate explainer animation/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/youtube channel intro/i)).toBeInTheDocument();
  });

  it("displays project categories", () => {
    renderWithRouter(<ClientProjects />);
    expect(screen.getAllByText(/video editing/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/motion graphics/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3d design/i).length).toBeGreaterThan(0);
  });

  it("displays project status badges", () => {
    renderWithRouter(<ClientProjects />);
    expect(screen.getAllByText(/in progress/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/open/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/completed/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/draft/i).length).toBeGreaterThan(0);
  });

  it("displays project budgets", () => {
    renderWithRouter(<ClientProjects />);
    expect(screen.getAllByText(/₹15,000/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/₹25,000/i).length).toBeGreaterThan(0);
    // Budget values displayed are max budget values from the data
    expect(screen.getAllByText(/₹45,000|₹60,000/i).length).toBeGreaterThan(0);
  });

  it("displays project applications count", () => {
    renderWithRouter(<ClientProjects />);
    expect(screen.getAllByText(/12/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/8/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/24/i).length).toBeGreaterThan(0);
  });

  it("displays project deadlines", () => {
    renderWithRouter(<ClientProjects />);
    expect(screen.getByText(/5 days/i)).toBeInTheDocument();
    expect(screen.getByText(/2 days/i)).toBeInTheDocument();
    expect(screen.getByText(/7 days/i)).toBeInTheDocument();
  });

  it("displays project skills", () => {
    renderWithRouter(<ClientProjects />);
    expect(screen.getAllByText(/adobe premiere pro/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/after effects/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/cinema 4d/i).length).toBeGreaterThan(0);
  });

  it("renders view details buttons", () => {
    renderWithRouter(<ClientProjects />);
    const viewButtons = screen.getAllByRole("button", { name: /view details/i });
    expect(viewButtons.length).toBeGreaterThan(0);
  });

  it("renders applications buttons for open projects", () => {
    renderWithRouter(<ClientProjects />);
    const applicationsButtons = screen.getAllByRole("button", { name: /applications/i });
    expect(applicationsButtons.length).toBeGreaterThan(0);
  });

  it("displays assigned freelancers for active projects", () => {
    renderWithRouter(<ClientProjects />);
    expect(screen.getAllByText(/arun kumar/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/priya sharma/i).length).toBeGreaterThan(0);
  });

  it("shows not assigned for open projects", () => {
    renderWithRouter(<ClientProjects />);
    expect(screen.getAllByText(/not assigned/i).length).toBeGreaterThan(0);
  });

  it("allows switching between tabs", async () => {
    renderWithRouter(<ClientProjects />);
    const allButtons = screen.getAllByRole("button");
    const openTab = allButtons.find(btn => btn.textContent?.toLowerCase().includes("open"));
    expect(openTab).toBeDefined();
    if (openTab) {
      await userEvent.click(openTab);
      expect(openTab).toHaveClass("border-teal");
    }
  });

  it("renders pagination when there are many projects", () => {
    renderWithRouter(<ClientProjects />);
    const paginationButtons = screen.getAllByRole("button").filter(
      (btn) => btn.textContent?.match(/^\d+$/) || btn.textContent?.includes("Previous") || btn.textContent?.includes("Next")
    );
    expect(paginationButtons.length).toBeGreaterThan(0);
  });

  it("displays results count", () => {
    renderWithRouter(<ClientProjects />);
    expect(screen.getAllByText(/showing/i).length).toBeGreaterThan(0);
    // "of" is part of the text "1 to 6 of 8 projects" so use a more flexible matcher
    const resultsText = screen.getAllByText(/showing/i)[0];
    expect(resultsText.textContent?.toLowerCase()).toMatch(/of/);
    expect(screen.getAllByText(/projects/i).length).toBeGreaterThan(0);
  });

  it("renders action menu buttons on project cards", () => {
    renderWithRouter(<ClientProjects />);
    const menuButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("[data-testid='more-vertical-icon']")
    );
    expect(menuButtons.length).toBeGreaterThan(0);
  });

  it("renders header with notification bell", () => {
    renderWithRouter(<ClientProjects />);
    const bellButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("[data-testid='bell-icon']")
    );
    expect(bellButtons.length).toBeGreaterThan(0);
  });

  it("renders mobile menu button", () => {
    renderWithRouter(<ClientProjects />);
    const menuButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("[data-testid='menu-icon']")
    );
    expect(menuButtons.length).toBeGreaterThan(0);
  });
});

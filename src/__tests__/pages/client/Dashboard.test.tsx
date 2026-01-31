import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import ClientDashboard from "@/pages/client/Dashboard";

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
  it("renders dashboard header with welcome message", () => {
    renderWithRouter(<ClientDashboard />);
    expect(screen.getAllByText(/dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/welcome back, rajesh/i).length).toBeGreaterThan(0);
  });

  it("renders sidebar navigation", () => {
    renderWithRouter(<ClientDashboard />);
    expect(screen.getAllByText(/dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/my projects/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/post project/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/find freelancers/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/messages/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/payments/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/reviews/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/settings/i).length).toBeGreaterThan(0);
  });

  it("renders user profile in sidebar", () => {
    renderWithRouter(<ClientDashboard />);
    expect(screen.getByText(/rajesh kumar/i)).toBeInTheDocument();
    expect(screen.getByText(/client account/i)).toBeInTheDocument();
  });

  it("renders welcome banner with greeting", () => {
    renderWithRouter(<ClientDashboard />);
    expect(screen.getAllByText(/welcome back, rajesh/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2 active projects/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3 new applications/i).length).toBeGreaterThan(0);
  });

  it("renders post new project button", () => {
    renderWithRouter(<ClientDashboard />);
    expect(
      screen.getAllByRole("link", { name: /post new project/i }).length
    ).toBeGreaterThan(0);
  });

  it("renders find freelancers button", () => {
    renderWithRouter(<ClientDashboard />);
    expect(
      screen.getAllByRole("link", { name: /find freelancers/i }).length
    ).toBeGreaterThan(0);
  });

  it("renders stats cards", () => {
    renderWithRouter(<ClientDashboard />);
    expect(screen.getAllByText(/active projects/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/completed projects/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/total spent/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/pending reviews/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^15$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/₹45,000/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^3$/i).length).toBeGreaterThan(0);
  });

  it("renders active projects section", () => {
    renderWithRouter(<ClientDashboard />);
    expect(screen.getAllByText(/active projects/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/e-commerce product video/i)).toBeInTheDocument();
    expect(
      screen.getByText(/corporate explainer animation/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/social media ad creatives/i)).toBeInTheDocument();
  });

  it("displays project status badges", () => {
    renderWithRouter(<ClientDashboard />);
    expect(screen.getAllByText(/in progress/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/in review/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/just started/i).length).toBeGreaterThan(0);
  });

  it("renders recent applications section", () => {
    renderWithRouter(<ClientDashboard />);
    expect(screen.getByText(/recent applications/i)).toBeInTheDocument();
    expect(screen.getByText(/meera reddy/i)).toBeInTheDocument();
    expect(screen.getByText(/karthik s\./i)).toBeInTheDocument();
    expect(screen.getByText(/lakshmi p\./i)).toBeInTheDocument();
  });

  it("displays application status badges", () => {
    renderWithRouter(<ClientDashboard />);
    expect(screen.getAllByText(/pending/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/shortlisted/i).length).toBeGreaterThan(0);
  });

  it("renders recommended freelancers section", () => {
    renderWithRouter(<ClientDashboard />);
    expect(screen.getByText(/recommended for you/i)).toBeInTheDocument();
    expect(screen.getByText(/rahul verma/i)).toBeInTheDocument();
    expect(screen.getByText(/ananya singh/i)).toBeInTheDocument();
    expect(screen.getByText(/dev patel/i)).toBeInTheDocument();
  });

  it("displays freelancer rates and ratings", () => {
    renderWithRouter(<ClientDashboard />);
    expect(screen.getByText(/₹1,800\/hr/i)).toBeInTheDocument();
    expect(screen.getByText(/₹1,400\/hr/i)).toBeInTheDocument();
    expect(screen.getByText(/₹900\/hr/i)).toBeInTheDocument();
    expect(screen.getAllByText(/4\.9/i).length).toBeGreaterThan(0);
  });

  it("renders recent messages section", () => {
    renderWithRouter(<ClientDashboard />);
    expect(screen.getAllByText(/recent messages/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/arun kumar/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/priya sharma/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/vikram r\./i).length).toBeGreaterThan(0);
  });

  it("displays notification badges", () => {
    renderWithRouter(<ClientDashboard />);
    expect(screen.getAllByText(/^3$/i).length).toBeGreaterThan(0);
  });

  it("renders quick actions section", () => {
    renderWithRouter(<ClientDashboard />);
    expect(screen.getAllByText(/quick actions/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/post new project/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/browse freelancers/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/get support/i).length).toBeGreaterThan(0);
  });

  it("renders recent activity feed", () => {
    renderWithRouter(<ClientDashboard />);
    expect(screen.getByText(/recent activity/i)).toBeInTheDocument();
    expect(
      screen.getByText(/arun kumar submitted first draft/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/you approved milestone payment/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/new application received/i)
    ).toBeInTheDocument();
  });

  it("renders header with notification bell", () => {
    renderWithRouter(<ClientDashboard />);
    const bellButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("[data-testid='bell-icon']")
    );
    expect(bellButtons.length).toBeGreaterThan(0);
  });

  it("renders view all links", () => {
    renderWithRouter(<ClientDashboard />);
    expect(screen.getAllByText(/view all/i).length).toBeGreaterThan(0);
  });

  it("renders mobile menu button", () => {
    renderWithRouter(<ClientDashboard />);
    const menuButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("[data-testid='menu-icon']")
    );
    expect(menuButtons.length).toBeGreaterThan(0);
  });

  it("has link to projects page", () => {
    renderWithRouter(<ClientDashboard />);
    expect(
      screen.getAllByRole("link", { name: /view all/i }).length
    ).toBeGreaterThan(0);
  });
});

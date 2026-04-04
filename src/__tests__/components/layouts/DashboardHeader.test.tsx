import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import DashboardHeader from "@/components/layouts/DashboardHeader";
import { useAuthStore } from "@/stores/auth.store";

describe("DashboardHeader", () => {
  const defaultProps = {
    title: "Dashboard",
    breadcrumbItems: [
      { label: "Home", href: "/" },
      { label: "Dashboard" },
    ],
    onMenuClick: vi.fn(),
  };

  beforeEach(() => {
    useAuthStore.setState({
      user: { 
        _id: "1", 
        fullName: "Alex Johnson", 
        role: "client", 
        email: "alex@example.com",
        phone: "9876543210",
        status: "active",
        isEmailVerified: true,
        isPhoneVerified: true
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it("renders title", () => {
    renderWithRouter(<DashboardHeader {...defaultProps} />);
    const dashboardElements = screen.getAllByText("Dashboard");
    expect(dashboardElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders breadcrumb items", () => {
    renderWithRouter(<DashboardHeader {...defaultProps} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("renders action buttons", () => {
    renderWithRouter(<DashboardHeader {...defaultProps} />);
    // Search, Notifications, Messages buttons
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it("renders mobile menu button", () => {
    renderWithRouter(<DashboardHeader {...defaultProps} />);
    const menuButton = screen.getAllByRole("button")[0];
    expect(menuButton).toBeInTheDocument();
  });

  it("displays user profile information", () => {
    renderWithRouter(<DashboardHeader {...defaultProps} />);
    expect(screen.getByText(/Alex Johnson/i)).toBeInTheDocument();
    expect(screen.getByText(/client/i)).toBeInTheDocument();
  });

  it("displays user avatar", () => {
    renderWithRouter(<DashboardHeader {...defaultProps} />);
    const avatar = screen.getByAltText("Profile");
    expect(avatar).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithRouter(
      <DashboardHeader {...defaultProps} className="custom-header" />
    );
    const header = container.querySelector("header");
    expect(header).toHaveClass("custom-header");
  });
});

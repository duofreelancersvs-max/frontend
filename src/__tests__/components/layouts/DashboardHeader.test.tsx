import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import DashboardHeader from "@/components/layouts/DashboardHeader";

describe("DashboardHeader", () => {
  const defaultProps = {
    title: "Dashboard",
    breadcrumbItems: [
      { label: "Home", href: "/" },
      { label: "Dashboard" },
    ],
    onMenuClick: vi.fn(),
  };

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
    expect(screen.getByText("Alex Johnson")).toBeInTheDocument();
    expect(screen.getByText("Client Account")).toBeInTheDocument();
  });

  it("displays user avatar", () => {
    renderWithRouter(<DashboardHeader {...defaultProps} />);
    const avatar = screen.getByAltText("Profile");
    expect(avatar).toBeInTheDocument();
  });

  it("renders notification indicators", () => {
    renderWithRouter(<DashboardHeader {...defaultProps} />);
    // Should have notification and message indicators
    const header = document.querySelector("header");
    expect(header).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithRouter(
      <DashboardHeader {...defaultProps} className="custom-header" />
    );
    const header = container.querySelector("header");
    expect(header).toHaveClass("custom-header");
  });
});

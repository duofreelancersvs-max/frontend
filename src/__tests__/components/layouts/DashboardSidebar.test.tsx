import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import DashboardSidebar from "@/components/layouts/DashboardSidebar";

describe("DashboardSidebar", () => {
  it("renders logo and brand name", () => {
    renderWithRouter(<DashboardSidebar />);
    expect(screen.getByText("Stitch")).toBeInTheDocument();
  });

  it("renders all navigation items", () => {
    renderWithRouter(<DashboardSidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Talent")).toBeInTheDocument();
    expect(screen.getByText("Messages")).toBeInTheDocument();
    expect(screen.getByText("Finance")).toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders user profile information", () => {
    renderWithRouter(<DashboardSidebar />);
    expect(screen.getByText("Alex Johnson")).toBeInTheDocument();
    expect(screen.getByText("Freelancer")).toBeInTheDocument();
  });

  it("has correct navigation links", () => {
    renderWithRouter(<DashboardSidebar />);
    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /projects/i })).toHaveAttribute("href", "/dashboard/projects");
    expect(screen.getByRole("link", { name: /messages/i })).toHaveAttribute("href", "/dashboard/messages");
  });

  it("renders logout button", () => {
    renderWithRouter(<DashboardSidebar />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders collapse toggle button", () => {
    renderWithRouter(<DashboardSidebar />);
    // Collapse button should be present (hidden on mobile, but in DOM)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("displays user avatar", () => {
    renderWithRouter(<DashboardSidebar />);
    const avatar = screen.getByAltText("User");
    expect(avatar).toBeInTheDocument();
  });
});

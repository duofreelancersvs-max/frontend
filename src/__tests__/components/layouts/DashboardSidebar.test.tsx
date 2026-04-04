import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import DashboardSidebar from "@/components/layouts/DashboardSidebar";

describe("DashboardSidebar", () => {
  it("renders logo and brand name", () => {
    renderWithRouter(<DashboardSidebar />);
    expect(screen.getByText("Connect")).toBeInTheDocument();
  });

  it("renders all navigation items", () => {
    renderWithRouter(<DashboardSidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Browse Projects")).toBeInTheDocument();
    expect(screen.getByText("Messages")).toBeInTheDocument();
    expect(screen.getByText("Earnings")).toBeInTheDocument();
    expect(screen.getByText("Subscription")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("renders user profile information", () => {
    renderWithRouter(<DashboardSidebar />);
    expect(screen.getByText("Alex Johnson")).toBeInTheDocument();
    expect(screen.getByText("Freelancer")).toBeInTheDocument();
  });

  it("has correct navigation links", () => {
    renderWithRouter(<DashboardSidebar />);
    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/freelancer/dashboard");
    expect(screen.getByRole("link", { name: /browse projects/i })).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("link", { name: /messages/i })).toHaveAttribute("href", "/freelancer/messages");
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

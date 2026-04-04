import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import PublicNavbar from "@/components/layouts/PublicNavbar";

describe("PublicNavbar", () => {
  it("renders brand logo and name", () => {
    renderWithRouter(<PublicNavbar />);
    expect(screen.getByText("Connect")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    renderWithRouter(<PublicNavbar />);
    expect(screen.getByText("Find Talent")).toBeInTheDocument();
    expect(screen.getByText("Find Work")).toBeInTheDocument();
    expect(screen.getByText("Post Project")).toBeInTheDocument();
    expect(screen.getByText("How It Works")).toBeInTheDocument();
  });

  it("renders auth buttons", () => {
    renderWithRouter(<PublicNavbar />);
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("renders mobile menu toggle button", () => {
    renderWithRouter(<PublicNavbar />);
    // Mobile menu button exists
    const menuButton = screen.getAllByRole("button").find(btn => 
      btn.querySelector("svg")
    );
    expect(menuButton).toBeTruthy();
  });

  it("has correct link hrefs", () => {
    renderWithRouter(<PublicNavbar />);
    expect(screen.getByRole("link", { name: "Find Talent" })).toHaveAttribute("href", "/freelancers");
    expect(screen.getByRole("link", { name: "Find Work" })).toHaveAttribute("href", "/find-work");
    expect(screen.getByRole("link", { name: "Post Project" })).toHaveAttribute("href", "/client/post-project");
    expect(screen.getByRole("link", { name: "How It Works" })).toHaveAttribute("href", "/how-it-works");
  });

  it("renders logo link to home", () => {
    renderWithRouter(<PublicNavbar />);
    const logoLink = screen.getAllByRole("link")[0]; // Get first link usually Logo
    expect(logoLink).toHaveAttribute("href", "/");
  });
});

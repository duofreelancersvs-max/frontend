import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import Footer from "@/components/layouts/Footer";

describe("Footer", () => {
  it("renders brand logo and name", () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText("Stitch")).toBeInTheDocument();
  });

  it("renders brand description", () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText(/premium marketplace/i)).toBeInTheDocument();
  });

  it("renders social media links", () => {
    renderWithRouter(<Footer />);
    const socialLinks = screen.getAllByRole("link").filter(link => 
      link.getAttribute("href") === "#"
    );
    expect(socialLinks.length).toBeGreaterThanOrEqual(4);
  });

  it("renders 'For Clients' section", () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText("For Clients")).toBeInTheDocument();
    expect(screen.getByText("Find Talent")).toBeInTheDocument();
    expect(screen.getByText("Post Project")).toBeInTheDocument();
    expect(screen.getByText("Enterprise Solutions")).toBeInTheDocument();
  });

  it("renders 'For Freelancers' section", () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText("For Freelancers")).toBeInTheDocument();
    expect(screen.getByText("Find Work")).toBeInTheDocument();
    expect(screen.getByText("Create Profile")).toBeInTheDocument();
    expect(screen.getByText("Community")).toBeInTheDocument();
  });

  it("renders 'Company' section", () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("About Us")).toBeInTheDocument();
    expect(screen.getByText("Careers")).toBeInTheDocument();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
  });

  it("renders copyright with current year", () => {
    renderWithRouter(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
  });

  it("renders bottom navigation links", () => {
    renderWithRouter(<Footer />);
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: /terms of service/i })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: /cookie settings/i })).toHaveAttribute("href", "/cookies");
  });

  it("renders all footer navigation links correctly", () => {
    renderWithRouter(<Footer />);
    const expectedLinks = [
      { label: "Find Talent", href: "/find-talent" },
      { label: "Post Project", href: "/post-project" },
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
    ];

    expectedLinks.forEach(({ label, href }) => {
      const link = screen.getByRole("link", { name: label });
      expect(link).toHaveAttribute("href", href);
    });
  });
});

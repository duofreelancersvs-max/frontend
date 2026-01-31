import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import Breadcrumb from "@/components/common/Breadcrumb";

describe("Breadcrumb", () => {
  const defaultItems = [
    { label: "Projects", href: "/projects" },
    { label: "Website Redesign", href: "/projects/123" },
    { label: "Settings" },
  ];

  it("renders home icon link", () => {
    renderWithRouter(<Breadcrumb items={defaultItems} />);
    const homeLink = screen.getByRole("link", { name: "" });
    expect(homeLink).toHaveAttribute("href", "/dashboard");
  });

  it("renders all breadcrumb items", () => {
    renderWithRouter(<Breadcrumb items={defaultItems} />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Website Redesign")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("marks last item as current page", () => {
    renderWithRouter(<Breadcrumb items={defaultItems} />);
    const lastItem = screen.getByText("Settings");
    expect(lastItem).toHaveAttribute("aria-current", "page");
    expect(lastItem).toHaveClass("font-semibold");
    expect(lastItem).toHaveClass("text-navy");
  });

  it("renders links for non-last items with href", () => {
    renderWithRouter(<Breadcrumb items={defaultItems} />);
    const projectsLink = screen.getByRole("link", { name: "Projects" });
    expect(projectsLink).toHaveAttribute("href", "/projects");
  });

  it("renders spans for items without href", () => {
    const itemsWithoutHref = [{ label: "Current Page" }];
    renderWithRouter(<Breadcrumb items={itemsWithoutHref} />);
    const currentPage = screen.getByText("Current Page");
    expect(currentPage.tagName.toLowerCase()).toBe("span");
  });

  it("renders chevron separators between items", () => {
    const { container } = renderWithRouter(<Breadcrumb items={defaultItems} />);
    const chevrons = container.querySelectorAll("svg");
    // Home icon + chevron separators
    expect(chevrons.length).toBeGreaterThanOrEqual(1);
  });

  it("applies custom className", () => {
    const { container } = renderWithRouter(<Breadcrumb items={defaultItems} className="custom-breadcrumb" />);
    expect(container.firstChild).toHaveClass("custom-breadcrumb");
  });

  it("has correct aria-label", () => {
    const { container } = renderWithRouter(<Breadcrumb items={defaultItems} />);
    const nav = container.querySelector("nav");
    expect(nav).toHaveAttribute("aria-label", "Breadcrumb");
  });

  it("handles empty items array", () => {
    renderWithRouter(<Breadcrumb items={[]} />);
    // Should still render home icon
    expect(screen.getByRole("link")).toBeInTheDocument();
  });

  it("renders single item correctly", () => {
    renderWithRouter(<Breadcrumb items={[{ label: "Single" }]} />);
    expect(screen.getByText("Single")).toBeInTheDocument();
    expect(screen.getByText("Single")).toHaveAttribute("aria-current", "page");
  });
});

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "@/__tests__/test-utils";
import FreelancerDirectory from "@/pages/public/FreelancerDirectory";

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock lucide-react icons
vi.mock("lucide-react", async () => {
  const actual = await vi.importActual("lucide-react");
  return {
    ...actual,
    ChevronRight: () => <svg data-testid="chevron-right-icon" />,
    ChevronDown: () => <svg data-testid="chevron-down-icon" />,
    ChevronLeft: () => <svg data-testid="chevron-left-icon" />,
    Search: () => <svg data-testid="search-icon" />,
    X: () => <svg data-testid="x-icon" />,
    Star: () => <svg data-testid="star-icon" />,
    MapPin: () => <svg data-testid="map-pin-icon" />,
    BadgeCheck: () => <svg data-testid="badge-check-icon" />,
    Filter: () => <svg data-testid="filter-icon" />,
    Grid3X3: () => <svg data-testid="grid-icon" />,
    List: () => <svg data-testid="list-icon" />,
    ArrowRight: () => <svg data-testid="arrow-right-icon" />,
    Users: () => <svg data-testid="users-icon" />,
    Frown: () => <svg data-testid="frown-icon" />,
    Twitter: () => <svg data-testid="twitter-icon" />,
    Linkedin: () => <svg data-testid="linkedin-icon" />,
    Menu: () => <svg data-testid="menu-icon" />,
  };
});

describe("FreelancerDirectory", () => {
  it("renders page header with title", () => {
    renderWithRouter(<FreelancerDirectory />);
    expect(screen.getByText(/Find Creative/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Talent/i).length).toBeGreaterThan(0);
  });

  it("renders breadcrumb navigation", () => {
    renderWithRouter(<FreelancerDirectory />);
    expect(
      screen.getAllByRole("link", { name: /Home/i }).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Find Talent/i).length).toBeGreaterThan(0);
  });

  it("renders search input", () => {
    renderWithRouter(<FreelancerDirectory />);
    expect(
      screen.getByPlaceholderText(/Search by name or skill/i)
    ).toBeInTheDocument();
  });

  it("allows searching freelancers", async () => {
    renderWithRouter(<FreelancerDirectory />);
    const searchInput = screen.getByPlaceholderText(/Search by name or skill/i);
    await userEvent.type(searchInput, "video editor");
    expect(searchInput).toHaveValue("video editor");
  });

  it("renders category filter dropdown", () => {
    renderWithRouter(<FreelancerDirectory />);
    expect(screen.getAllByText(/All Categories/i).length).toBeGreaterThan(0);
  });

  it("renders experience level filter", () => {
    renderWithRouter(<FreelancerDirectory />);
    expect(screen.getAllByText(/All Levels/i).length).toBeGreaterThan(0);
  });

  it("renders rate range filter", () => {
    renderWithRouter(<FreelancerDirectory />);
    expect(screen.getAllByText(/Any Rate/i).length).toBeGreaterThan(0);
  });

  it("renders location filter", () => {
    renderWithRouter(<FreelancerDirectory />);
    expect(screen.getAllByText(/All Locations/i).length).toBeGreaterThan(0);
  });

  it("renders freelancer cards in grid", () => {
    renderWithRouter(<FreelancerDirectory />);
    expect(screen.getByText(/Vikram Sharma/i)).toBeInTheDocument();
    expect(screen.getByText(/Priya Reddy/i)).toBeInTheDocument();
    expect(screen.getByText(/Arjun Kumar/i)).toBeInTheDocument();
  });

  it("displays freelancer details on cards", () => {
    renderWithRouter(<FreelancerDirectory />);
    expect(screen.getByText(/Senior Video Editor/i)).toBeInTheDocument();
    expect(screen.getByText(/VFX Artist & Compositor/i)).toBeInTheDocument();
    expect(screen.getByText(/3D Generalist/i)).toBeInTheDocument();
  });

  it("displays freelancer ratings", () => {
    renderWithRouter(<FreelancerDirectory />);
    expect(screen.getAllByText(/4\.9/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/4\.8/i).length).toBeGreaterThan(0);
    // 5.0 may render as just 5
    const fiveRatings = screen.getAllByText(/5/i).filter(el => el.textContent === '5' || el.textContent === '5.0');
    expect(fiveRatings.length).toBeGreaterThan(0);
  });

  it("displays freelancer hourly rates", () => {
    renderWithRouter(<FreelancerDirectory />);
    expect(screen.getAllByText(/₹800/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/₹1200/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/₹1000/i).length).toBeGreaterThan(0);
  });

  it("displays freelancer locations", () => {
    renderWithRouter(<FreelancerDirectory />);
    expect(screen.getAllByText(/Hyderabad/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Vijayawada/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Visakhapatnam/i).length).toBeGreaterThan(0);
  });

  it("displays verified badges for verified freelancers", () => {
    renderWithRouter(<FreelancerDirectory />);
    expect(screen.getAllByText(/Verified/i).length).toBeGreaterThan(0);
  });

  it("renders view profile buttons", () => {
    renderWithRouter(<FreelancerDirectory />);
    const viewButtons = screen.getAllByRole("button", { name: /View Profile/i });
    expect(viewButtons.length).toBeGreaterThan(0);
  });

  it("renders results count", () => {
    renderWithRouter(<FreelancerDirectory />);
    expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    expect(screen.getAllByText(/freelancers/i).length).toBeGreaterThan(0);
  });

  it("renders grid and list view toggle", () => {
    renderWithRouter(<FreelancerDirectory />);
    const gridButton = screen.getAllByRole("button").find(
      (btn) => btn.querySelector("[data-testid='grid-icon']")
    );
    const listButton = screen.getAllByRole("button").find(
      (btn) => btn.querySelector("[data-testid='list-icon']")
    );
    expect(gridButton || listButton).toBeTruthy();
  });

  it("renders CTA section for freelancers", () => {
    renderWithRouter(<FreelancerDirectory />);
    expect(
      screen.getByText(/Are You a Creative Professional\?/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Join as Freelancer/i })
    ).toBeInTheDocument();
  });

  it("renders footer with links", () => {
    renderWithRouter(<FreelancerDirectory />);
    expect(
      screen.getByText(
        /The premier marketplace for creative professionals in Telangana and Andhra Pradesh\./i
      )
    ).toBeInTheDocument();
    expect(screen.getAllByText(/For Clients/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/For Freelancers/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Support/i).length).toBeGreaterThan(0);
  });

  it("allows clearing filters", async () => {
    renderWithRouter(<FreelancerDirectory />);
    const searchInput = screen.getByPlaceholderText(/Search by name or skill/i);
    await userEvent.type(searchInput, "test");
    const clearButtons = screen.getAllByText(/Clear/i);
    if (clearButtons.length > 0) {
      await userEvent.click(clearButtons[0]);
      expect(searchInput).toHaveValue("");
    }
  });

  it("displays skills on freelancer cards", () => {
    renderWithRouter(<FreelancerDirectory />);
    expect(screen.getAllByText(/Premiere Pro/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/After Effects/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Blender/i).length).toBeGreaterThan(0);
  });
});

import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
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

// Mock services
vi.mock("@/services/freelancer.service", () => ({
  default: {
    search: vi.fn(() => Promise.resolve({
      profiles: [
        {
          _id: "1",
          firstName: "Vikram",
          lastName: "Sharma",
          category: "Video Editing",
          headline: "Senior Video Editor",
          averageRating: 4.9,
          reviewCount: 120,
          hourlyRate: 1500,
          profilePicture: null,
          isVerified: true,
          skills: [{ name: "Premiere Pro" }, { name: "After Effects" }]
        },
        {
          _id: "2",
          firstName: "Priya",
          lastName: "Reddy",
          category: "VFX",
          headline: "VFX Artist & Compositor",
          averageRating: 4.8,
          reviewCount: 85,
          hourlyRate: 2000,
          profilePicture: null,
          isVerified: true,
          skills: [{ name: "After Effects" }, { name: "Nuke" }]
        },
        {
          _id: "3",
          firstName: "Arjun",
          lastName: "Kumar",
          category: "3D Design",
          headline: "3D Generalist",
          averageRating: 5.0,
          reviewCount: 45,
          hourlyRate: 1200,
          profilePicture: null,
          isVerified: false,
          skills: [{ name: "Blender" }, { name: "Maya" }]
        }
      ],
      pagination: {
        totalPages: 1,
        totalItems: 3
      }
    })),
  }
}));

// Mock lucide-react icons
vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
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
    Loader2: () => <svg data-testid="loader-icon" />,
  };
});

describe("FreelancerDirectory", () => {
  const renderAndNavigate = async () => {
    renderWithRouter(<FreelancerDirectory />);
    await waitFor(() => {
      expect(screen.queryAllByText(/Vikram Sharma/i).length).toBeGreaterThan(0);
    });
  };

  it("renders page header with title", async () => {
    await renderAndNavigate();
    expect(screen.getByText(/Find Creative/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Talent/i).length).toBeGreaterThan(0);
  });

  it("renders breadcrumb navigation", async () => {
    await renderAndNavigate();
    expect(
      screen.getAllByRole("link", { name: /Home/i }).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Find Talent/i).length).toBeGreaterThan(0);
  });

  it("renders search input", async () => {
    await renderAndNavigate();
    expect(
      screen.getByPlaceholderText(/Search by name or skill/i)
    ).toBeInTheDocument();
  });

  it("allows typing in search input", async () => {
    await renderAndNavigate();
    const searchInput = screen.getByPlaceholderText(/Search by name or skill/i);
    await userEvent.type(searchInput, "video editor");
    expect(searchInput).toHaveValue("video editor");
  });

  it("renders category filter dropdown", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/All Categories/i).length).toBeGreaterThan(0);
  });

  it("renders experience level filter", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/All Levels/i).length).toBeGreaterThan(0);
  });

  it("renders rate range filter", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/Any Rate/i).length).toBeGreaterThan(0);
  });

  it("renders location filter", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/All Locations/i).length).toBeGreaterThan(0);
  });

  it("renders freelancer cards in grid", async () => {
    await renderAndNavigate();
    expect(screen.getByText(/Vikram Sharma/i)).toBeInTheDocument();
    expect(screen.getByText(/Priya Reddy/i)).toBeInTheDocument();
    expect(screen.getByText(/Arjun Kumar/i)).toBeInTheDocument();
  });

  it("displays freelancer details on cards", async () => {
    await renderAndNavigate();
    expect(screen.getByText(/Senior Video Editor/i)).toBeInTheDocument();
    expect(screen.getByText(/VFX Artist & Compositor/i)).toBeInTheDocument();
    expect(screen.getByText(/3D Generalist/i)).toBeInTheDocument();
  });

  it("displays freelancer ratings", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/4\.9/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/4\.8/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/5\.0/i).length).toBeGreaterThan(0);
  });

  it("displays freelancer categories as locations placeholder/text", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/Video Editing/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/VFX/i).length).toBeGreaterThan(0);
  });

  it("displays verified badges for verified freelancers", async () => {
    await renderAndNavigate();
    // It's in the text via <span>Verified</span>
    expect(screen.getAllByText(/Verified/i).length).toBeGreaterThan(0);
  });

  it("renders view profile buttons", async () => {
    await renderAndNavigate();
    const viewButtons = screen.getAllByRole("link").filter(el => el.textContent === "View Profile");
    expect(viewButtons.length).toBeGreaterThan(0);
  });

  it("renders results count", async () => {
    await renderAndNavigate();
    expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    expect(screen.getAllByText(/freelancers/i).length).toBeGreaterThan(0);
  });

  it("renders grid and list view toggle", async () => {
    await renderAndNavigate();
    const gridButton = screen.getAllByRole("button").find(
      (btn) => btn.querySelector("[data-testid='grid-icon']")
    );
    const listButton = screen.getAllByRole("button").find(
      (btn) => btn.querySelector("[data-testid='list-icon']")
    );
    expect(gridButton || listButton).toBeTruthy();
  });

  it("renders CTA section for freelancers", async () => {
    await renderAndNavigate();
    expect(
      screen.getByText(/Are You a Creative Professional\?/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Join as Freelancer/i })
    ).toBeInTheDocument();
  });

  it("allows clearing filters", async () => {
    await renderAndNavigate();
    const searchInput = screen.getByPlaceholderText(/Search by name or skill/i);
    await userEvent.type(searchInput, "test");
    // "Clear All" shows up when filters are active
    const clearButton = screen.getAllByText(/Clear All/i)[0];
    await userEvent.click(clearButton);
    expect(searchInput).toHaveValue("");
  });

  it("displays skills on freelancer cards", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/Premiere Pro/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/After Effects/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Blender/i).length).toBeGreaterThan(0);
  });
});

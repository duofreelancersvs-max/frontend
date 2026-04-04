import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "@/__tests__/test-utils";
import Home from "@/pages/public/Home";

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
    getTopRated: vi.fn(() => Promise.resolve({
      profiles: [
        {
          _id: "1",
          firstName: "Arun",
          lastName: "Kumar",
          category: "Video Editing",
          averageRating: 4.9,
          profilePicture: null,
          isVerified: true,
          skills: ["Adobe Premiere Pro", "VFX"]
        },
        {
          _id: "2",
          firstName: "Meera",
          lastName: "Reddy",
          category: "VFX & Motion",
          averageRating: 4.8,
          profilePicture: null,
          isVerified: true,
          skills: ["After Effects", "Maya"]
        }
      ]
    })),
    search: vi.fn(() => Promise.resolve({
      profiles: []
    })),
  }
}));

// Mock lucide-react icons
vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
    Menu: () => <svg data-testid="menu-icon" />,
    X: () => <svg data-testid="x-icon" />,
    Search: () => <svg data-testid="search-icon" />,
    CheckCircle: () => <svg data-testid="check-circle-icon" />,
    Film: () => <svg data-testid="film-icon" />,
    Sparkles: () => <svg data-testid="sparkles-icon" />,
    Box: () => <svg data-testid="box-icon" />,
    Palette: () => <svg data-testid="palette-icon" />,
    Star: () => <svg data-testid="star-icon" />,
    ArrowRight: () => <svg data-testid="arrow-right-icon" />,
    Play: () => <svg data-testid="play-icon" />,
    Users: () => <svg data-testid="users-icon" />,
    Layout: () => <svg data-testid="layout-icon" />,
    ChevronDown: () => <svg data-testid="chevron-down-icon" />,
    MapPin: () => <svg data-testid="map-pin-icon" />,
    Shield: () => <svg data-testid="shield-icon" />,
    Zap: () => <svg data-testid="zap-icon" />,
    Heart: () => <svg data-testid="heart-icon" />,
    Twitter: () => <svg data-testid="twitter-icon" />,
    Linkedin: () => <svg data-testid="linkedin-icon" />,
    Instagram: () => <svg data-testid="instagram-icon" />,
    Youtube: () => <svg data-testid="youtube-icon" />,
    CreditCard: () => <svg data-testid="credit-card-icon" />,
    Briefcase: () => <svg data-testid="briefcase-icon" />,
    Award: () => <svg data-testid="award-icon" />,
    MessageSquare: () => <svg data-testid="message-square-icon" />,
    BadgeCheck: () => <svg data-testid="badge-check-icon" />,
    Loader2: () => <svg data-testid="loader-icon" />,
  };
});

describe("Home", () => {
  const renderAndNavigate = async () => {
    renderWithRouter(<Home />);
    await waitFor(() => {
      // Wait for freelancers to load
      expect(screen.queryAllByText(/Arun Kumar/i).length).toBeGreaterThan(0);
    });
  };

  it("renders hero section with main headline", async () => {
    await renderAndNavigate();
    expect(screen.getByText(/Find Your Perfect/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Creative Partner/i).length).toBeGreaterThan(0);
  });

  it("renders search bar in hero section", async () => {
    await renderAndNavigate();
    expect(
      screen.getByPlaceholderText(/Search skills/i)
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Search/i }).length).toBeGreaterThan(0);
  });

  it("renders navigation with logo", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/Connect/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Me/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/India/i).length).toBeGreaterThan(0);
  });

  it("renders navigation links", async () => {
    await renderAndNavigate();
    expect(
      screen.getAllByRole("link", { name: /find talent/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /how it works/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /pricing/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /about/i }).length
    ).toBeGreaterThan(0);
  });

  it("renders login and get started buttons", async () => {
    await renderAndNavigate();
    expect(
      screen.getAllByRole("link", { name: /log in/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /get started/i }).length
    ).toBeGreaterThan(0);
  });

  it("renders trusted by section", async () => {
    await renderAndNavigate();
    expect(
      screen.getByText(/Trusted by 50\+ companies across South India/i)
    ).toBeInTheDocument();
  });

  it("renders how it works section", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/How It Works/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Post Your Project/i)).toBeInTheDocument();
    expect(screen.getByText(/Review Proposals/i)).toBeInTheDocument();
    expect(screen.getByText(/Hire & Collaborate/i)).toBeInTheDocument();
  });

  it("renders browse by category section", async () => {
    await renderAndNavigate();
    expect(screen.getByText(/Browse by Category/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Video Editing/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/VFX & Motion/i).length).toBeGreaterThan(0);
  });

  it("renders featured freelancers section", async () => {
    await renderAndNavigate();
    expect(screen.getByText(/Featured Freelancers/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Arun Kumar/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Meera Reddy/i).length).toBeGreaterThan(0);
  });

  it("renders testimonials section", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/what clients say/i).length).toBeGreaterThan(0);
  });

  it("renders stats section", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/Happy Clients/i).length).toBeGreaterThan(0);
  });

  it("renders CTA section", async () => {
    await renderAndNavigate();
    expect(
      screen.getByText(/Ready to Find Your Creative Partner\?/i)
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /Get Started/i }).length
    ).toBeGreaterThan(0);
  });

  it("renders footer with links", async () => {
    await renderAndNavigate();
    expect(screen.getAllByText(/For Clients/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Support/i).length).toBeGreaterThan(0);
  });

  it("allows typing in search input", async () => {
    await renderAndNavigate();
    const searchInput = screen.getByPlaceholderText(/Search skills/i);
    await userEvent.type(searchInput, "video editing");
    expect(searchInput).toHaveValue("video editing");
  });

  it("has working navigation links to key pages", async () => {
    await renderAndNavigate();
    const freelancerLinks = screen.getAllByRole("link", {
      name: /View All Freelancers/i,
    });
    expect(freelancerLinks.length).toBeGreaterThan(0);
  });

  it("renders popular search tags", async () => {
    await renderAndNavigate();
    expect(screen.getByText(/Popular:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Video Editor/i).length).toBeGreaterThan(0);
  });

  it("renders trust indicators", async () => {
    await renderAndNavigate();
    expect(screen.getByText(/Verified Profiles/i)).toBeInTheDocument();
    expect(screen.getByText(/Fast Hiring/i)).toBeInTheDocument();
    expect(screen.getByText(/95% Satisfaction/i)).toBeInTheDocument();
  });
});

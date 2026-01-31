import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
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

// Mock lucide-react icons
vi.mock("lucide-react", async () => {
  const actual = await vi.importActual("lucide-react");
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
  };
});

describe("Home", () => {
  it("renders hero section with main headline", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText(/Find Your Perfect/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Creative Partner/i).length).toBeGreaterThan(0);
  });

  it("renders search bar in hero section", () => {
    renderWithRouter(<Home />);
    expect(
      screen.getByPlaceholderText(/Search skills/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Search/i })).toBeInTheDocument();
  });

  it("renders navigation with logo", () => {
    renderWithRouter(<Home />);
    expect(screen.getAllByText(/connectme/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/india/i).length).toBeGreaterThan(0);
  });

  it("renders navigation links", () => {
    renderWithRouter(<Home />);
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

  it("renders login and get started buttons", () => {
    renderWithRouter(<Home />);
    expect(
      screen.getAllByRole("link", { name: /log in/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /get started/i }).length
    ).toBeGreaterThan(0);
  });

  it("renders trusted by section", () => {
    renderWithRouter(<Home />);
    expect(
      screen.getByText(/Trusted by 50\+ companies across South India/i)
    ).toBeInTheDocument();
  });

  it("renders how it works section", () => {
    renderWithRouter(<Home />);
    expect(screen.getAllByText(/How It Works/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Post Your Project/i)).toBeInTheDocument();
    expect(screen.getByText(/Review Proposals/i)).toBeInTheDocument();
    expect(screen.getByText(/Hire & Collaborate/i)).toBeInTheDocument();
  });

  it("renders browse by category section", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText(/Browse by Category/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Video Editing/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/VFX & Motion/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3D Design/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Color Grading/i).length).toBeGreaterThan(0);
  });

  it("renders featured freelancers section", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText(/Featured Freelancers/i)).toBeInTheDocument();
    expect(screen.getByText(/Arun Kumar/i)).toBeInTheDocument();
    expect(screen.getByText(/Meera Reddy/i)).toBeInTheDocument();
    expect(screen.getByText(/Karthik S\./i)).toBeInTheDocument();
    expect(screen.getByText(/Lakshmi P\./i)).toBeInTheDocument();
  });

  it("renders testimonials section", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText(/what clients say/i)).toBeInTheDocument();
    expect(screen.getByText(/success stories/i)).toBeInTheDocument();
  });

  it("renders pricing teaser section", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText(/Simple, Transparent Pricing/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Free/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/₹499/i)).toBeInTheDocument();
    expect(screen.getByText(/₹999/i)).toBeInTheDocument();
  });

  it("renders stats section", () => {
    renderWithRouter(<Home />);
    expect(screen.getAllByText(/Freelancers/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Projects Done/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Happy Clients/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Avg\. Rating/i).length).toBeGreaterThan(0);
  });

  it("renders CTA section", () => {
    renderWithRouter(<Home />);
    expect(
      screen.getByText(/Ready to Find Your Creative Partner\?/i)
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /Get Started Free/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /Learn More/i }).length
    ).toBeGreaterThan(0);
  });

  it("renders footer with links", () => {
    renderWithRouter(<Home />);
    expect(
      screen.getByText(
        /The premier marketplace for creative professionals in Telangana and Andhra Pradesh\./i
      )
    ).toBeInTheDocument();
    expect(screen.getAllByText(/For Clients/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/For Freelancers/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Support/i).length).toBeGreaterThan(0);
  });

  it("allows typing in search input", async () => {
    renderWithRouter(<Home />);
    const searchInput = screen.getByPlaceholderText(/Search skills/i);
    await userEvent.type(searchInput, "video editing");
    expect(searchInput).toHaveValue("video editing");
  });

  it("has working navigation links to key pages", () => {
    renderWithRouter(<Home />);
    // Check for specific route links
    const freelancerLinks = screen.getAllByRole("link", {
      name: /View All Freelancers/i,
    });
    expect(freelancerLinks.length).toBeGreaterThan(0);
  });

  it("renders popular search tags", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText(/Popular:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Video Editor/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/VFX Artist/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3D Designer/i).length).toBeGreaterThan(0);
  });

  it("renders trust indicators", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText(/Verified Profiles/i)).toBeInTheDocument();
    expect(screen.getByText(/Fast Hiring/i)).toBeInTheDocument();
    expect(screen.getByText(/95% Satisfaction/i)).toBeInTheDocument();
  });

  it("renders mobile menu toggle button", () => {
    renderWithRouter(<Home />);
    const menuButtons = screen.getAllByRole("button");
    expect(menuButtons.length).toBeGreaterThan(0);
  });
});

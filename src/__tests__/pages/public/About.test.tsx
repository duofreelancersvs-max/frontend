import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "@/__tests__/test-utils";
import About from "@/pages/public/About";

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
    Target: () => <svg data-testid="target-icon" />,
    Eye: () => <svg data-testid="eye-icon" />,
    MapPin: () => <svg data-testid="map-pin-icon" />,
    BadgeCheck: () => <svg data-testid="badge-check-icon" />,
    Tag: () => <svg data-testid="tag-icon" />,
    Shield: () => <svg data-testid="shield-icon" />,
    Linkedin: () => <svg data-testid="linkedin-icon" />,
    Twitter: () => <svg data-testid="twitter-icon" />,
    Users: () => <svg data-testid="users-icon" />,
    Briefcase: () => <svg data-testid="briefcase-icon" />,
    Award: () => <svg data-testid="award-icon" />,
    Rocket: () => <svg data-testid="rocket-icon" />,
    Heart: () => <svg data-testid="heart-icon" />,
    Star: () => <svg data-testid="star-icon" />,
    ArrowRight: () => <svg data-testid="arrow-right-icon" />,
    Play: () => <svg data-testid="play-icon" />,
    Sparkles: () => <svg data-testid="sparkles-icon" />,
  };
});

describe("About", () => {
  it("renders page header with title", () => {
    renderWithRouter(<About />);
    expect(
      screen.getByText(/Building the Future of/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Creative Work/i).length).toBeGreaterThan(0);
  });

  it("renders breadcrumb navigation", () => {
    renderWithRouter(<About />);
    expect(
      screen.getAllByRole("link", { name: /Home/i }).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/About Us/i).length).toBeGreaterThan(0);
  });

  it("renders our story section", () => {
    renderWithRouter(<About />);
    expect(screen.getByText(/Our Story/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Connecting Creativity with Opportunity/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /ConnectMeIndia was born from a simple observation/i
      )
    ).toBeInTheDocument();
  });

  it("renders mission and vision section", () => {
    renderWithRouter(<About />);
    expect(screen.getAllByText(/What Drives Us/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Our Mission/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Our Vision/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(
        /To democratize access to creative opportunities/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/To become the leading creative marketplace in India/i)
    ).toBeInTheDocument();
  });

  it("renders stats bar with key metrics", () => {
    renderWithRouter(<About />);
    expect(screen.getAllByText(/500\+/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1000\+/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/50\+/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/4\.9/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Freelancers/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Projects/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Companies/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Avg Rating/i).length).toBeGreaterThan(0);
  });

  it("renders why choose us section", () => {
    renderWithRouter(<About />);
    expect(screen.getByText(/Why Choose Us/i)).toBeInTheDocument();
    expect(screen.getByText(/What Makes Us Different/i)).toBeInTheDocument();
    expect(screen.getByText(/Local Talent Focus/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified Professionals/i)).toBeInTheDocument();
    expect(screen.getByText(/Transparent Pricing/i)).toBeInTheDocument();
    expect(screen.getByText(/Secure Communication/i)).toBeInTheDocument();
  });

  it("renders team section with member details", () => {
    renderWithRouter(<About />);
    expect(screen.getByText(/Our Team/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Meet the People Behind ConnectMeIndia/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Vikram Reddy/i)).toBeInTheDocument();
    expect(screen.getByText(/Founder & CEO/i)).toBeInTheDocument();
    expect(screen.getByText(/Priya Sharma/i)).toBeInTheDocument();
    expect(screen.getByText(/Head of Operations/i)).toBeInTheDocument();
    expect(screen.getByText(/Arjun Kumar/i)).toBeInTheDocument();
    expect(screen.getByText(/CTO/i)).toBeInTheDocument();
    expect(screen.getByText(/Lakshmi Devi/i)).toBeInTheDocument();
    expect(screen.getByText(/Community Lead/i)).toBeInTheDocument();
  });

  it("renders timeline/milestones section", () => {
    renderWithRouter(<About />);
    expect(screen.getAllByText(/Our Journey/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/From Idea to Impact/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Founded/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/100 Freelancers/i)).toBeInTheDocument();
    expect(screen.getByText(/₹10L\+ Earned/i)).toBeInTheDocument();
    expect(screen.getAllByText(/500\+ Projects/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/1000 Users/i)).toBeInTheDocument();
  });

  it("renders navigation bar with links", () => {
    renderWithRouter(<About />);
    expect(
      screen.getAllByRole("link", { name: /Home/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /About/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /Pricing/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /Contact/i }).length
    ).toBeGreaterThan(0);
  });

  it("renders login and get started buttons", () => {
    renderWithRouter(<About />);
    expect(
      screen.getAllByRole("button", { name: /Log In/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: /Get Started/i }).length
    ).toBeGreaterThan(0);
  });

  it("renders CTA section", () => {
    renderWithRouter(<About />);
    expect(
      screen.getByText(/Join Our Growing Community/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Hire Talent/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Become a Freelancer/i })
    ).toBeInTheDocument();
  });

  it("renders footer with links", () => {
    renderWithRouter(<About />);
    expect(
      screen.getByText(
        /The premier marketplace for creative professionals in Telangana and Andhra Pradesh\./i
      )
    ).toBeInTheDocument();
    expect(screen.getAllByText(/For Clients/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/For Freelancers/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Support/i).length).toBeGreaterThan(0);
  });

  it("displays founded and location info", () => {
    renderWithRouter(<About />);
    expect(screen.getByText(/Founded in 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/Hyderabad, India/i)).toBeInTheDocument();
  });

  it("displays 95% client satisfaction", () => {
    renderWithRouter(<About />);
    expect(screen.getByText(/95%/i)).toBeInTheDocument();
    expect(screen.getByText(/Client Satisfaction/i)).toBeInTheDocument();
  });

  it("renders timeline items that can be hovered", async () => {
    renderWithRouter(<About />);
    const timelineItems = screen.getAllByText(/2024/i);
    expect(timelineItems.length).toBeGreaterThan(0);
  });
});

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "@/__tests__/test-utils";
import HowItWorks from "@/pages/public/HowItWorks";

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
    FileEdit: () => <svg data-testid="file-edit-icon" />,
    Users: () => <svg data-testid="users-icon" />,
    CheckCircle: () => <svg data-testid="check-circle-icon" />,
    UserPlus: () => <svg data-testid="user-plus-icon" />,
    Search: () => <svg data-testid="search-icon" />,
    Wallet: () => <svg data-testid="wallet-icon" />,
    Play: () => <svg data-testid="play-icon" />,
    Briefcase: () => <svg data-testid="briefcase-icon" />,
    Shield: () => <svg data-testid="shield-icon" />,
    Clock: () => <svg data-testid="clock-icon" />,
    MessageSquare: () => <svg data-testid="message-square-icon" />,
    Star: () => <svg data-testid="star-icon" />,
    HelpCircle: () => <svg data-testid="help-circle-icon" />,
    ArrowRight: () => <svg data-testid="arrow-right-icon" />,
    MapPin: () => <svg data-testid="map-pin-icon" />,
    Twitter: () => <svg data-testid="twitter-icon" />,
    Linkedin: () => <svg data-testid="linkedin-icon" />,
  };
});

describe("HowItWorks", () => {
  it("renders page header with title", () => {
    renderWithRouter(<HowItWorks />);
    expect(screen.getAllByText(/how it/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/works/i).length).toBeGreaterThan(0);
  });

  it("renders breadcrumb navigation", () => {
    renderWithRouter(<HowItWorks />);
    expect(
      screen.getAllByRole("link", { name: /home/i }).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/how it works/i).length).toBeGreaterThan(0);
  });

  it("renders role toggle tabs", () => {
    renderWithRouter(<HowItWorks />);
    expect(screen.getByRole("button", { name: /for clients/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /for freelancers/i })
    ).toBeInTheDocument();
  });

  it("allows switching between client and freelancer tabs", async () => {
    renderWithRouter(<HowItWorks />);
    const freelancerTab = screen.getByRole("button", { name: /for freelancers/i });
    await userEvent.click(freelancerTab);
    expect(
      screen.getAllByText(/create your profile/i).length
    ).toBeGreaterThan(0);
  });

  it("renders client steps by default", () => {
    renderWithRouter(<HowItWorks />);
    expect(screen.getAllByText(/hire top talent/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/post your project/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/review proposals/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/hire & collaborate/i).length).toBeGreaterThan(0);
  });

  it("displays step descriptions for clients", () => {
    renderWithRouter(<HowItWorks />);
    expect(
      screen.getByText(/describe your project requirements/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/receive proposals from verified freelancers/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/select your preferred freelancer/i)
    ).toBeInTheDocument();
  });

  it("renders benefits section", () => {
    renderWithRouter(<HowItWorks />);
    expect(screen.getByText(/secure payments/i)).toBeInTheDocument();
    expect(screen.getByText(/fast hiring/i)).toBeInTheDocument();
    expect(screen.getByText(/quality assured/i)).toBeInTheDocument();
    expect(screen.getByText(/easy communication/i)).toBeInTheDocument();
  });

  it("renders video tutorial section", () => {
    renderWithRouter(<HowItWorks />);
    expect(screen.getByText(/video tutorial/i)).toBeInTheDocument();
    expect(screen.getByText(/watch how it works/i)).toBeInTheDocument();
    expect(screen.getByText(/platform walkthrough/i)).toBeInTheDocument();
  });

  it("renders FAQ section", () => {
    renderWithRouter(<HowItWorks />);
    expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();
    expect(screen.getByText(/faq/i)).toBeInTheDocument();
  });

  it("allows toggling FAQ items", async () => {
    renderWithRouter(<HowItWorks />);
    const faqQuestion = screen.getByText(/how do i get started as a client/i);
    await userEvent.click(faqQuestion);
    expect(
      screen.getByText(/simply create a free account/i)
    ).toBeInTheDocument();
  });

  it("renders all FAQ questions", () => {
    renderWithRouter(<HowItWorks />);
    expect(
      screen.getByText(/is there a fee to post projects/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/how are freelancers verified/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/how do payments work/i)).toBeInTheDocument();
    expect(
      screen.getByText(/what if i'm not satisfied with the work/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/can freelancers work remotely/i)
    ).toBeInTheDocument();
  });

  it("renders CTA section", () => {
    renderWithRouter(<HowItWorks />);
    expect(screen.getByText(/ready to get started/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /hire talent/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /become a freelancer/i })
    ).toBeInTheDocument();
  });

  it("renders navigation bar with links", () => {
    renderWithRouter(<HowItWorks />);
    expect(
      screen.getAllByRole("link", { name: /home/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /about/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /pricing/i }).length
    ).toBeGreaterThan(0);
  });

  it("renders login and get started buttons", () => {
    renderWithRouter(<HowItWorks />);
    expect(
      screen.getAllByRole("button", { name: /log in/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: /get started/i }).length
    ).toBeGreaterThan(0);
  });

  it("renders footer with links", () => {
    renderWithRouter(<HowItWorks />);
    expect(
      screen.getByText(
        /the premier marketplace for creative professionals in telangana and andhra pradesh\./i
      )
    ).toBeInTheDocument();
    expect(screen.getAllByText(/for clients/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/for freelancers/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/support/i).length).toBeGreaterThan(0);
  });

  it("displays contact support link in FAQ", () => {
    renderWithRouter(<HowItWorks />);
    expect(
      screen.getAllByRole("link", { name: /contact support/i }).length
    ).toBeGreaterThan(0);
  });

  it("shows feature lists for each step", () => {
    renderWithRouter(<HowItWorks />);
    expect(screen.getByText(/detailed project description/i)).toBeInTheDocument();
    expect(screen.getByText(/budget range setting/i)).toBeInTheDocument();
    expect(screen.getByText(/view freelancer portfolios/i)).toBeInTheDocument();
    expect(screen.getByText(/secure contract creation/i)).toBeInTheDocument();
  });
});

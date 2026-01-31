import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "@/__tests__/test-utils";
import Pricing from "@/pages/public/Pricing";

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
    Check: () => <svg data-testid="check-icon" />,
    X: () => <svg data-testid="x-icon" />,
    Crown: () => <svg data-testid="crown-icon" />,
    Zap: () => <svg data-testid="zap-icon" />,
    Star: () => <svg data-testid="star-icon" />,
    Shield: () => <svg data-testid="shield-icon" />,
    CreditCard: () => <svg data-testid="credit-card-icon" />,
    Smartphone: () => <svg data-testid="smartphone-icon" />,
    Building: () => <svg data-testid="building-icon" />,
    HelpCircle: () => <svg data-testid="help-circle-icon" />,
    ArrowRight: () => <svg data-testid="arrow-right-icon" />,
    MapPin: () => <svg data-testid="map-pin-icon" />,
    Twitter: () => <svg data-testid="twitter-icon" />,
    Linkedin: () => <svg data-testid="linkedin-icon" />,
    Sparkles: () => <svg data-testid="sparkles-icon" />,
    MessageSquare: () => <svg data-testid="message-square-icon" />,
  };
});

describe("Pricing", () => {
  it("renders page header with title", () => {
    renderWithRouter(<Pricing />);
    expect(screen.getAllByText(/choose your/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/plan/i).length).toBeGreaterThan(0);
  });

  it("renders breadcrumb navigation", () => {
    renderWithRouter(<Pricing />);
    expect(
      screen.getAllByRole("link", { name: /home/i }).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/pricing/i).length).toBeGreaterThan(0);
  });

  it("renders billing toggle with monthly/yearly options", () => {
    renderWithRouter(<Pricing />);
    expect(screen.getByRole("button", { name: /monthly/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /yearly/i })).toBeInTheDocument();
    expect(screen.getByText(/-20%/i)).toBeInTheDocument();
  });

  it("allows switching between monthly and yearly billing", async () => {
    renderWithRouter(<Pricing />);
    const yearlyButton = screen.getByRole("button", { name: /yearly/i });
    await userEvent.click(yearlyButton);
    expect(yearlyButton).toHaveClass("bg-white");
  });

  it("renders all pricing plans", () => {
    renderWithRouter(<Pricing />);
    expect(screen.getAllByText(/free/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/pro/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/premium/i).length).toBeGreaterThan(0);
  });

  it("displays correct pricing for monthly plan", () => {
    renderWithRouter(<Pricing />);
    expect(screen.getAllByText(/₹0/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/₹499/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/₹999/i).length).toBeGreaterThan(0);
  });

  it("displays most popular badge on pro plan", () => {
    renderWithRouter(<Pricing />);
    expect(screen.getAllByText(/most popular/i).length).toBeGreaterThan(0);
  });

  it("displays best value badge on premium plan", () => {
    renderWithRouter(<Pricing />);
    expect(screen.getAllByText(/best value/i).length).toBeGreaterThan(0);
  });

  it("renders plan features for free plan", () => {
    renderWithRouter(<Pricing />);
    expect(screen.getAllByText(/create profile/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/add up to 3 portfolio items/i).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/apply to 5 projects/i).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/basic support/i).length).toBeGreaterThan(0);
  });

  it("renders plan features for pro plan", () => {
    renderWithRouter(<Pricing />);
    expect(
      screen.getAllByText(/everything in free/i).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/unlimited portfolio items/i).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/unlimited applications/i).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/priority support/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/analytics dashboard/i).length).toBeGreaterThan(0);
  });

  it("renders plan features for premium plan", () => {
    renderWithRouter(<Pricing />);
    expect(
      screen.getAllByText(/everything in pro/i).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/verified badge/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/top search ranking/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/custom portfolio url/i).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/dedicated account manager/i).length
    ).toBeGreaterThan(0);
  });

  it("renders comparison table", () => {
    renderWithRouter(<Pricing />);
    expect(screen.getAllByText(/compare plans/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/features/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/portfolio items/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/monthly applications/i).length).toBeGreaterThan(0);
  });

  it("renders secure payments section", () => {
    renderWithRouter(<Pricing />);
    expect(
      screen.getAllByText(/secure payments powered by/i).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/razorpay/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/cards/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/upi/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/net banking/i).length).toBeGreaterThan(0);
  });

  it("renders testimonials section", () => {
    renderWithRouter(<Pricing />);
    expect(screen.getByText(/loved by freelancers/i)).toBeInTheDocument();
    expect(screen.getByText(/success stories/i)).toBeInTheDocument();
  });

  it("renders FAQ section", () => {
    renderWithRouter(<Pricing />);
    expect(screen.getByText(/pricing questions/i)).toBeInTheDocument();
    expect(screen.getByText(/faq/i)).toBeInTheDocument();
    expect(
      screen.getByText(/can i switch plans anytime/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/is there a free trial for paid plans/i)
    ).toBeInTheDocument();
  });

  it("allows toggling FAQ items", async () => {
    renderWithRouter(<Pricing />);
    const faqButton = screen.getByText(/can i switch plans anytime/i);
    await userEvent.click(faqButton);
    expect(
      screen.getByText(/you can upgrade or downgrade your plan at any time/i)
    ).toBeInTheDocument();
  });

  it("renders CTA section", () => {
    renderWithRouter(<Pricing />);
    expect(screen.getByText(/still have questions/i)).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /contact us/i }).length
    ).toBeGreaterThan(0);
  });

  it("renders footer with links", () => {
    renderWithRouter(<Pricing />);
    expect(
      screen.getByText(
        /the premier marketplace for creative professionals in telangana and andhra pradesh\./i
      )
    ).toBeInTheDocument();
    expect(screen.getAllByText(/for clients/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/for freelancers/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/support/i).length).toBeGreaterThan(0);
  });

  it("displays yearly savings text", async () => {
    renderWithRouter(<Pricing />);
    const yearlyButton = screen.getByRole("button", { name: /yearly/i });
    await userEvent.click(yearlyButton);
    expect(screen.getAllByText(/save/i).length).toBeGreaterThan(0);
  });

  it("has subscribe buttons for each plan", () => {
    renderWithRouter(<Pricing />);
    expect(
      screen.getAllByRole("button", { name: /get started/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: /subscribe now/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: /go premium/i }).length
    ).toBeGreaterThan(0);
  });
});

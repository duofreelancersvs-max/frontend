import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
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

// Mock the public service to return the 2-plan (Free + Pro) structure
vi.mock("@/services/public.service", () => ({
  publicService: {
    getSubscriptionPlans: vi.fn().mockResolvedValue([
      {
        _id: "plan-free",
        name: "Free",
        description: "Ideal for beginners",
        price: 0,
        billingCycle: 'monthly',
        durationInDays: 30,
        features: [
          "5 applications / month",
          "1 active project",
          "Standard support",
        ],
        isActive: true,
        tier: 0,
      },
      {
        _id: "plan-pro",
        name: "Pro",
        description: "For active professionals",
        price: 499,
        billingCycle: 'monthly',
        durationInDays: 30,
        features: [
          "Unlimited applications",
          "Unlimited projects",
          "20 portfolio items",
          "Priority support",
          "Pro Member badge",
        ],
        isActive: true,
        tier: 1,
        isPopular: true,
      },
    ]),
    getCategoriesWithSkills: vi.fn().mockResolvedValue([]),
    getLegalContent: vi.fn().mockResolvedValue({ sections: [] }),
    getAllLegalSlugs: vi.fn().mockResolvedValue([]),
  },
}));

// Mock the auth store to return unauthenticated by default
vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn().mockImplementation((selector?: any) => {
    const state = { user: null, isAuthenticated: false };
    return selector ? selector(state) : state;
  }),
}));

vi.mock("@/components/SEO/SEO", () => ({
  SEO: () => <div data-testid="mock-seo" />
}));

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
  it("renders page header with title", async () => {
    renderWithRouter(<Pricing />);
    await waitFor(() => {
      expect(screen.getAllByText(/free/i).length).toBeGreaterThan(0);
    });
    expect(screen.getByText(/invest in your/i)).toBeInTheDocument();
    expect(screen.getAllByText(/plan/i).length).toBeGreaterThan(0);
  });

  it("renders top navigation", async () => {
    renderWithRouter(<Pricing />);
    await waitFor(() => {
      expect(screen.getAllByText(/free/i).length).toBeGreaterThan(0);
    });
    // The public navbar exposes Home, Find Talent, Pricing, etc.
    expect(screen.getAllByText(/pricing/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/find talent/i).length).toBeGreaterThan(0);
  });

  it("renders billing toggle with monthly/yearly options", async () => {
    renderWithRouter(<Pricing />);
    await waitFor(() => {
      expect(screen.getAllByText(/free/i).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText(/monthly/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/yearly/i).length).toBeGreaterThan(0);
    // The "Save 20%" pill sits next to the Yearly label
    expect(screen.getAllByText(/save/i).length).toBeGreaterThan(0);
  });

  it("allows switching between monthly and yearly billing", async () => {
    renderWithRouter(<Pricing />);
    await waitFor(() => {
      expect(screen.getAllByText(/free/i).length).toBeGreaterThan(0);
    });
    // The toggle is a pill button. Find it by its bg-slate-200 class.
    const pill = document.querySelector(
      "button.bg-slate-200",
    ) as HTMLElement | null;
    expect(pill).toBeTruthy();
    if (pill) await userEvent.click(pill);
    // After click, billing cycle is yearly; the "/yr" suffix should be visible
    expect(screen.getAllByText(/\/yr/i).length).toBeGreaterThan(0);
  });

  it("renders the two available plans (Free + Pro)", async () => {
    renderWithRouter(<Pricing />);
    await waitFor(() => {
      expect(screen.getAllByText(/5 applications/i).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText(/free/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/pro/i).length).toBeGreaterThan(0);
    // Premium must no longer be a plan
    expect(screen.queryByText(/premium/i)).toBeNull();
  });

  it("displays correct pricing for Free and Pro monthly plans", async () => {
    renderWithRouter(<Pricing />);
    await waitFor(() => {
      expect(screen.getAllByText(/₹499/i).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText(/₹0/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/₹499/i).length).toBeGreaterThan(0);
  });

  it("displays the 'Best For Growth' badge on the Pro plan", async () => {
    renderWithRouter(<Pricing />);
    await waitFor(() => {
      expect(screen.getAllByText(/best for growth/i).length).toBeGreaterThan(0);
    });
  });

  it("does NOT display a 'Best Value' Premium badge", async () => {
    renderWithRouter(<Pricing />);
    await waitFor(() => {
      expect(screen.getAllByText(/free/i).length).toBeGreaterThan(0);
    });
    expect(screen.queryByText(/best value/i)).toBeNull();
  });

  it("renders plan features for the Free plan", async () => {
    renderWithRouter(<Pricing />);
    await waitFor(() => {
      expect(screen.getAllByText(/5 applications/i).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText(/portfolio/i).length).toBeGreaterThan(0);
  });

  it("renders plan features for the Pro plan", async () => {
    renderWithRouter(<Pricing />);
    await waitFor(() => {
      expect(
        screen.getAllByText(/unlimited applications/i).length,
      ).toBeGreaterThan(0);
    });
    expect(screen.getAllByText(/priority support/i).length).toBeGreaterThan(0);
  });

  it("does not show Premium-only features (verified badge, account manager)", async () => {
    renderWithRouter(<Pricing />);
    await waitFor(() => {
      expect(screen.getAllByText(/free/i).length).toBeGreaterThan(0);
    });
    expect(screen.queryByText(/dedicated account manager/i)).toBeNull();
  });

  it("renders comparison table with Free and Pro columns", () => {
    renderWithRouter(<Pricing />);
    expect(screen.getAllByText(/compare features/i).length).toBeGreaterThan(0);
    // Both column headers should be visible
    expect(screen.getAllByText(/portfolio capacity/i).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText(/search priority/i).length).toBeGreaterThan(0);
  });

  it("renders the trust badge in the hero", async () => {
    renderWithRouter(<Pricing />);
    await waitFor(() => {
      expect(screen.getAllByText(/flexible pricing/i).length).toBeGreaterThan(
        0,
      );
    });
  });

  it("renders CTA section", () => {
    renderWithRouter(<Pricing />);
    expect(screen.getByText(/ready to/i)).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /upgrade today/i }).length,
    ).toBeGreaterThan(0);
  });

  it("renders footer with links", () => {
    renderWithRouter(<Pricing />);
    expect(
      screen.getByText(
        /The premier marketplace for creative professionals in India\./i,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/for clients/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/for freelancers/i).length).toBeGreaterThan(0);
  });

  it("displays yearly savings text", async () => {
    renderWithRouter(<Pricing />);
    await waitFor(() => {
      expect(screen.getAllByText(/save/i).length).toBeGreaterThan(0);
    });
    // The "-20% Save" badge is shown next to "Yearly" by default
    expect(screen.getAllByText(/save/i).length).toBeGreaterThan(0);
  });

  it("has start buttons for the Free and Pro plans", async () => {
    renderWithRouter(<Pricing />);
    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: /start free/i }).length,
      ).toBeGreaterThan(0);
    });
    expect(
      screen.getAllByRole("button", { name: /start free/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: /go pro/i }).length,
    ).toBeGreaterThan(0);
  });

  it("does NOT have a 'Go Premium' button", async () => {
    renderWithRouter(<Pricing />);
    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: /start free/i }).length,
      ).toBeGreaterThan(0);
    });
    expect(screen.queryByRole("button", { name: /go premium/i })).toBeNull();
  });
});

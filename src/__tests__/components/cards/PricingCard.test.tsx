import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PricingCard from "@/components/cards/PricingCard";

describe("PricingCard", () => {
  const defaultProps = {
    name: "Basic Plan",
    price: "₹999",
    billingPeriod: "/month",
    features: ["Feature 1", "Feature 2", "Feature 3"],
    onSelectPlan: vi.fn(),
  };

  it("renders pricing card with all content", () => {
    render(<PricingCard {...defaultProps} />);
    
    expect(screen.getByText("Basic Plan")).toBeInTheDocument();
    expect(screen.getByText("₹999")).toBeInTheDocument();
    expect(screen.getByText("/month")).toBeInTheDocument();
    expect(screen.getByText("Feature 1")).toBeInTheDocument();
    expect(screen.getByText("Feature 2")).toBeInTheDocument();
    expect(screen.getByText("Feature 3")).toBeInTheDocument();
  });

  it("displays 'Most Popular' badge when isPopular is true", () => {
    render(<PricingCard {...defaultProps} isPopular={true} />);
    expect(screen.getByText("Most Popular")).toBeInTheDocument();
  });

  it("does not display 'Most Popular' badge by default", () => {
    render(<PricingCard {...defaultProps} />);
    expect(screen.queryByText("Most Popular")).not.toBeInTheDocument();
  });

  it("applies popular styling when isPopular is true", () => {
    const { container } = render(<PricingCard {...defaultProps} isPopular={true} />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("border-2");
    expect(card).toHaveClass("border-teal");
    expect(card).toHaveClass("scale-105");
  });

  it("applies regular styling when isPopular is false", () => {
    const { container } = render(<PricingCard {...defaultProps} isPopular={false} />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("border");
    expect(card).toHaveClass("border-slate-200");
  });

  it("calls onSelectPlan when CTA button is clicked", async () => {
    render(<PricingCard {...defaultProps} />);
    const button = screen.getByRole("button", { name: /get started/i });
    await userEvent.click(button);
    expect(defaultProps.onSelectPlan).toHaveBeenCalledTimes(1);
  });

  it("displays custom CTA label", () => {
    render(<PricingCard {...defaultProps} ctaLabel="Subscribe Now" />);
    expect(screen.getByRole("button", { name: "Subscribe Now" })).toBeInTheDocument();
  });

  it("uses default billing period when not provided", () => {
    const propsWithoutBilling = { ...defaultProps };
    delete (propsWithoutBilling as { billingPeriod?: string }).billingPeriod;
    render(<PricingCard {...propsWithoutBilling} />);
    expect(screen.getByText("/month")).toBeInTheDocument();
  });

  it("renders all features with check icons", () => {
    render(<PricingCard {...defaultProps} />);
    const features = screen.getAllByText(/Feature/);
    expect(features).toHaveLength(3);
  });

  it("applies custom className", () => {
    const { container } = render(<PricingCard {...defaultProps} className="custom-pricing" />);
    expect(container.firstChild).toHaveClass("custom-pricing");
  });

  it("displays plan name with correct styling", () => {
    const { rerender } = render(<PricingCard {...defaultProps} isPopular={true} />);
    const name = screen.getByText("Basic Plan");
    expect(name).toHaveClass("text-teal");

    rerender(<PricingCard {...defaultProps} isPopular={false} />);
    expect(name).toHaveClass("text-text-primary");
  });

  it("renders empty features list without errors", () => {
    render(<PricingCard {...defaultProps} features={[]} />);
    expect(screen.getByText("Basic Plan")).toBeInTheDocument();
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });
});

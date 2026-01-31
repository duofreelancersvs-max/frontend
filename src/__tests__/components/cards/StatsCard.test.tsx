import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Users, DollarSign, Briefcase } from "lucide-react";
import StatsCard from "@/components/cards/StatsCard";

describe("StatsCard", () => {
  const defaultProps = {
    label: "Total Users",
    value: "1,234",
    icon: Users,
  };

  it("renders label and value", () => {
    render(<StatsCard {...defaultProps} />);
    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
  });

  it("renders icon", () => {
    render(<StatsCard {...defaultProps} />);
    const icon = document.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("displays positive trend with TrendingUp icon", () => {
    render(<StatsCard {...defaultProps} trend={{ value: 12.5, isPositive: true }} />);
    expect(screen.getByText("12.5%")).toBeInTheDocument();
    const trendIcon = document.querySelector(".text-success-green");
    expect(trendIcon).toBeInTheDocument();
  });

  it("displays negative trend with TrendingDown icon", () => {
    render(<StatsCard {...defaultProps} trend={{ value: -5.3, isPositive: false }} />);
    expect(screen.getByText("5.3%")).toBeInTheDocument();
    const trendIcon = document.querySelector(".text-red-600");
    expect(trendIcon).toBeInTheDocument();
  });

  it("does not render trend when not provided", () => {
    const { container } = render(<StatsCard {...defaultProps} />);
    const trendElements = container.querySelectorAll(".text-success-green, .text-red-600");
    expect(trendElements.length).toBe(0);
  });

  it("applies default icon colors", () => {
    render(<StatsCard {...defaultProps} />);
    const iconContainer = document.querySelector(".bg-royal-blue\\/10");
    expect(iconContainer).toBeInTheDocument();
  });

  it("applies custom icon colors", () => {
    render(
      <StatsCard
        {...defaultProps}
        iconColorClass="text-teal"
        iconBgClass="bg-teal/10"
      />
    );
    const iconContainer = document.querySelector(".bg-teal\\/10");
    expect(iconContainer).toBeInTheDocument();
  });

  it("handles numeric values", () => {
    render(<StatsCard {...defaultProps} value={567} />);
    expect(screen.getByText("567")).toBeInTheDocument();
  });

  it("handles string values", () => {
    render(<StatsCard {...defaultProps} value="₹50K" />);
    expect(screen.getByText("₹50K")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<StatsCard {...defaultProps} className="custom-stats" />);
    expect(container.firstChild).toHaveClass("custom-stats");
  });

  it("renders different icons correctly", () => {
    const { rerender } = render(<StatsCard {...defaultProps} icon={DollarSign} />);
    expect(document.querySelector("svg")).toBeInTheDocument();

    rerender(<StatsCard {...defaultProps} icon={Briefcase} />);
    expect(document.querySelector("svg")).toBeInTheDocument();
  });
});
